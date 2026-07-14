import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).parent.parent
DEPENDENCIES = {
    "latexcitation": "https://github.com/HirokiHamaguchi/latexcitation.git",
    "latexlint": "https://github.com/HirokiHamaguchi/latexlint.git",
}


def latest_sha(repo_url: str) -> str:
    result = subprocess.run(
        ["git", "ls-remote", repo_url, "refs/heads/master"],
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.split()[0]


def write_json(path: Path, data: dict):
    path.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def package_dependency(repo_url: str, sha: str) -> str:
    return f"git+{repo_url}#{sha}"


def lock_resolved_dependency(name: str, sha: str) -> str:
    return f"git+ssh://git@github.com/HirokiHamaguchi/{name}.git#{sha}"


def run_update_git_dependency_shas():
    package_path = ROOT / "package.json"
    lock_path = ROOT / "package-lock.json"

    package_data = json.loads(package_path.read_text(encoding="utf-8"))
    lock_data = json.loads(lock_path.read_text(encoding="utf-8"))

    for name, repo_url in DEPENDENCIES.items():
        sha = latest_sha(repo_url)
        dependency = package_dependency(repo_url, sha)

        package_data["dependencies"][name] = dependency
        lock_data["packages"][""]["dependencies"][name] = dependency

        package_entry = lock_data["packages"][f"node_modules/{name}"]
        package_entry["resolved"] = lock_resolved_dependency(name, sha)
        package_entry.pop("integrity", None)

        print(f"{name}: {sha}")

    write_json(package_path, package_data)
    write_json(lock_path, lock_data)


if __name__ == "__main__":
    run_update_git_dependency_shas()
