import sys
from PIL import Image, ImageDraw, ImageFont

FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

def font(size):
    return ImageFont.truetype(FONT_PATH, size)

def patch_row(draw, boxes, replacement, pad=2, fsize=12):
    """boxes: list of (left, top, width, height) tuples that make up one legend row.
    Whites-out the union bounding box and writes replacement text starting at the row's left edge."""
    lefts = [b[0] for b in boxes]
    tops = [b[1] for b in boxes]
    rights = [b[0] + b[2] for b in boxes]
    bottoms = [b[1] + b[3] for b in boxes]
    x0, y0, x1, y1 = min(lefts) - pad, min(tops) - pad, max(rights) + 60, max(bottoms) + pad
    draw.rectangle([x0, y0, x1, y1], fill=(255, 255, 255))
    draw.text((x0, y0), replacement, fill=(0, 0, 0), font=font(fsize))

def process(path, rows, out_path, fsize=12):
    im = Image.open(path).convert("RGB")
    draw = ImageDraw.Draw(im)
    for boxes, replacement in rows:
        patch_row(draw, boxes, replacement, fsize=fsize)
    im.save(out_path)
    print("Saved", out_path)

# ---------------- image16 (Traps of April, Damage May) ----------------
rows16 = [
    ([(749, 206, 39, 15)], "Winery"),
    ([(749, 228, 68, 14), (822, 228, 30, 14)], "General agriculture"),
    ([(749, 251, 37, 13), (790, 250, 6, 11), (801, 250, 33, 11)], "Vineyard support"),
    ([(750, 272, 57, 14)], "Grove"),
    ([(750, 293, 47, 11), (802, 293, 44, 14)], "Riparian forest"),
    ([(718, 313, 93, 16)], "Housing"),
    ([(749, 337, 34, 11)], "Olive grove"),
    ([(749, 358, 27, 11), (781, 361, 14, 8)], "Bare soil"),
    ([(749, 380, 34, 11)], "Vineyard"),
    ([(720, 517, 108, 13)], "DAMAGE_MAY_15"),
]
process("Naziru_HALILU_Grape_Moth_Reports_extract/word/media/image16.png", rows16,
        "grape_moth_translated/image16.png", fsize=12)

# ---------------- image17 (Traps of June, Damage July) ----------------
rows17 = [
    ([(754, 118, 39, 14)], "Winery"),
    ([(754, 139, 67, 14), (826, 139, 30, 14)], "General agriculture"),
    ([(753, 161, 37, 14), (795, 161, 6, 11), (806, 161, 32, 11)], "Vineyard support"),
    ([(754, 183, 57, 14)], "Grove"),
    ([(754, 204, 48, 11), (807, 203, 44, 15)], "Riparian forest"),
    ([(723, 224, 93, 16)], "Housing"),
    ([(754, 247, 33, 11)], "Olive grove"),
    ([(754, 269, 26, 11), (786, 272, 14, 8)], "Bare soil"),
    ([(753, 291, 35, 11)], "Vineyard"),
]
process("Naziru_HALILU_Grape_Moth_Reports_extract/word/media/image17.png", rows17,
        "grape_moth_translated/image17.png", fsize=12)

# ---------------- image18 (Traps of August, Damage September) ----------------
rows18 = [
    ([(724, 239, 37, 14)], "Winery"),
    ([(724, 260, 63, 13), (792, 260, 28, 13)], "General agriculture"),
    ([(696, 279, 62, 16), (763, 281, 6, 11), (773, 281, 30, 11)], "Vineyard support"),
    ([(725, 302, 53, 13)], "Grove"),
    ([(725, 322, 44, 10), (774, 322, 41, 13)], "Riparian forest"),
    ([(725, 344, 57, 13)], "Housing"),
    ([(724, 364, 32, 10)], "Olive grove"),
    ([(696, 383, 53, 14), (754, 387, 13, 8)], "Bare soil"),
    ([(696, 404, 60, 14)], "Vineyard"),
    ([(697, 506, 45, 30), (753, 516, 42, 12)], "DAMAGE_SEP_10"),
]
process("Naziru_HALILU_Grape_Moth_Reports_extract/word/media/image18.png", rows18,
        "grape_moth_translated/image18.png", fsize=12)
