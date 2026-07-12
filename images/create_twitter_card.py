import os

from PIL import Image, ImageDraw, ImageFont

os.chdir(os.path.dirname(os.path.abspath(__file__)))

width = 1200
height = 628
svg_size = 400
icon_y = (height - svg_size) // 2
font_size = 180
text_y_base = height // 2

cards = {
    "latexpages": ("LaTeX", "Pages"),
    "latexlint": ("LaTeX", "Lint"),
    "latexcitation": ("LaTeX", "Citation"),
    "latexwriting": ("LaTeX", "Writing"),
}


def get_icon_x(text: str) -> int:
    return int(80 + (len(text) - 4) * (50 - 80) / (7 - 4))


def get_font(size: int) -> ImageFont.FreeTypeFont:
    font_candidates = [
        "times.ttf",
        os.path.join(os.environ.get("WINDIR", r"C:\Windows"), "Fonts", "times.ttf"),
    ]
    for font_path in font_candidates:
        if os.path.exists(font_path):
            return ImageFont.truetype(font_path, size)
    return ImageFont.load_default(size=size)


def create_card(name: str, lines: tuple[str, str]) -> None:
    img = Image.new("RGB", (width, height), color="white")
    icon = Image.open("mainIcon512.png").resize(
        (svg_size, svg_size), Image.Resampling.LANCZOS
    )
    icon_x = get_icon_x(lines[1])
    text_x = icon_x + svg_size + 100
    img.paste(icon, (icon_x, icon_y), icon if icon.mode == "RGBA" else None)

    draw = ImageDraw.Draw(img)
    font = get_font(font_size)
    draw.text(
        (text_x, text_y_base - font_size * 1.0),
        lines[0],
        fill="#333333",
        font=font,
    )
    draw.text(
        (text_x, text_y_base - font_size * 0.1),
        lines[1],
        fill="#333333",
        font=font,
    )

    output_path = f"{name}_twitter_card.png"
    img.save(output_path)
    print(f"Twitter card image created: {output_path}")


for card_name, card_lines in cards.items():
    create_card(card_name, card_lines)
