# -*- coding: utf-8 -*-
"""One-off: move 图片/ into images/reference-styles/ with canonical style filenames."""
import pathlib
import shutil

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "图片"
DEST = ROOT / "images" / "reference-styles"

# (source relative to SRC, dest relative to DEST)
MOVES = [
    ("美食/极简留白.png", "美食/极简留白.png"),
    ("美食/俯视平铺.png", "美食/服饰平铺.png"),
    ("美食/带手入镜.png", "美食/带手入镜.png"),
    ("美食/45度微距.png", "美食/45度微距.png"),
    # 误放在美食下：应属生活用品
    ("美食/高低错落层次摆拍.png", "生活用品/高低错落层次摆拍.png"),
]

SHOES = [
    "鞋服/上脚动态特写.png",
    "鞋服/光影塑性.png",  # rename to 光影塑形.png
    "鞋服/场景化摆拍.png",
    "鞋服/局部细节特写.png",
    "鞋服/极简平铺.png",
    "鞋服/极简折叠.png",
    "鞋服/模特上身.png",
    "鞋服/氛围感挂拍.png",
    "鞋服/鞋子侧视.png",
    "鞋服/鞋子俯视.png",
    "鞋服/鞋子氛围感.png",
    "鞋服/鞋子细节特写.png",
]

DAILY = [
    "生活用品/几何矩阵排列.png",
    "生活用品/手持产品特写.png",
    "生活用品/数码产品科技感.png",
    "生活用品/极简居中.png",
    "生活用品/生活场景融入.png",
]


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    for sub in ("美食", "鞋服", "生活用品"):
        (DEST / sub).mkdir(parents=True, exist_ok=True)

    def move_pair(rel_src: str, rel_dst: str):
        a = SRC.joinpath(*rel_src.split("/"))
        b = DEST.joinpath(*rel_dst.split("/"))
        if not a.is_file():
            print("SKIP missing:", a)
            return
        b.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(a), str(b))
        print("OK", rel_src, "->", rel_dst)

    for s, d in MOVES:
        move_pair(s, d)

    for rel in SHOES:
        dst = rel
        if rel.endswith("光影塑性.png"):
            dst = "鞋服/光影塑形.png"
        move_pair(rel, dst)

    for rel in DAILY:
        move_pair(rel, rel)

    # 特写放大：用户未提供同名文件，用「带手入镜」复制一份占位（可日后替换）
    hand = DEST / "美食" / "带手入镜.png"
    closeup = DEST / "美食" / "特写放大.png"
    if hand.is_file() and not closeup.is_file():
        shutil.copy2(hand, closeup)
        print("OK copy placeholder -> 美食/特写放大.png (from 带手入镜)")

    extras = ROOT / "images" / "reference-styles" / "_extras"
    stray = SRC / "生活用品" / "美食特写.png"
    if stray.is_file():
        extras.mkdir(parents=True, exist_ok=True)
        shutil.move(str(stray), str(extras / "美食特写.png"))
        print("OK move ambiguous -> _extras/美食特写.png")

    stock = ROOT / "images" / "reference-styles" / "_stock"
    for p in SRC.glob("jimeng*.png"):
        stock.mkdir(parents=True, exist_ok=True)
        shutil.move(str(p), str(stock / p.name))
        print("OK move root jimeng -> _stock/", p.name)


if __name__ == "__main__":
    main()
