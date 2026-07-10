import glob
import os
from pathlib import Path

import pymupdf


def pdf2png(pdf_file: str):
    doc = pymupdf.open(pdf_file)
    page = doc.load_page(0)
    pixmap = page.get_pixmap(dpi=600)  # type:ignore
    pixmap.save(pdf_file.replace(".pdf", ".png"), "png")


def make_png_files():
    root_dir = Path(__file__).parent.parent
    pdf_files = glob.glob(str(root_dir / "sample" / "**" / "*.pdf"), recursive=True)
    for pdf_file in pdf_files:
        print(f"Converting {pdf_file} to PNG...")
        pdf2png(pdf_file)
        png_file = pdf_file.replace(".pdf", ".png")
        assert os.path.exists(png_file)
        dest_file = root_dir / "public" / Path(png_file).relative_to(root_dir / "sample")
        dest_file.parent.mkdir(parents=True, exist_ok=True)
        os.replace(png_file, dest_file)


if __name__ == "__main__":
    make_png_files()
