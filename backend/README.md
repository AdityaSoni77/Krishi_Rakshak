# KrishiRakshak AI model

The supplied dataset is a tomato-disease **object-detection** dataset. It contains 2,125 training, 419 validation, and 288 test images. The conversion step excludes `Tomato two spotted spider mites leaf` because it has only one image.

## One-time setup

Open PowerShell in this `backend` folder and run:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

## Train the model

```powershell
python prepare_dataset.py
python train.py
```

After training, the model weights will be at `runs/tomato_disease/weights/best.pt`.

## Start predictions for the web app

```powershell
uvicorn app:app --reload --port 8000
```

Then, in a second PowerShell window at the project root:

```powershell
npm run dev
```

Upload a real tomato-leaf image. The frontend will call `http://127.0.0.1:8000/predict`; the "Trained AI model" badge confirms that a live model response was received. If the API/model is not running, the original demo fallback is retained so the hackathon screen never breaks.

## Scope note

The dataset is tomato-only. It cannot truthfully diagnose the wheat, rice, cotton, maize, soybean, potato, or sugarcane options in the interface yet. Train or collect separate labeled datasets before enabling real predictions for those crops.

The displayed severity is an estimate based on detected bounding-box coverage, not a clinically/agronomically validated severity score. It should be presented as a prototype estimate.
