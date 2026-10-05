#!/usr/bin/env python3
"""Smoke-test the packaged knowledge index search (mirrors DataWeave logic)."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "src" / "main" / "resources" / "knowledge-index.json"


def tokenize(text: str) -> list[str]:
    return [t for t in re.split(r"[^a-z0-9]+", text.lower()) if len(t) > 1]


def search(query: str, limit: int = 5) -> list[dict]:
    docs = json.loads(INDEX.read_text())["documents"]
    terms = tokenize(query)
    scored = []
    for doc in docs:
        haystack = f"{doc['title']}\n{doc['body']}".lower()
        score = 0
        for term in terms:
            matches = haystack.count(term)
            if not matches:
                continue
            score += matches + (4 if term in doc["title"].lower() else 0)
        if score > 0:
            scored.append({"id": doc["id"], "score": score})
    return sorted(scored, key=lambda h: -h["score"])[:limit]


def main() -> int:
    hits = search("Professional list price")
    assert hits and hits[0]["id"] == "product-catalog", hits
    hits = search("Deal Desk 25%")
    assert any(h["id"] == "discount-policy" for h in hits), hits
    hits = search("P1 Premium Support")
    assert any(h["id"] == "support-sla" for h in hits), hits
    print("ok: knowledge index smoke passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
