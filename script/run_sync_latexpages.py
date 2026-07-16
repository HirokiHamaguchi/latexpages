from pathlib import Path

from run_sync_latexlint import write_text


def run_sync_latexpages():
    root_dir = Path(__file__).parent.parent
    source = root_dir / "README.md"

    write_text(
        root_dir / "src" / "assets" / "latexpages_README.md",
        source.read_text(encoding="utf-8"),
    )


if __name__ == "__main__":
    run_sync_latexpages()
