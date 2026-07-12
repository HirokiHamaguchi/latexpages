from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

SCRIPT_DIR = Path(__file__).resolve().parent
LATEXPAGES_ROOT = SCRIPT_DIR.parent
WORKSPACE_ROOT = LATEXPAGES_ROOT.parent
DEFAULT_METADATA_PATH = SCRIPT_DIR / "project_metadata.json"


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_text(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8", newline="\n")
    print(f"Updated {path}")


def load_metadata(path: Path) -> dict[str, Any]:
    return json.loads(read_text(path))


def resolve_repo(project: dict[str, Any]) -> Path:
    return WORKSPACE_ROOT / project["repositoryDir"]


def resolve_project_path(repo: Path, relative_path: str) -> Path:
    return (repo / relative_path).resolve()


def update_package_json(repo: Path, package_config: dict[str, Any]) -> None:
    package_path = repo / "package.json"
    if not package_path.exists():
        return

    data = json.loads(read_text(package_path))
    for key in ["name", "displayName", "description"]:
        if key in package_config:
            data[key] = package_config[key]

    if "repositoryUrl" in package_config:
        data.setdefault("repository", {})["type"] = "git"
        data["repository"]["url"] = package_config["repositoryUrl"]
    if "bugsUrl" in package_config:
        data.setdefault("bugs", {})["url"] = package_config["bugsUrl"]

    content = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    write_text(package_path, content)

    lock_path = repo / "package-lock.json"
    if "name" in package_config and lock_path.exists():
        lock_data = json.loads(read_text(lock_path))
        lock_data["name"] = package_config["name"]
        lock_data.setdefault("packages", {}).setdefault("", {})["name"] = package_config["name"]
        lock_content = json.dumps(lock_data, indent=2, ensure_ascii=False) + "\n"
        write_text(lock_path, lock_content)


def find_heading_line(lines: list[str], heading: str) -> int:
    for index, line in enumerate(lines):
        if line.strip() == heading:
            return index
    raise ValueError(f"Heading not found: {heading}")


def replace_paragraph_after_heading(markdown: str, heading: str, paragraph: str) -> str:
    lines = markdown.splitlines()
    heading_index = find_heading_line(lines, heading)

    start = heading_index + 1
    while start < len(lines) and lines[start].strip() == "":
        start += 1

    end = start
    while end < len(lines) and lines[end].strip() != "":
        if end > start and lines[end].startswith("#"):
            break
        end += 1

    replacement = paragraph.splitlines()
    lines[start:end] = replacement
    return "\n".join(lines).rstrip() + "\n"


def replace_collection_items(markdown: str, items: list[dict[str, str]]) -> str:
    marker = "The collection currently includes:"
    lines = markdown.splitlines()
    try:
        marker_index = next(index for index, line in enumerate(lines) if line.strip() == marker)
    except StopIteration:
        return markdown

    start = marker_index + 1
    while start < len(lines) and lines[start].strip() == "":
        start += 1

    end = start
    while end < len(lines):
        stripped = lines[end].strip()
        if stripped.startswith("## "):
            break
        if stripped and not stripped.startswith("* "):
            break
        end += 1

    bullets = [
        f"* **[{item['label']}]({item['href']})**: {item['description']}"
        for item in items
    ]
    lines[start:end] = bullets + [""]
    return "\n".join(lines).rstrip() + "\n"


def update_readme(repo: Path, readme_config: dict[str, Any]) -> None:
    readme_path = repo / "README.md"
    if not readme_path.exists():
        return

    content = read_text(readme_path)
    if "lead" in readme_config:
        content = replace_paragraph_after_heading(
            content,
            readme_config["leadAfterHeading"],
            readme_config["lead"],
        )
    if "collectionItems" in readme_config:
        content = replace_collection_items(content, readme_config["collectionItems"])
    write_text(readme_path, content)


def set_meta_content(html: str, selector: str, value: str) -> str:
    pattern = re.compile(
        rf'(<meta\s+{selector}\s+content=)(["\'])(.*?)(\2)',
        flags=re.IGNORECASE | re.DOTALL,
    )
    return pattern.sub(lambda match: f"{match.group(1)}{match.group(2)}{value}{match.group(4)}", html)


def update_json_ld_description(html: str, description: str) -> str:
    pattern = re.compile(
        r'(<script\s+type=["\']application/ld\+json["\']>)(.*?)(\s*</script>)',
        flags=re.IGNORECASE | re.DOTALL,
    )

    def replace(match: re.Match[str]) -> str:
        try:
            data = json.loads(match.group(2))
        except json.JSONDecodeError:
            return match.group(0)
        data["description"] = description
        json_text = json.dumps(data, indent=2, ensure_ascii=False)
        indented_json = "\n".join(f"  {line}" for line in json_text.splitlines())
        return f"{match.group(1)}\n{indented_json}\n  </script>"

    return pattern.sub(replace, html)


def update_html_file(repo: Path, html_config: dict[str, str]) -> None:
    html_path = resolve_project_path(repo, html_config["path"])
    if not html_path.exists():
        return

    content = read_text(html_path)
    if "title" in html_config:
        content = re.sub(
            r"<title>.*?</title>",
            f"<title>{html_config['title']}</title>",
            content,
            count=1,
            flags=re.IGNORECASE | re.DOTALL,
        )
    if "description" in html_config:
        description = html_config["description"]
        content = set_meta_content(content, r'name=["\']description["\']', description)
        content = set_meta_content(content, r'property=["\']og:description["\']', description)
        content = set_meta_content(content, r'property=["\']twitter:description["\']', description)
        content = update_json_ld_description(content, description)
    write_text(html_path, content)


def longest_common_substring_length(left: str, right: str) -> int:
    # Dynamic programming with O(len(left) * len(right)) time and O(len(right)) space.
    if not left or not right:
        return 0

    previous = [0] * (len(right) + 1)
    best = 0
    for left_char in left:
        current = [0] * (len(right) + 1)
        for index, right_char in enumerate(right, start=1):
            if left_char == right_char:
                current[index] = previous[index - 1] + 1
                best = max(best, current[index])
        previous = current
    return best


def assert_text_mostly_contained(needle: str, haystack: str, target_path: Path) -> None:
    threshold = 0.95
    normalized_needle = " ".join(needle.split())
    normalized_haystack = " ".join(haystack.split())
    if not normalized_needle:
        return

    matched = longest_common_substring_length(normalized_needle, normalized_haystack)
    ratio = matched / len(normalized_needle)
    if ratio < threshold:
        percent = round(ratio * 100, 1)
        raise ValueError(
            f"README text is only {percent}% contained as a contiguous substring in {target_path}"
        )


def check_readme_includes(repo: Path, project: dict[str, Any]) -> None:
    lead = project.get("readme", {}).get("lead")
    if not lead:
        return

    for readme_path in project.get("readmeIncludes", []):
        target = resolve_project_path(repo, readme_path)
        if target.exists():
            assert_text_mostly_contained(lead, read_text(target), target)


def check_all_readme_includes(metadata: dict[str, Any]) -> None:
    for project in metadata["projects"].values():
        check_readme_includes(resolve_repo(project), project)


def format_ts_string(value: str) -> str:
    return "'" + value.replace("\\", "\\\\").replace("'", "\\'") + "'"


def write_project_metadata_ts(metadata: dict[str, Any]) -> None:
    route_names = {
        "latexlint": "LATEXLINT",
        "latexcitation": "LATEXCITATION",
        "latexwriting": "LATEXWRITING",
    }
    lines = [
        "import { ROUTES } from './routes';",
        "",
        "export const PROJECT_METADATA = {",
    ]

    for project_name, project in metadata["projects"].items():
        ui = project.get("ui")
        if not ui:
            continue

        lines.append(f"    {project_name}: {{")
        lines.append(f"        label: {format_ts_string(ui['label'])},")
        lines.append(f"        description: {format_ts_string(ui['description'])},")
        if "tagline" in ui:
            lines.append(f"        tagline: {format_ts_string(ui['tagline'])},")
        if "status" in ui:
            lines.append(f"        status: {format_ts_string(ui['status'])},")
        if project_name in route_names:
            lines.append(f"        path: ROUTES.{route_names[project_name]},")
        lines.append("    },")

    lines.extend([
        "} as const;",
        "",
        "export type ProjectMetadataKey = keyof typeof PROJECT_METADATA;",
        "",
    ])
    write_text(LATEXPAGES_ROOT / "src" / "constants" / "projectMetadata.ts", "\n".join(lines))


def run_sync_project_metadata() -> None:
    metadata = load_metadata(DEFAULT_METADATA_PATH)
    check_all_readme_includes(metadata)
    write_project_metadata_ts(metadata)
    for project_name, project in metadata["projects"].items():
        print(f"Syncing {project_name}")
        repo = resolve_repo(project)
        update_package_json(repo, project.get("package", {}))
        update_readme(repo, project.get("readme", {}))
        for html_config in project.get("html", []):
            update_html_file(repo, html_config)

if __name__ == "__main__":
    run_sync_project_metadata()
