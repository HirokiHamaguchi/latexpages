from __future__ import annotations

from dataclasses import dataclass
from typing import Any


PAGES_LABEL = "LaTeX Pages"
PAGES_DESCRIPTION = "Web versions of LaTeX tools and notes for academic writing"
PAGES_LEAD = f"{PAGES_LABEL} collects {PAGES_DESCRIPTION[0].lower()}{PAGES_DESCRIPTION[1:]}."
GITHUB_OWNER = "HirokiHamaguchi"


@dataclass(frozen=True)
class ToolProject:
    label: str
    article: str
    noun_phrase: str
    title: str
    status: str
    tagline_from_description: bool = False
    extra_html_paths: tuple[str, ...] = ()
    readme_includes: tuple[str, ...] = ()

    @property
    def description(self) -> str:
        first_letter = self.noun_phrase[0].upper()
        remaining_text = self.noun_phrase[1:]
        description = f"{first_letter}{remaining_text}"

        return description

    @property
    def description_sentence(self) -> str:
        description = self.description
        if description.endswith("."):
            return description

        return f"{description}."

    @property
    def lead(self) -> str:
        lead_text = f"{self.label} is {self.article} {self.noun_phrase}."

        return lead_text

    @property
    def readme_heading(self) -> str:
        if self.label == "LaTeX Lint":
            return "## Abstract"

        return f"# {self.label}"

    def package_metadata(self, project_name: str) -> dict[str, str]:
        repository_url = f"https://github.com/{GITHUB_OWNER}/{project_name}"
        package = {
            "description": self.description,
            "repositoryUrl": repository_url,
            "bugsUrl": f"{repository_url}/issues",
        }

        return package

    def ui_metadata(self) -> dict[str, str]:
        ui = {
            "label": self.label,
            "description": self.description_sentence,
            "status": self.status,
        }
        if self.tagline_from_description:
            ui["tagline"] = self.description

        return ui

    def readme_metadata(self) -> dict[str, str]:
        readme = {
            "leadAfterHeading": self.readme_heading,
            "lead": self.lead,
        }

        return readme

    def html_metadata(self, project_name: str) -> list[dict[str, str]]:
        html_paths = (
            f"../latexpages/{project_name}/index.html",
            *self.extra_html_paths,
        )
        html_entries = [
            {
                "path": path,
                "title": self.title,
                "description": self.lead,
            }
            for path in html_paths
        ]

        return html_entries

    def collection_item(self, project_name: str) -> dict[str, str]:
        item = {
            "label": self.label,
            "href": f"./{project_name}",
            "description": self.description_sentence,
        }

        return item

    def metadata(self, project_name: str) -> dict[str, Any]:
        project = {
            "repositoryDir": project_name,
            "package": self.package_metadata(project_name),
            "ui": self.ui_metadata(),
            "readme": self.readme_metadata(),
            "html": self.html_metadata(project_name),
        }
        if self.readme_includes:
            project["readmeIncludes"] = list(self.readme_includes)

        return project


TOOL_PROJECTS = {
    "latexlint": ToolProject(
        label="LaTeX Lint",
        article="a",
        noun_phrase="linter to detect common LaTeX and academic writing issues",
        title="LaTeX Lint - Online LaTeX Code Checker",
        status="available",
        tagline_from_description=True,
        extra_html_paths=(
            "redirect-site/index.html",
        ),
    ),
    "latexcitation": ToolProject(
        label="LaTeX Citation",
        article="an",
        noun_phrase="experimental citation consistency checker for LaTeX projects that visualizes BibTeX field usage",
        title="LaTeX Citation - BibTeX Field Usage Checker",
        status="construction",
        readme_includes=(
            "../latexpages/src/assets/latexcitation_README.md",
        ),
    ),
    "latexwriting": ToolProject(
        label="LaTeX Writing",
        article="an",
        noun_phrase="under-construction collection of notes and utilities for academic writing with LaTeX",
        title="LaTeX Writing - Academic Writing Notes",
        status="construction",
    ),
}


def build_metadata() -> dict[str, Any]:
    return {
        "projects": {
            "latexpages": {
                "repositoryDir": "latexpages",
                "package": {
                    "name": "latexpages",
                    "displayName": PAGES_LABEL,
                    "description": PAGES_DESCRIPTION,
                    "dependencies": {
                        project_name: (
                            f"https://github.com/{GITHUB_OWNER}/{project_name}"
                            "/archive/refs/heads/master.tar.gz"
                        )
                        for project_name in ["latexcitation", "latexlint"]
                    },
                },
                "ui": {
                    "label": PAGES_LABEL,
                    "description": f"{PAGES_DESCRIPTION}.",
                },
                "readme": {
                    "leadAfterHeading": "## About",
                    "lead": PAGES_LEAD,
                    "collectionItems": [
                        project.collection_item(project_name)
                        for project_name, project in TOOL_PROJECTS.items()
                    ],
                },
                "html": [
                    {
                        "path": "index.html",
                        "title": "LaTeX Pages - Academic LaTeX Tools",
                        "description": PAGES_LEAD,
                    },
                ],
            },
            **{
                project_name: project.metadata(project_name)
                for project_name, project in TOOL_PROJECTS.items()
            },
        },
    }
