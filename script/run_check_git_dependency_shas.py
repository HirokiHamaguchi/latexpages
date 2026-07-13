import json
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).parent.parent
DEPENDENCIES = {
    "latexcitation": "https://github.com/HirokiHamaguchi/latexcitation.git",
    "latexlint": "https://github.com/HirokiHamaguchi/latexlint.git",
}
PIN_PATTERN = re.compile(
    r"^git\+(?:https://github\.com/|ssh://git@github\.com/)"
    r"HirokiHamaguchi/([^/]+)\.git#([0-9a-f]{40})$"
)


def latest_sha(repo_url: str) -> str:
    result = subprocess.run(
        ["git", "ls-remote", repo_url, "refs/heads/master"],
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.split()[0]


def dependency_pin(package_json: str, name: str) -> str:
    data = json.loads(package_json)
    return data["dependencies"][name]


def lock_pins(package_lock: str, name: str) -> tuple[str, str]:
    data = json.loads(package_lock)
    root_pin = data["packages"][""]["dependencies"][name]
    resolved = data["packages"][f"node_modules/{name}"]["resolved"]
    return root_pin, resolved


def pinned_sha(pin: str, name: str) -> str | None:
    match = PIN_PATTERN.match(pin)
    if not match or match.group(1) != name:
        return None
    return match.group(2)


def main() -> int:
    package_json = (ROOT / "package.json").read_text(encoding="utf-8")
    package_lock = (ROOT / "package-lock.json").read_text(encoding="utf-8")
    failures = []

    for name, repo_url in DEPENDENCIES.items():
        pinned = dependency_pin(package_json, name)
        package_sha = pinned_sha(pinned, name)
        if package_sha is None:
            failures.append(f"{name}: not pinned to a git commit SHA: {pinned}")
            continue

        remote_sha = latest_sha(repo_url)
        if package_sha != remote_sha:
            failures.append(f"{name}: pinned {package_sha}, latest master is {remote_sha}")

        lock_root_pin, lock_resolved = lock_pins(package_lock, name)
        lock_root_sha = pinned_sha(lock_root_pin, name)
        if lock_root_sha != package_sha:
            failures.append(
                f"{name}: package-lock root dependency is {lock_root_pin}, but "
                f"package.json has {pinned}"
            )
        lock_resolved_sha = pinned_sha(lock_resolved, name)
        if lock_resolved_sha != package_sha:
            failures.append(
                f"{name}: package-lock resolved is {lock_resolved}, but "
                f"package.json has {pinned}"
            )

    if failures:
        print("Git dependency SHA check failed:")
        for failure in failures:
            print(f"  - {failure}")
        print("Run: python script/run_update_git_dependency_shas.py")
        return 1

    print("Git dependency SHAs are up to date.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
