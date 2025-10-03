from __future__ import annotations
from typing import AsyncGenerator, List
import asyncio
import random


class LocalLLMProvider:
    async def generate_stream(
        self,
        prompt: str,
        genre: str | None,
        tone: str | None,
        length: str,
        branching_options: int,
        emotional_intensity: int,
    ) -> AsyncGenerator[str, None]:
        # Deterministic-ish stub generation with token streaming
        random.seed(hash(prompt) % (2**32 - 1))
        base_sentences: List[str] = [
            f"In this {genre or 'tale'}, the mood is {tone or 'measured'}.",
            "The air hums with possibility as events unfold.",
            "Memories resurface, shaping the choices ahead.",
            "An unseen thread connects every action to consequence.",
            "The world responds, subtly at first, then undeniably.",
        ]
        target_words = {"short": 120, "medium": 220, "long": 360}.get(length, 120)
        body: str = " " .join(base_sentences)
        body = f"{prompt.strip().rstrip('.')}. " + body

        # Create options
        verbs = ["confront", "retreat", "investigate", "negotiate", "wait"]
        random.shuffle(verbs)
        options = verbs[: max(2, min(branching_options, 5))]
        options_text = " ".join([f"[Option {i+1}: {opt.title()}]" for i, opt in enumerate(options)])
        body += "\n\nWhat do you do? " + options_text

        tokens = body.split()
        if len(tokens) > target_words:
            tokens = tokens[:target_words]

        # Stream 2-4 tokens at a time
        i = 0
        while i < len(tokens):
            chunk = " ".join(tokens[i : i + random.randint(2, 4)])
            i += len(chunk.split())
            yield chunk + " "
            await asyncio.sleep(0.005)
