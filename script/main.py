import os

from make_404_fallback import make_404_fallback
from make_png_files import make_png_files
from run_sync_latexcitation import run_sync_latexcitation
from run_sync_latexlint import run_sync_latexlint
from run_sync_project_metadata import run_sync_project_metadata
from test_latexlint_config import test_latexlint_config
from test_npm_run import test_npm_run


def main():
    run_sync_latexlint()
    run_sync_latexcitation()
    run_sync_project_metadata()
    make_png_files()
    make_404_fallback()
    test_latexlint_config()
    test_npm_run()

    files = os.listdir(os.path.dirname(__file__))
    functions = []
    for f in files:
        if not f.endswith(".py"):
            continue
        if f.startswith("make_") or f.startswith("run_") or f.startswith("test_"):
            functions.append(f[:-3])

    executed_in_this_run = set()
    with open(__file__, "r", encoding="utf-8") as f:
        for line in f:
            for func in functions:
                if func in line and func not in executed_in_this_run:
                    executed_in_this_run.add(func)
    if any(func not in executed_in_this_run for func in functions):
        not_executed = ""
        for func in functions:
            if func not in executed_in_this_run:
                not_executed += f"  - {func}\n"
        raise Exception("Not executed functions:\n" + not_executed)

    print("All done!")


if __name__ == "__main__":
    main()
