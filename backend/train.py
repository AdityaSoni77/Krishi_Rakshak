"""Fine-tune a small YOLO model for the KrishiRakshak tomato-disease detector."""
from pathlib import Path
from ultralytics import YOLO

ROOT = Path(__file__).parent

if __name__ == "__main__":
    model = YOLO("yolo11n.pt")  # small enough for a hackathon laptop / GPU runtime
    model.train(
        data=str(ROOT / "data" / "yolo" / "data.yaml"),
        epochs=20,  # practical CPU baseline; increase after the demo if validation keeps improving
        imgsz=640,
        batch=8,
        project=str(ROOT / "runs"),
        name="tomato_disease",
        patience=6,
    )
