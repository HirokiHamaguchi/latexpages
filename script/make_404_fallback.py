from __future__ import annotations

import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"


def make_404_fallback() -> None:
    source = DIST / "index.html"
    target = DIST / "404.html"
    if not source.exists():
        raise FileNotFoundError(f"{source} does not exist. Run vite build first.")
    shutil.copyfile(source, target)


if __name__ == "__main__":
    make_404_fallback()
