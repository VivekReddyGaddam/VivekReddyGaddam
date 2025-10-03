import time
from typing import Dict, Tuple
from fastapi import HTTPException, Request

# In-memory token bucket per (ip)
_request_counters: Dict[str, Tuple[int, float]] = {}
_WINDOW_SECS = 60.0


def rate_limit_dependency(limit_per_minute: int):
    async def _guard(request: Request) -> None:
        client_ip = request.client.host if request.client else "unknown"
        now = time.monotonic()
        count, window_start = _request_counters.get(client_ip, (0, now))
        if now - window_start >= _WINDOW_SECS:
            count = 0
            window_start = now
        count += 1
        _request_counters[client_ip] = (count, window_start)
        if count > limit_per_minute:
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")
    return _guard
