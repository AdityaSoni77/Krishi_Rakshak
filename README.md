AI / Machine Learning

KrishiRakshak AI uses Computer Vision for crop disease detection.

Model Pipeline
Input Image
     ↓
Image Preprocessing
     ↓
Computer Vision Model
     ↓
Disease Classification
     ↓
Confidence Score
     ↓
Severity Analysis
     ↓
Farmer Advisory

The disease detection model can be trained using an agricultural image dataset and deployed through the backend prediction API.

🛠️ Technology Stack
Frontend
React
Vite
JavaScript / TypeScript
HTML5
CSS3
Backend
Python
FastAPI
Uvicorn
REST API
AI / Computer Vision
Python
OpenCV
YOLO / Computer Vision model
Roboflow dataset
Data & Intelligence
Weather data
Geospatial information
Disease reports
Risk analysis
Outbreak clustering
Development Tools
Git
GitHub
VS Code
📁 Project Structure
Krishi_Rakshak/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   └── ...
│
├── backend/
│   ├── model/
│   ├── API/
│   ├── training/
│   └── README.md
│
├── public/
│
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .gitignore
└── README.md

The exact structure may change as the project evolves.

🚀 Getting Started
1. Clone the Repository
git clone https://github.com/AdityaSoni77/Krishi_Rakshak.git
cd Krishi_Rakshak
2. Install Frontend Dependencies
npm install
3. Start the Frontend
npm run dev

The frontend will normally be available at:

http://localhost:5173
🐍 Backend Setup

Navigate to the backend directory:

cd backend

Create a virtual environment:

Windows
python -m venv venv

Activate it:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Start the FastAPI server:

uvicorn app:app --reload --port 8000

Backend API:

http://127.0.0.1:8000
🔌 API Architecture

The frontend communicates with the backend through REST APIs.

React Frontend
      │
      │ HTTP Request
      ▼
FastAPI Backend
      │
      ├── Image Processing
      │
      ├── AI Model
      │
      ├── Disease Prediction
      │
      └── Risk / Advisory Logic
      │
      ▼
Prediction Response
      │
      ▼
React Dashboard
📸 Application Flow
Farmer
Open Application
      ↓
Upload / Capture Crop Image
      ↓
AI Disease Detection
      ↓
View Result
      ↓
Check Severity
      ↓
Receive Advisory
      ↓
Submit Report
Agriculture Officer
Open Dashboard
      ↓
View Reports
      ↓
Analyze Risk Areas
      ↓
Identify Disease Clusters
      ↓
Verify Cases
      ↓
Send Area Alert
🎯 Target Users
👨‍🌾 Farmers

For quick crop disease detection and actionable agricultural guidance.

👩‍🌾 Agricultural Officers

For monitoring crop-health reports and identifying potential outbreaks.

🏛️ Agriculture Departments

For data-driven crop disease monitoring and response planning.

🌱 Future Scope

The platform can be extended with:

📱 Dedicated Android application
🌐 More regional languages
🛰️ Satellite-based crop monitoring
🌦️ Advanced weather-based disease prediction
🤖 Improved AI disease detection models
🐛 Pest identification
📍 Real-time outbreak heatmaps
🔔 Automated farmer notifications
📡 Improved offline-first synchronization
📈 Historical crop-health analytics
☁️ Cloud deployment
🔐 Secure farmer and officer authentication
🏆 Hackathon Project

KrishiRakshak AI is developed as a prototype for the Smart India Hackathon (SIH).

The project focuses on using Artificial Intelligence and Computer Vision to improve early detection and management of crop diseases and pest infestations.

👥 Team

Developed by our team for the Smart India Hackathon.

Detect Early. Act Smarter. Protect Every Crop.

📜 License

This project is developed as a hackathon prototype.
git commit -m "Improve project README"
git push
