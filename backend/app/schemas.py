from __future__ import annotations
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    prompt: str = Field(..., max_length=500)
    genre: Optional[str] = None
    tone: Optional[str] = None
    length: Optional[str] = Field(default="short")  # short/medium/long
    branching_complexity: Optional[int] = Field(default=3, ge=2, le=10)
    emotional_intensity: Optional[int] = Field(default=5, ge=1, le=10)
    seed_elements: Optional[Dict[str, Any]] = None
    domain: Optional[str] = Field(default="general")
    story_id: Optional[str] = None


class ContinueRequest(BaseModel):
    story_id: str
    from_node_id: str
    choice_id: str


class CreateStoryResponse(BaseModel):
    story_id: str


class LoreIngestResponse(BaseModel):
    sections_ingested: int


class StoryGraphDTO(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
