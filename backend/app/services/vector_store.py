from __future__ import annotations
from typing import Dict, List, Tuple
import numpy as np
import re


class InMemoryVectorStore:
    def __init__(self) -> None:
        self._store: Dict[str, List[Tuple[str, np.ndarray]]] = {}
        self._dim: int = 512

    def _embed(self, text: str) -> np.ndarray:
        # Very lightweight hashing-based embedding
        vector = np.zeros(self._dim, dtype=np.float32)
        tokens = re.findall(r"\w+", text.lower())
        for token in tokens:
            idx = hash(token) % self._dim
            vector[idx] += 1.0
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector /= norm
        return vector

    def add(self, namespace: str, text: str) -> None:
        embedding = self._embed(text)
        self._store.setdefault(namespace, []).append((text, embedding))

    def batch_add(self, namespace: str, texts: List[str]) -> int:
        for t in texts:
            if t.strip():
                self.add(namespace, t)
        return len(self._store.get(namespace, []))

    def most_similar(self, namespace: str, query: str, top_k: int = 3) -> List[Tuple[str, float]]:
        if namespace not in self._store or not self._store[namespace]:
            return []
        query_vec = self._embed(query)
        results: List[Tuple[str, float]] = []
        for text, vec in self._store[namespace]:
            score = float(np.dot(query_vec, vec))
            results.append((text, score))
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]
