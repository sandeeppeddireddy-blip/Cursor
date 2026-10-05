#!/usr/bin/env python3
"""Rebuild knowledge-index.json from knowledge/*.md."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KNOWLEDGE_DIR = ROOT / "src" / "main" / "resources" / "knowledge"
OUT = ROOT / "src" / "main" / "resources" / "knowledge-index.json"


def main() -> None:
    docs = []
    for path in sorted(KNOWLEDGE_DIR.glob("*.md")):
        body = path.read_text(encoding="utf-8")
        title_match = re.search(r"^#\s+(.+)$", body, re.M)
        docs.append(
            {
                "id": path.stem,
                "title": title_match.group(1).strip() if title_match else path.stem,
                "path": f"knowledge/{path.name}",
                "body": body,
            }
        )
    OUT.write_text(json.dumps({"documents": docs}, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(docs)} documents to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
