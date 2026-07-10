import json
from pathlib import Path
from urllib.request import urlopen


RAW_BASE_URL = "https://raw.githubusercontent.com/hari64boli64/latexlint/master"


def fetch_bytes(path: str) -> bytes:
    with urlopen(f"{RAW_BASE_URL}/{path}", timeout=30) as response:
        return response.read()


def fetch_text(path: str) -> str:
    return fetch_bytes(path).decode("utf-8")


def write_bytes(path: Path, content: bytes):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(content)


def write_text(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def make_web_config(package_data: dict) -> dict:
    properties = package_data["contributes"]["configuration"]["properties"]
    config_data = {
        key.replace("latexlint.", ""): value for key, value in properties.items()
    }
    config_data["disabledRules"]["default"] = []
    return config_data


def run_sync_latexlint():
    root_dir = Path(__file__).parent.parent

    write_text(root_dir / "src" / "assets" / "README.md", fetch_text("README.md"))

    package_data = json.loads(fetch_text("package.json"))
    write_text(
        root_dir / "src" / "assets" / "auto_generated_config.json",
        json.dumps(make_web_config(package_data), indent=4, ensure_ascii=False) + "\n",
    )

    write_bytes(root_dir / "public" / "lint.pdf", fetch_bytes("sample/lint.pdf"))
    for mode in ["Dark", "Light"]:
        write_bytes(
            root_dir / "public" / f"lintIcon{mode}_copied.svg",
            fetch_bytes(f"images/lintIcon{mode}.svg"),
        )


if __name__ == "__main__":
    run_sync_latexlint()
