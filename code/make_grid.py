import sys, os, math
from PIL import Image, ImageDraw, ImageFont

def load_font(size):
    for p in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
              "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"]:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def make_grid(image_paths, out_path, cols=None, panel_w=900, pad=14, label_size=34):
    n = len(image_paths)
    if cols is None:
        cols = 3 if n > 4 else (2 if n > 1 else 1)
    rows = math.ceil(n / cols)
    letters = [chr(ord('A') + i) for i in range(n)]

    # First pass: determine panel height based on aspect ratio, using a common height per row
    imgs = []
    for p in image_paths:
        im = Image.open(p).convert("RGB")
        imgs.append(im)

    # scale each image to panel_w, keep aspect ratio, then pad to max height in its row
    scaled = []
    for im in imgs:
        w, h = im.size
        new_h = int(h * (panel_w / w))
        scaled.append(im.resize((panel_w, new_h), Image.LANCZOS))

    # compute row heights
    row_heights = []
    for r in range(rows):
        row_imgs = scaled[r*cols:(r+1)*cols]
        if row_imgs:
            row_heights.append(max(im.size[1] for im in row_imgs))

    total_w = cols * panel_w + (cols + 1) * pad
    total_h = sum(row_heights) + (rows + 1) * pad + rows * label_size + rows*6

    canvas = Image.new("RGB", (total_w, total_h), "white")
    draw = ImageDraw.Draw(canvas)
    font = load_font(label_size - 4)

    y = pad
    idx = 0
    for r in range(rows):
        rh = row_heights[r]
        x = pad
        for c in range(cols):
            if idx >= n:
                break
            im = scaled[idx]
            # plain label (no colored bar) above the image
            label_y = y
            draw.text((x + 2, label_y + 2), f"({letters[idx]})", fill=(0, 0, 0), font=font)
            img_y = label_y + label_size + 4
            # center image vertically within row height if shorter
            off = (rh - im.size[1]) // 2
            canvas.paste(im, (x, img_y + off))
            # border
            draw.rectangle([x, label_y, x + panel_w, img_y + rh], outline=(120,120,120), width=2)
            x += panel_w + pad
            idx += 1
        y += rh + label_size + 6 + pad

    canvas.save(out_path, quality=92)
    print(f"Saved {out_path}  ({cols}x{rows} grid, {n} panels, {total_w}x{total_h}px)")

if __name__ == "__main__":
    # args: outpath cols img1 img2 ...
    out = sys.argv[1]
    cols = int(sys.argv[2]) if sys.argv[2] != "auto" else None
    imgs = sys.argv[3:]
    make_grid(imgs, out, cols=cols)
