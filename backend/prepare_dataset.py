"""Convert the Roboflow CSV annotations to YOLO detection labels.

Run once before training:
    python prepare_dataset.py
"""
from __future__ import annotations

import csv
import shutil
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).parent
SOURCE = ROOT / "data" / "crop-disease"
OUTPUT = ROOT / "data" / "yolo"

# The final class has one annotated image only, so it is intentionally excluded.
CLASSES = [
    "Tomato leaf",
    "Tomato leaf bacterial spot",
    "Tomato Early blight leaf",
    "Tomato leaf late blight",
    "Tomato leaf mosaic virus",
    "Tomato leaf yellow virus",
    "Tomato mold leaf",
    "Tomato Septoria leaf spot",
]
CLASS_IDS = {name: index for index, name in enumerate(CLASSES)}


def convert_split(split: str) -> None:
    image_dir = SOURCE / split
    target_images = OUTPUT / "images" / split
    target_labels = OUTPUT / "labels" / split
    target_images.mkdir(parents=True, exist_ok=True)
    target_labels.mkdir(parents=True, exist_ok=True)

    boxes: dict[str, list[dict[str, str]]] = defaultdict(list)
    with (image_dir / "_annotations.csv").open(newline="", encoding="utf-8") as file:
        for row in csv.DictReader(file):
            if row["class"] in CLASS_IDS:
                boxes[row["filename"]].append(row)

    for filename, rows in boxes.items():
        source_image = image_dir / filename
        if not source_image.exists():
            continue
        shutil.copy2(source_image, target_images / filename)
        width, height = float(rows[0]["width"]), float(rows[0]["height"])
        lines = []
        for row in rows:
            x1, y1, x2, y2 = (float(row[key]) for key in ("xmin", "ymin", "xmax", "ymax"))
            center_x, center_y = ((x1 + x2) / 2 / width, (y1 + y2) / 2 / height)
            box_width, box_height = ((x2 - x1) / width, (y2 - y1) / height)
            lines.append(f"{CLASS_IDS[row['class']]} {center_x:.6f} {center_y:.6f} {box_width:.6f} {box_height:.6f}")
        (target_labels / f"{Path(filename).stem}.txt").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    for split in ("train", "valid", "test"):
        convert_split(split)
    names = "\n".join(f"  {index}: {name}" for index, name in enumerate(CLASSES))
    (OUTPUT / "data.yaml").write_text(
        f"path: {OUTPUT.resolve().as_posix()}\ntrain: images/train\nval: images/valid\ntest: images/test\nnames:\n"
        f"{names}\n",
        encoding="utf-8",
    )
    print(f"YOLO dataset ready at {OUTPUT}")


if __name__ == "__main__":
    main()
