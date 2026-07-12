import json
from pathlib import Path


LATEXPAGES_ROOT = Path(__file__).parent.parent
WORKSPACE_ROOT = LATEXPAGES_ROOT.parent
LATEXLINT_ROOT = WORKSPACE_ROOT / "latexlint"


def write_bytes(path: Path, content: bytes):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(content)


def write_text(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8", newline="\n")


def make_web_config(package_data: dict) -> dict:
    properties = package_data["contributes"]["configuration"]["properties"]
    config_data = {
        key.replace("latexlint.", ""): value for key, value in properties.items()
    }
    config_data["disabledRules"]["default"] = []
    return config_data


def run_sync_latexlint():
    write_text(
        LATEXPAGES_ROOT / "src" / "assets" / "latexlint_README.md",
        (LATEXLINT_ROOT / "README.md").read_text(encoding="utf-8"),
    )

    package_data = json.loads(
        (LATEXLINT_ROOT / "package.json").read_text(encoding="utf-8")
    )
    write_text(
        LATEXPAGES_ROOT / "src" / "assets" / "auto_generated_config.json",
        json.dumps(make_web_config(package_data), indent=4, ensure_ascii=False) + "\n",
    )

    write_bytes(
        LATEXPAGES_ROOT / "public" / "lint.pdf",
        (LATEXLINT_ROOT / "sample" / "lint.pdf").read_bytes(),
    )
    for mode in ["Dark", "Light"]:
        write_text(
            LATEXPAGES_ROOT / "public" / f"lintIcon{mode}_copied.svg",
            (LATEXLINT_ROOT / "images" / f"lintIcon{mode}.svg").read_text(
                encoding="utf-8"
            ),
        )


if __name__ == "__main__":
    run_sync_latexlint()
