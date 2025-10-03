from __future__ import annotations
from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from typing import Dict, Optional
import asyncio
import json

from .config import settings
from .schemas import (
    GenerateRequest,
    ContinueRequest,
    CreateStoryResponse,
    LoreIngestResponse,
    StoryGraphDTO,
)
from .rate_limit import rate_limit_dependency
from .models.story import StoryGraph
from .services.vector_store import InMemoryVectorStore
from .services.llm_provider import LocalLLMProvider
from .services.story_engine import StoryEngine


app = FastAPI(title=settings.app_name)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory stores (per-process)
story_store: Dict[str, StoryGraph] = {}
vector_store = InMemoryVectorStore()
llm = LocalLLMProvider()
engine = StoryEngine(vector_store=vector_store, llm=llm)


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.post("/api/story", response_model=CreateStoryResponse, dependencies=[Depends(rate_limit_dependency(settings.rate_limit_per_minute))])
async def create_story() -> CreateStoryResponse:
    graph = StoryGraph()
    story_id = str(len(story_store) + 1)
    story_store[story_id] = graph
    return CreateStoryResponse(story_id=story_id)


@app.get("/api/graph/{story_id}", response_model=StoryGraphDTO)
async def get_graph(story_id: str) -> StoryGraphDTO:
    graph = story_store.get(story_id)
    if not graph:
        return StoryGraphDTO(nodes=[], edges=[])
    return StoryGraphDTO(**graph.to_dict())


@app.post("/api/export/{story_id}", response_model=StoryGraphDTO)
async def export_graph(story_id: str) -> StoryGraphDTO:
    graph = story_store.get(story_id)
    if not graph:
        return StoryGraphDTO(nodes=[], edges=[])
    return StoryGraphDTO(**graph.to_dict())


@app.post("/api/import", response_model=CreateStoryResponse)
async def import_graph(payload: StoryGraphDTO) -> CreateStoryResponse:
    graph = StoryGraph.from_dict(payload.model_dump())
    story_id = str(len(story_store) + 1)
    story_store[story_id] = graph
    return CreateStoryResponse(story_id=story_id)


@app.post("/api/lore/{story_id}", response_model=LoreIngestResponse, dependencies=[Depends(rate_limit_dependency(settings.rate_limit_per_minute))])
async def upload_lore(story_id: str, file: UploadFile = File(...)) -> LoreIngestResponse:
    content = (await file.read()).decode("utf-8", errors="ignore")
    # very simple split into sections by blank lines
    sections = [s.strip() for s in content.split("\n\n") if s.strip()]
    namespace = f"lore:{story_id}"
    vector_store.batch_add(namespace, sections)
    return LoreIngestResponse(sections_ingested=len(sections))


async def _stream_sse_from_generator(async_iterable):
    async for chunk in async_iterable:
        data = json.dumps({"type": "token", "text": chunk})
        yield f"data: {data}\n\n"
        await asyncio.sleep(0)


@app.post("/api/generate")
async def generate(req: GenerateRequest, guard=Depends(rate_limit_dependency(settings.rate_limit_per_minute))):
    story_id = req.story_id
    if not story_id:
        resp = await create_story()
        story_id = resp.story_id
    graph = story_store[story_id]

    node, choices = await engine.generate_initial_segment(
        story_graph=graph,
        prompt=req.prompt,
        genre=req.genre,
        tone=req.tone,
        length=req.length or "short",
        branching_options=req.branching_complexity or 3,
        emotional_intensity=req.emotional_intensity or 5,
        lore_namespace=f"lore:{story_id}",
    )

    async def event_generator():
        # send a start event with story_id and node_id
        start = json.dumps({"type": "start", "story_id": story_id, "node_id": node.id})
        yield f"data: {start}\n\n"
        # stream tokens
        async for token in llm.generate_stream(
            prompt=req.prompt,
            genre=req.genre,
            tone=req.tone,
            length=req.length or "short",
            branching_options=req.branching_complexity or 3,
            emotional_intensity=req.emotional_intensity or 5,
        ):
            data = json.dumps({"type": "token", "text": token})
            yield f"data: {data}\n\n"
        # finalize node text with the accumulated text handled on client; here we do nothing
        # send choices
        done = json.dumps({
            "type": "done",
            "node_id": node.id,
            "choices": [{"id": c_id, "label": label} for c_id, label in choices],
        })
        yield f"data: {done}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/api/continue")
async def continue_story(req: ContinueRequest, guard=Depends(rate_limit_dependency(settings.rate_limit_per_minute))):
    story_id = req.story_id
    graph = story_store.get(story_id)
    if not graph:
        return JSONResponse(status_code=404, content={"detail": "Story not found"})

    # We need a prompt to continue. For the stub, re-use the previous node text if any, else a default.
    prompt = graph.nodes.get(req.from_node_id).text if req.from_node_id in graph.nodes else "Continue the narrative"

    node, choices = await engine.continue_segment(
        story_graph=graph,
        from_node_id=req.from_node_id,
        choice_id=req.choice_id,
        prompt=prompt or "Continue the narrative",
        genre=None,
        tone=None,
        length="short",
        branching_options=3,
        emotional_intensity=5,
        lore_namespace=f"lore:{story_id}",
    )

    async def event_generator():
        start = json.dumps({"type": "start", "story_id": story_id, "node_id": node.id})
        yield f"data: {start}\n\n"
        async for token in llm.generate_stream(
            prompt=prompt,
            genre=None,
            tone=None,
            length="short",
            branching_options=3,
            emotional_intensity=5,
        ):
            data = json.dumps({"type": "token", "text": token})
            yield f"data: {data}\n\n"
        done = json.dumps({
            "type": "done",
            "node_id": node.id,
            "choices": [{"id": c_id, "label": label} for c_id, label in choices],
        })
        yield f"data: {done}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
