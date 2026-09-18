"""Prediction API used by the React frontend.

Start after training with: uvicorn app:app --reload --port 8000
"""
from __future__ import annotations

import io
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO

ROOT = Path(__file__).parent
def newest_weights() -> Path | None:
    """Use the newest successful run (Ultralytics appends -2, -3, etc.)."""
    candidates = list((ROOT / "runs").glob("tomato_disease*/weights/best.pt"))
    return max(candidates, key=lambda path: path.stat().st_mtime) if candidates else None

app = FastAPI(title="KrishiRakshak Prediction API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
model: YOLO | None = None


def get_model() -> YOLO:
    global model
    weights = newest_weights()
    if weights is None:
        raise HTTPException(503, "Model not trained yet. Run prepare_dataset.py, then train.py.")
    if model is None:
        model = YOLO(str(weights))
    return model


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ready": newest_weights() is not None}


@app.post("/predict")
async def predict(image: UploadFile = File(...)) -> dict:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(415, "Please upload an image file.")
    try:
        picture = Image.open(io.BytesIO(await image.read())).convert("RGB")
    except Exception as error:
        raise HTTPException(400, "The uploaded file is not a valid image.") from error

    result = get_model()(picture, conf=0.25, verbose=False)[0]
    if not result.boxes or len(result.boxes) == 0:
        return {"detected": False, "label": "No disease detected", "confidence": 0, "boxes": []}

    best = max(result.boxes, key=lambda box: float(box.conf[0]))
    class_id = int(best.cls[0])
    confidence = round(float(best.conf[0]) * 100)
    boxes = [
        {"label": result.names[int(box.cls[0])], "confidence": round(float(box.conf[0]) * 100), "xyxy": [round(float(v)) for v in box.xyxy[0]]}
        for box in result.boxes
    ]
    # This is only a visible-box coverage estimate, not agronomic disease severity.
    covered_area = sum(max(0, (box["xyxy"][2] - box["xyxy"][0]) * (box["xyxy"][3] - box["xyxy"][1])) for box in boxes)
    coverage_pct = min(100, round(covered_area / (picture.width * picture.height) * 100))
    return {
        "detected": True,
        "label": result.names[class_id],
        "confidence": confidence,
        "coveragePct": coverage_pct,
        "boxes": boxes,
    }
