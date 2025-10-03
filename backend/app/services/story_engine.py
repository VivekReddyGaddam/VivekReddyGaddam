from __future__ import annotations
from typing import Dict, List, Tuple
from .llm_provider import LocalLLMProvider
from .vector_store import InMemoryVectorStore
from ..models.story import StoryGraph, StoryNode


class StoryEngine:
    def __init__(self, vector_store: InMemoryVectorStore, llm: LocalLLMProvider) -> None:
        self.vector_store = vector_store
        self.llm = llm

    async def generate_initial_segment(
        self,
        story_graph: StoryGraph,
        prompt: str,
        genre: str | None,
        tone: str | None,
        length: str,
        branching_options: int,
        emotional_intensity: int,
        lore_namespace: str,
    ) -> Tuple[StoryNode, List[Tuple[str, str]]]:
        # Retrieve top lore snippets (if any) to guide generation
        _ = self.vector_store.most_similar(lore_namespace, prompt, top_k=3)
        # For the stub, we do not inject, but this is where it would happen

        # Streamed text will be handled by caller; we return a placeholder node
        node = story_graph.add_node(text="")
        # Create placeholder choices (will be refined by parsing or caller)
        default_choices = [("confront", "Confront"), ("investigate", "Investigate"), ("retreat", "Retreat")]
        choice_pairs: List[Tuple[str, str]] = []
        for _, label in default_choices[: max(2, branching_options)]:
            ch = story_graph.add_choice(node.id, label)
            choice_pairs.append((ch.id, label))
        return node, choice_pairs

    async def continue_segment(
        self,
        story_graph: StoryGraph,
        from_node_id: str,
        choice_id: str,
        prompt: str,
        genre: str | None,
        tone: str | None,
        length: str,
        branching_options: int,
        emotional_intensity: int,
        lore_namespace: str,
    ) -> Tuple[StoryNode, List[Tuple[str, str]]]:
        _ = self.vector_store.most_similar(lore_namespace, prompt, top_k=3)
        node = story_graph.add_node(text="")
        # Link the choice to this new node
        story_graph.connect_choice(from_node_id, choice_id, node.id)
        choice_pairs: List[Tuple[str, str]] = []
        for label in ["Advance", "Reconsider", "Hold"][: max(2, branching_options)]:
            ch = story_graph.add_choice(node.id, label)
            choice_pairs.append((ch.id, label))
        return node, choice_pairs
