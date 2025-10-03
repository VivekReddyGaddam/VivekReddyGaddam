from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, List, Optional
import uuid


@dataclass
class Choice:
    id: str
    label: str
    to_node_id: Optional[str] = None


@dataclass
class StoryNode:
    id: str
    text: str
    choices: List[Choice] = field(default_factory=list)


@dataclass
class StoryGraph:
    nodes: Dict[str, StoryNode] = field(default_factory=dict)
    edges: List[tuple] = field(default_factory=list)  # (from_id, to_id, label)

    def add_node(self, text: str) -> StoryNode:
        node_id = str(uuid.uuid4())
        node = StoryNode(id=node_id, text=text, choices=[])
        self.nodes[node_id] = node
        return node

    def add_choice(self, node_id: str, label: str) -> Choice:
        choice_id = str(uuid.uuid4())
        choice = Choice(id=choice_id, label=label, to_node_id=None)
        self.nodes[node_id].choices.append(choice)
        return choice

    def connect_choice(self, from_node_id: str, choice_id: str, to_node_id: str) -> None:
        # Update choice to point to the new node
        from_node = self.nodes[from_node_id]
        for choice in from_node.choices:
            if choice.id == choice_id:
                choice.to_node_id = to_node_id
                break
        self.edges.append((from_node_id, to_node_id, choice_id))

    def to_dict(self) -> dict:
        return {
            "nodes": [
                {
                    "id": node.id,
                    "text": node.text,
                    "choices": [
                        {"id": c.id, "label": c.label, "to": c.to_node_id}
                        for c in node.choices
                    ],
                }
                for node in self.nodes.values()
            ],
            "edges": [
                {"from": f, "to": t, "via": label} for (f, t, label) in self.edges
            ],
        }

    @staticmethod
    def from_dict(data: dict) -> "StoryGraph":
        graph = StoryGraph()
        node_map: Dict[str, StoryNode] = {}
        for nd in data.get("nodes", []):
            node = StoryNode(id=nd["id"], text=nd.get("text", ""))
            node_map[node.id] = node
            graph.nodes[node.id] = node
        for nd in data.get("nodes", []):
            node = node_map[nd["id"]]
            for cd in nd.get("choices", []):
                choice = Choice(id=cd["id"], label=cd.get("label", ""), to_node_id=cd.get("to"))
                node.choices.append(choice)
        for ed in data.get("edges", []):
            graph.edges.append((ed.get("from"), ed.get("to"), ed.get("via")))
        return graph
