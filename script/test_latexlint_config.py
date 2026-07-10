import json
from pathlib import Path
from typing import Any, Dict


def load_latexlint_config() -> Dict[str, Any]:
    package_json_path = (
        Path(__file__).parent.parent
        / "node_modules"
        / "latexlint"
        / "package.json"
    )
    with open(package_json_path, "r", encoding="utf-8") as f:
        package_data = json.load(f)
    properties = (
        package_data.get("contributes", {})
        .get("configuration", {})
        .get("properties", {})
    )
    return {
        key.replace("latexlint.", ""): value
        for key, value in properties.items()
        if key.startswith("latexlint.")
    }


def load_web_config() -> Dict[str, Any]:
    config_path = (
        Path(__file__).parent.parent
        / "src"
        / "assets"
        / "auto_generated_config.json"
    )
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def test_latexlint_config():
    package_config = load_latexlint_config()
    web_config = load_web_config()

    for key, value in package_config.items():
        if key == "disabledRules":
            assert isinstance(value, dict), "disabledRules should be a dictionary"
            for key2, value2 in value.items():
                web_value2 = web_config.get(key, {}).get(key2)
                if key2 == "default":
                    assert len(value2) > 0
                    assert len(web_value2) == 0
                    continue
                assert value2 == web_value2, (
                    f"Mismatch for disabledRules.{key2}: "
                    f"package.json has {value2}, web config has {web_value2}"
                )
        else:
            web_value = web_config.get(key)
            assert value == web_value, (
                f"Mismatch for {key}: package.json has {value}, "
                f"web config has {web_value}"
            )

    print("test_latexlint_config ok!")


if __name__ == "__main__":
    test_latexlint_config()
