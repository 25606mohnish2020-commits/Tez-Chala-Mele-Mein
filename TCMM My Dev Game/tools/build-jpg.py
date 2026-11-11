# Makes the .jpg every page plate is actually served as, from its .png master.
# Run from the game folder whenever a page export (or "Page 35 aligned.png",
# see build-plate.ps1) changes:   python tools/build-jpg.py
#
# Why. The plates are full-screen 1920x1080 paintings with no transparency,
# and as PNGs they are ~1.9 MB each — twelve of them made the game a 22 MB
# download before its first question, which is most of why the deployed link
# took so long to open. As JPEGs they are 0.25-0.5 MB each and look the same:
# quality 92, measured at 43-46 dB PSNR against the PNG, which is past the
# point where a difference can be seen. JPEG rather than WebP because every
# browser on every device shows it, old iPads included.
#
# Two settings matter beyond quality:
#   subsampling=0  full-resolution colour (4:4:4). The cartoon outlines and the
#                  red/brown rings keep their crisp edges, and — the reason it
#                  is not optional — every 8x8 block is then encoded on its
#                  own. The trail eraser shows "Page 35 aligned" through a
#                  stroke laid over "Page 19" and relies on the two being the
#                  same picture wherever the stroke's edge falls. Blocks that
#                  are identical in the two PNGs stay bit-identical in the two
#                  JPEGs (verified: 31712 of 31712), so the eraser stays as
#                  seamless as it was. 4:2:0 would blend colour across blocks.
#   progressive    the picture appears whole and sharpens as it arrives,
#                  instead of drawing in from the top on a slow connection.
#
# The PNGs stay where they are as the masters; the game never loads them.

import pathlib
from PIL import Image

images = pathlib.Path(__file__).resolve().parent.parent / "Assets" / "Images"
for png in sorted(images.glob("*.png")):
    jpg = png.with_suffix(".jpg")
    Image.open(png).convert("RGB").save(
        jpg, "JPEG", quality=92, subsampling=0, progressive=True, optimize=True)
    print(f"{png.name:24s} {png.stat().st_size / 1048576:5.2f} MB  ->  "
          f"{jpg.name:24s} {jpg.stat().st_size / 1048576:5.2f} MB")
