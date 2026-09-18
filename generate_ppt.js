/**
 * KrishiRakshak AI — SIH26131
 * 6-Slide Professional Presentation with Flowchart Diagrams
 * Run:  node generate_ppt.cjs
 */

const pptxgen = require("pptxgenjs");

// ──────────────────────────────────────────────────────────────
//  DESIGN TOKENS  (matches the React app palette)
// ──────────────────────────────────────────────────────────────
const C = {
  dark:        "0B1929",   // deep navy (slide bg)
  panel:       "0F2236",   // card bg on dark slides
  border:      "1A3A52",   // card border
  green:       "177149",
  greenBright: "28A06A",
  greenSoft:   "E7F2EC",
  amber:       "BD7D18",
  sky:         "2C74C9",
  teal:        "218B81",
  red:         "BD3F2D",
  white:       "FFFFFF",
  lightBg:     "F4F8F6",
  card:        "FFFFFF",
  textDark:    "182A2F",
  textSub:     "5A6B70",
  lineLight:   "E4EAE7",
};

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";   // 10" × 5.625"

// Helpers
const dark  = () => { const s = pres.addSlide(); s.background = { color: C.dark };   return s; };
const light = () => { const s = pres.addSlide(); s.background = { color: C.lightBg }; return s; };

// Arrow line (horizontal right)
function arrowH(s, x, y, w, col) {
  s.addShape(pres.ShapeType.line, {
    x, y, w, h: 0,
    line: { color: col, width: 2, endArrowType: "arrow" },
  });
}
// Arrow line (vertical down)
function arrowV(s, x, y, h, col) {
  s.addShape(pres.ShapeType.line, {
    x, y, w: 0, h,
    line: { color: col, width: 2, endArrowType: "arrow" },
  });
}
// Process box
function box(s, x, y, w, h, text, fillCol, textCol, fontSize) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: fillCol },
    line: { color: C.border, width: 1.2 },
    rectRadius: 0.06,
  });
  s.addText(text, {
    x, y, w, h,
    fontSize: fontSize || 11,
    bold: true,
    color: textCol || C.white,
    align: "center",
    valign: "middle",
    fontFace: "Calibri",
    isTextBox: true,
    margin: 6,
  });
}
// Diamond decision box (rotated square)
function diamond(s, x, y, w, h, text, col) {
  s.addShape(pres.ShapeType.diamond, {
    x, y, w, h,
    fill: { color: col },
    line: { color: C.border, width: 1.2 },
  });
  s.addText(text, {
    x, y, w, h,
    fontSize: 9.5,
    bold: true,
    color: C.white,
    align: "center",
    valign: "middle",
    fontFace: "Calibri",
    isTextBox: true,
    margin: 4,
  });
}
// Slide number badge (top-right)
function slideNum(s, n, total) {
  s.addText(`${n} / ${total}`, {
    x: 9.2, y: 0.12, w: 0.7, h: 0.28,
    fontSize: 9, color: "4A6875",
    align: "right", fontFace: "Calibri", isTextBox: true,
  });
}
// Section label (top-left pill)
function pill(s, text, col) {
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.5, y: 0.18, w: 1.5, h: 0.3,
    fill: { color: col, transparency: 84 },
    line: { color: col, width: 1 },
    rectRadius: 0.04,
  });
  s.addText(text, {
    x: 0.5, y: 0.18, w: 1.5, h: 0.3,
    fontSize: 9, bold: true, color: col,
    align: "center", fontFace: "Calibri", isTextBox: true,
  });
}


// ══════════════════════════════════════════════════════════════
//  SLIDE 1 — TITLE
// ══════════════════════════════════════════════════════════════
{
  const s = dark();

  // ── Background geometry ──
  s.addShape(pres.ShapeType.ellipse, {
    x: 7.0, y: -2.2, w: 5.8, h: 5.8,
    fill: { color: C.green, transparency: 86 },
  });
  s.addShape(pres.ShapeType.ellipse, {
    x: -1.8, y: 3.8, w: 4.0, h: 4.0,
    fill: { color: C.sky, transparency: 92 },
  });

  // ── Left accent stripe ──
  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 0.35, h: 5.625,
    fill: { color: C.green },
  });

  // ── Logo mark ──
  s.addShape(pres.ShapeType.ellipse, {
    x: 0.7, y: 0.75, w: 1.0, h: 1.0,
    fill: { color: C.green },
  });
  s.addText("🌿", {
    x: 0.7, y: 0.75, w: 1.0, h: 1.0,
    fontSize: 26, align: "center", valign: "middle", isTextBox: true,
  });

  // ── Team / SIH tag ──
  s.addText("SIH26131   ·   Smart India Hackathon 2026   ·   Agriculture Theme", {
    x: 1.85, y: 0.85, w: 7.6, h: 0.32,
    fontSize: 10.5, color: "5A8A9A", fontFace: "Calibri", isTextBox: true,
  });

  // ── Main title ──
  s.addText("KrishiRakshak", {
    x: 1.85, y: 1.28, w: 7.5, h: 0.95,
    fontSize: 60, bold: true, color: C.white,
    fontFace: "Calibri", charSpacing: -1, isTextBox: true,
  });
  s.addText("AI", {
    x: 7.62, y: 1.28, w: 1.2, h: 0.95,
    fontSize: 60, bold: true, color: C.greenBright,
    fontFace: "Calibri", charSpacing: -1, isTextBox: true,
  });

  // ── Tagline ──
  s.addText("AI-Powered Crop Disease Detection & Advisory System", {
    x: 1.85, y: 2.32, w: 7.7, h: 0.45,
    fontSize: 17, color: C.greenBright, fontFace: "Calibri", isTextBox: true,
  });

  // ── Divider ──
  s.addShape(pres.ShapeType.rect, {
    x: 1.85, y: 2.9, w: 4.2, h: 0.04,
    fill: { color: C.green },
  });

  // ── Supporting tags ──
  const tags = ["🌾 Disease Detection", "🌦️ Weather Risk Engine", "🗺️ Outbreak Mapping", "🌐 EN / HI / MR"];
  tags.forEach((t, i) => {
    s.addShape(pres.ShapeType.roundRect, {
      x: 1.85 + i * 2.05, y: 3.12, w: 1.9, h: 0.36,
      fill: { color: C.panel },
      line: { color: C.border, width: 1 },
      rectRadius: 0.05,
    });
    s.addText(t, {
      x: 1.85 + i * 2.05, y: 3.12, w: 1.9, h: 0.36,
      fontSize: 9.5, color: "7AACBA",
      align: "center", fontFace: "Calibri", isTextBox: true,
    });
  });

  // ── Bottom bar ──
  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 4.87, w: 10, h: 0.755,
    fill: { color: C.green },
  });
  s.addText("Detect early.   Act smarter.   Protect every crop.", {
    x: 0.5, y: 4.97, w: 9.0, h: 0.46,
    fontSize: 15, bold: true, color: C.white,
    align: "center", fontFace: "Calibri", isTextBox: true,
  });
}


// ══════════════════════════════════════════════════════════════
//  SLIDE 2 — PROBLEM & SOLUTION
// ══════════════════════════════════════════════════════════════
{
  const s = dark();
  slideNum(s, 2, 6);

  // ── Left half: Problem ──
  s.addText("The Problem", {
    x: 0.42, y: 0.28, w: 4.4, h: 0.52,
    fontSize: 26, bold: true, color: C.white, fontFace: "Calibri", isTextBox: true,
  });

  const stats = [
    { num: "₹50,000 Cr", lbl: "Annual losses due\nto crop disease", col: C.red },
    { num: "70%",         lbl: "Farmers lack expert\ndisease diagnosis",  col: C.amber },
    { num: "3–7 Days",    lbl: "Delay before disease\nis confirmed",       col: C.sky },
    { num: "40%",         lbl: "Yield lost in severe\nundetected cases",   col: C.teal },
  ];
  stats.forEach((st, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const x = 0.38 + col * 2.25;
    const y = 0.95 + row * 2.05;
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w: 2.0, h: 1.85,
      fill: { color: C.panel },
      line: { color: st.col, width: 1.5 },
      rectRadius: 0.08,
    });
    s.addText(st.num, {
      x, y: y + 0.22, w: 2.0, h: 0.72,
      fontSize: 28, bold: true, color: st.col,
      align: "center", fontFace: "Calibri", isTextBox: true,
    });
    s.addText(st.lbl, {
      x, y: y + 0.96, w: 2.0, h: 0.72,
      fontSize: 9.5, color: "7AACBA",
      align: "center", fontFace: "Calibri", isTextBox: true,
    });
  });

  // ── Vertical divider ──
  s.addShape(pres.ShapeType.rect, {
    x: 4.84, y: 0.28, w: 0.04, h: 5.1,
    fill: { color: C.border },
  });

  // ── Right half: Solution ──
  s.addText("Our Solution", {
    x: 5.1, y: 0.28, w: 4.55, h: 0.52,
    fontSize: 26, bold: true, color: C.greenBright, fontFace: "Calibri", isTextBox: true,
  });

  const sols = [
    { ico: "📸", col: C.green,  ttl: "Instant AI Detection",   dsc: "Photo a leaf → YOLO model identifies disease in < 5 seconds with confidence score & severity." },
    { ico: "🧮", col: C.sky,   ttl: "Smart Risk Scoring",      dsc: "Weather + AI + GPS + nearby reports combined into a transparent 0–100 risk score." },
    { ico: "🗺️", col: C.teal, ttl: "Officer Dashboard",        dsc: "Real-time disease map, outbreak alerts, and a verification queue for district officers." },
    { ico: "🌐", col: C.amber, ttl: "Multilingual & Offline",   dsc: "English, Hindi, Marathi. Works without signal — reports sync when back online." },
  ];
  sols.forEach((sol, i) => {
    const y = 0.95 + i * 1.13;
    s.addShape(pres.ShapeType.ellipse, {
      x: 5.12, y: y + 0.18, w: 0.62, h: 0.62,
      fill: { color: sol.col },
    });
    s.addText(sol.ico, {
      x: 5.12, y: y + 0.18, w: 0.62, h: 0.62,
      fontSize: 16, align: "center", valign: "middle", isTextBox: true,
    });
    s.addText(sol.ttl, {
      x: 5.88, y: y + 0.1, w: 3.7, h: 0.35,
      fontSize: 12.5, bold: true, color: C.white, fontFace: "Calibri", isTextBox: true,
    });
    s.addText(sol.dsc, {
      x: 5.88, y: y + 0.46, w: 3.7, h: 0.55,
      fontSize: 9.5, color: "7AACBA", fontFace: "Calibri", isTextBox: true,
    });
  });

  // ── Bottom bar ──
  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 5.32, w: 10, h: 0.305,
    fill: { color: C.green },
  });
  s.addText("KrishiRakshak AI  ·  SIH26131", {
    x: 0.5, y: 5.35, w: 9, h: 0.25,
    fontSize: 9, color: C.white, fontFace: "Calibri", isTextBox: true,
  });
}


// ══════════════════════════════════════════════════════════════
//  SLIDE 3 — SYSTEM ARCHITECTURE DIAGRAM
// ══════════════════════════════════════════════════════════════
{
  const s = light();
  slideNum(s, 3, 6);
  pill(s, "ARCHITECTURE", C.sky);

  s.addText("System Architecture", {
    x: 2.2, y: 0.14, w: 7.0, h: 0.5,
    fontSize: 26, bold: true, color: C.textDark, fontFace: "Calibri", isTextBox: true,
  });

  // ── Layer labels (left) ──
  const layers = [
    { lbl: "User Layer",    y: 0.82, col: C.green },
    { lbl: "Frontend",      y: 1.72, col: C.sky },
    { lbl: "Backend / AI",  y: 2.62, col: C.teal },
    { lbl: "Intelligence",  y: 3.52, col: C.amber },
    { lbl: "Output",        y: 4.42, col: C.green },
  ];
  layers.forEach(l => {
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.12, y: l.y, w: 1.25, h: 0.68,
      fill: { color: l.col },
      rectRadius: 0.04,
    });
    s.addText(l.lbl, {
      x: 0.12, y: l.y, w: 1.25, h: 0.68,
      fontSize: 9, bold: true, color: C.white,
      align: "center", valign: "middle", fontFace: "Calibri", isTextBox: true,
    });
  });

  // ── Horizontal separator lines ──
  [1.68, 2.58, 3.48, 4.38].forEach(y => {
    s.addShape(pres.ShapeType.rect, {
      x: 1.5, y, w: 8.3, h: 0.02,
      fill: { color: C.lineLight },
    });
  });

  // ──────────────────────────────────────────────
  //  ROW 1 — User Layer
  // ──────────────────────────────────────────────
  box(s, 1.55, 0.86, 1.55, 0.6, "📱 Farmer App\n(Mobile)", C.green, C.white, 9.5);
  box(s, 3.6,  0.86, 1.55, 0.6, "👮 Officer App\n(Tablet / PC)", C.teal, C.white, 9.5);
  arrowH(s, 3.1, 1.16, 0.5, C.green);    // farmer → officer path
  arrowV(s, 2.32, 1.46, 0.26, C.sky);    // farmer → frontend
  arrowV(s, 4.37, 1.46, 0.26, C.teal);   // officer → frontend

  // ──────────────────────────────────────────────
  //  ROW 2 — Frontend
  // ──────────────────────────────────────────────
  box(s, 1.55, 1.72, 1.55, 0.62, "⚛ React 18\n+ Vite", C.sky, C.white, 9.5);
  box(s, 3.6,  1.72, 1.55, 0.62, "📶 Offline\nStorage", C.sky, C.white, 9.5);
  box(s, 5.65, 1.72, 1.55, 0.62, "📍 GPS &\nCamera API", C.sky, C.white, 9.5);
  arrowH(s, 3.1, 2.03, 0.5, C.sky);      // react → offline
  arrowH(s, 5.15, 2.03, 0.5, C.sky);     // offline → gps
  arrowV(s, 2.32, 2.34, 0.28, C.teal);   // react → backend

  // ──────────────────────────────────────────────
  //  ROW 3 — Backend / AI
  // ──────────────────────────────────────────────
  box(s, 1.55, 2.62, 1.55, 0.62, "🐍 FastAPI\n/predict", C.teal, C.white, 9.5);
  box(s, 3.6,  2.62, 1.55, 0.62, "🤖 YOLOv8\nModel", "177149", C.white, 9.5);
  box(s, 5.65, 2.62, 1.55, 0.62, "🌦️ Open-Meteo\nWeather API", C.sky, C.white, 9.5);
  arrowH(s, 3.1, 2.93, 0.5, C.teal);     // fastapi → yolo
  arrowH(s, 5.15, 2.93, 0.5, C.teal);    // yolo → weather
  arrowV(s, 2.32, 3.24, 0.28, C.amber);  // fastapi → risk engine
  arrowV(s, 4.37, 3.24, 0.28, C.amber);  // yolo → risk engine

  // ──────────────────────────────────────────────
  //  ROW 4 — Intelligence Layer
  // ──────────────────────────────────────────────
  box(s, 1.55, 3.52, 1.55, 0.62, "🧮 Risk\nEngine", C.amber, C.white, 9.5);
  box(s, 3.6,  3.52, 1.55, 0.62, "🗺️ Spatial\nClustering", C.amber, C.white, 9.5);
  box(s, 5.65, 3.52, 1.55, 0.62, "📋 IPM\nKnowledge Base", C.amber, C.white, 9.5);
  arrowH(s, 3.1, 3.83, 0.5, C.amber);
  arrowH(s, 5.15, 3.83, 0.5, C.amber);
  arrowV(s, 2.32, 4.14, 0.28, C.green);  // risk → output

  // ──────────────────────────────────────────────
  //  ROW 5 — Output
  // ──────────────────────────────────────────────
  box(s, 1.55, 4.42, 1.55, 0.62, "✅ IPM Advisory\n(EN/HI/MR)", C.green, C.white, 9.5);
  box(s, 3.6,  4.42, 1.55, 0.62, "🚨 Outbreak\nAlert", C.red, C.white, 9.5);
  box(s, 5.65, 4.42, 1.55, 0.62, "📊 Officer\nDashboard", C.teal, C.white, 9.5);
  arrowH(s, 3.1, 4.73, 0.5, C.green);
  arrowH(s, 5.15, 4.73, 0.5, C.red);

  // ── Legend ──
  [
    { col: C.green, lbl: "User / Output" },
    { col: C.sky,   lbl: "Frontend" },
    { col: C.teal,  lbl: "Backend / AI" },
    { col: C.amber, lbl: "Intelligence" },
  ].forEach((l, i) => {
    s.addShape(pres.ShapeType.rect, {
      x: 7.55 + i * 0.0, y: 0.86 + i * 0.34, w: 0.22, h: 0.22,
      fill: { color: l.col },
    });
    s.addText(l.lbl, {
      x: 7.82 + i * 0.0, y: 0.86 + i * 0.34, w: 1.8, h: 0.22,
      fontSize: 8.5, color: C.textSub, fontFace: "Calibri", isTextBox: true,
    });
  });
}


// ══════════════════════════════════════════════════════════════
//  SLIDE 4 — DETECTION WORKFLOW FLOWCHART
// ══════════════════════════════════════════════════════════════
{
  const s = dark();
  slideNum(s, 4, 6);
  pill(s, "WORKFLOW", C.greenBright);

  s.addText("Disease Detection Flowchart", {
    x: 2.2, y: 0.14, w: 7.5, h: 0.5,
    fontSize: 26, bold: true, color: C.white, fontFace: "Calibri", isTextBox: true,
  });

  // ── Main vertical flow (left column) ──
  //  Step boxes: x=0.5, width=2.0
  const BW = 2.0, BH = 0.52, BX = 0.42;
  const flowSteps = [
    { y: 0.78, lbl: "📷  Capture / Upload\nLeaf Photo",          col: C.green },
    { y: 1.54, lbl: "🔍  Image Quality\nCheck",                  col: C.sky },
    { y: 2.86, lbl: "🤖  YOLO Inference\n(FastAPI /predict)",    col: C.teal },
    { y: 3.62, lbl: "🧮  Risk Score\nCalculation",               col: C.amber },
    { y: 4.38, lbl: "📋  Generate IPM\nAdvisory",                col: C.greenBright },
  ];
  flowSteps.forEach(st => {
    box(s, BX, st.y, BW, BH, st.lbl, st.col, C.white, 9.5);
  });

  // Arrows between main steps (with gap for diamonds)
  arrowV(s, BX + BW / 2, 1.3, 0.24, C.greenBright);   // step1 → quality diamond
  arrowV(s, BX + BW / 2, 2.34, 0.52, C.greenBright);  // quality diamond OK → yolo
  arrowV(s, BX + BW / 2, 3.38, 0.24, C.greenBright);  // yolo diamond → risk
  arrowV(s, BX + BW / 2, 4.14, 0.24, C.greenBright);  // risk → advisory

  // ── Decision diamonds ──
  // Diamond 1: Quality OK?  y=1.54 → diamond at y=1.54-0.6
  diamond(s, BX + 0.38, 1.54, 1.24, 0.7, "Quality\nOK?", C.sky);
  // Diamond 2: Disease detected?  y=3.14
  diamond(s, BX + 0.38, 3.14, 1.24, 0.7, "Disease\nDetected?", C.teal);

  // ── Decision: Quality NOT OK → retake ──
  // Right arrow from diamond
  arrowH(s, BX + BW, 1.89, 0.72, C.amber);
  box(s, BX + BW + 0.72, 1.65, 1.7, 0.48, "⚠️  Prompt:\nRetake Photo", C.amber, C.white, 9.5);
  // Up arrow back
  s.addShape(pres.ShapeType.line, {
    x: BX + BW + 0.72 + 0.85, y: 1.65, w: 0, h: -0.75,
    line: { color: C.amber, width: 2 },
  });
  s.addShape(pres.ShapeType.line, {
    x: BX + BW / 2, y: 0.9, w: BX + BW + 0.72 + 0.85 - (BX + BW / 2), h: 0,
    line: { color: C.amber, width: 2, beginArrowType: "arrow" },
  });
  s.addText("No", {
    x: BX + BW + 0.05, y: 1.72, w: 0.5, h: 0.25,
    fontSize: 9, bold: true, color: C.amber, fontFace: "Calibri", isTextBox: true,
  });
  s.addText("Yes", {
    x: BX + 0.06, y: 2.06, w: 0.5, h: 0.25,
    fontSize: 9, bold: true, color: C.greenBright, fontFace: "Calibri", isTextBox: true,
  });

  // ── Decision: Disease NOT detected → healthy result ──
  arrowH(s, BX + BW, 3.49, 0.72, C.teal);
  box(s, BX + BW + 0.72, 3.25, 1.7, 0.48, "✅  Healthy Leaf\nAdvisory", C.green, C.white, 9.5);
  s.addText("No", {
    x: BX + BW + 0.05, y: 3.36, w: 0.5, h: 0.25,
    fontSize: 9, bold: true, color: C.teal, fontFace: "Calibri", isTextBox: true,
  });
  s.addText("Yes", {
    x: BX + 0.06, y: 3.84, w: 0.5, h: 0.25,
    fontSize: 9, bold: true, color: C.greenBright, fontFace: "Calibri", isTextBox: true,
  });

  // ── Final step: Submit to Officer ──
  arrowV(s, BX + BW / 2, 4.9, 0.24, C.greenBright);
  box(s, BX, 5.14, BW, 0.37, "📤  Submit Report → Officer Dashboard", C.panel, C.greenBright, 9);
  s.addShape(pres.ShapeType.roundRect, {
    x: BX, y: 5.14, w: BW, h: 0.37,
    fill: { color: "000000", transparency: 100 },
    line: { color: C.greenBright, width: 1.5 },
    rectRadius: 0.04,
  });

  // ── Right panel: Risk Score formula ──
  s.addShape(pres.ShapeType.roundRect, {
    x: 5.3, y: 0.78, w: 4.34, h: 4.73,
    fill: { color: C.panel },
    line: { color: C.border, width: 1.5 },
    rectRadius: 0.1,
  });
  s.addText("Risk Score Formula", {
    x: 5.48, y: 0.94, w: 4.0, h: 0.38,
    fontSize: 13.5, bold: true, color: C.white, fontFace: "Calibri", isTextBox: true,
  });
  s.addShape(pres.ShapeType.rect, {
    x: 5.48, y: 1.38, w: 3.8, h: 0.02, fill: { color: C.border },
  });
  s.addText("Score = 0.34×Weather\n       + 0.30×(Conf × Severity)\n       + 0.22×Nearby Reports\n       + 0.14×Growth Stage", {
    x: 5.48, y: 1.5, w: 4.0, h: 1.15,
    fontSize: 10.5, color: C.greenBright, fontFace: "Courier New", isTextBox: true,
  });
  s.addShape(pres.ShapeType.rect, {
    x: 5.48, y: 2.72, w: 3.8, h: 0.02, fill: { color: C.border },
  });

  const bands = [
    { lbl: "0 – 34", name: "LOW",      col: C.green },
    { lbl: "35 – 64",name: "MODERATE", col: C.amber },
    { lbl: "65 – 100",name: "HIGH",    col: C.red },
  ];
  s.addText("Risk Bands", {
    x: 5.48, y: 2.82, w: 4.0, h: 0.34,
    fontSize: 11, bold: true, color: C.white, fontFace: "Calibri", isTextBox: true,
  });
  bands.forEach((b, i) => {
    s.addShape(pres.ShapeType.roundRect, {
      x: 5.48, y: 3.22 + i * 0.52, w: 3.86, h: 0.42,
      fill: { color: b.col, transparency: 84 },
      line: { color: b.col, width: 1 },
      rectRadius: 0.04,
    });
    s.addText(b.lbl, {
      x: 5.55, y: 3.22 + i * 0.52, w: 1.2, h: 0.42,
      fontSize: 11, bold: true, color: b.col,
      valign: "middle", fontFace: "Calibri", isTextBox: true,
    });
    s.addText(b.name, {
      x: 6.9, y: 3.22 + i * 0.52, w: 2.35, h: 0.42,
      fontSize: 11, bold: true, color: b.col,
      align: "right", valign: "middle", fontFace: "Calibri", isTextBox: true,
    });
  });

  s.addText("Offline: reports queued in localStorage\nand synced when connectivity returns.", {
    x: 5.48, y: 4.72, w: 4.0, h: 0.65,
    fontSize: 9.5, color: "4A6875", fontFace: "Calibri", isTextBox: true,
  });
}


// ══════════════════════════════════════════════════════════════
//  SLIDE 5 — TECH STACK & FEATURES
// ══════════════════════════════════════════════════════════════
{
  const s = light();
  slideNum(s, 5, 6);
  pill(s, "TECH STACK", C.teal);

  s.addText("Technology & Key Features", {
    x: 2.2, y: 0.14, w: 7.0, h: 0.5,
    fontSize: 26, bold: true, color: C.textDark, fontFace: "Calibri", isTextBox: true,
  });

  // ── Left: Tech Stack mini-diagram ──
  s.addText("Stack Overview", {
    x: 0.42, y: 0.72, w: 4.5, h: 0.38,
    fontSize: 14, bold: true, color: C.textDark, fontFace: "Calibri", isTextBox: true,
  });

  const stack = [
    { lbl: "YOLOv8 Model",    sub: "Object detection · 8 disease classes",   col: C.green },
    { lbl: "FastAPI + Python", sub: "REST /predict · Uvicorn ASGI · Pillow",   col: C.teal },
    { lbl: "React 18 + Vite", sub: "SPA · Recharts · Lucide icons",           col: C.sky },
    { lbl: "Open-Meteo API",  sub: "Live temp · humidity · rain · wind",      col: C.sky },
    { lbl: "Risk Engine",     sub: "Weighted formula · Haversine clustering",  col: C.amber },
  ];
  stack.forEach((st, i) => {
    const y = 1.18 + i * 0.82;
    // Connector line
    if (i < stack.length - 1) {
      arrowV(s, 0.68, y + 0.52, 0.3, C.lineLight);
    }
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.42, y, w: 4.1, h: 0.5,
      fill: { color: C.card },
      line: { color: st.col, width: 1.5 },
      rectRadius: 0.05,
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: 0.48, y: y + 0.1, w: 0.3, h: 0.3,
      fill: { color: st.col },
    });
    s.addText(st.lbl, {
      x: 0.9, y: y + 0.04, w: 3.5, h: 0.25,
      fontSize: 11, bold: true, color: C.textDark, fontFace: "Calibri", isTextBox: true,
    });
    s.addText(st.sub, {
      x: 0.9, y: y + 0.27, w: 3.5, h: 0.2,
      fontSize: 9, color: C.textSub, fontFace: "Calibri", isTextBox: true,
    });
  });

  // ── Vertical divider ──
  s.addShape(pres.ShapeType.rect, {
    x: 4.84, y: 0.7, w: 0.04, h: 4.7,
    fill: { color: C.lineLight },
  });

  // ── Right: Key Features grid ──
  s.addText("Key Features", {
    x: 5.1, y: 0.72, w: 4.5, h: 0.38,
    fontSize: 14, bold: true, color: C.textDark, fontFace: "Calibri", isTextBox: true,
  });

  const feats = [
    { ico: "🌐", col: C.teal,  ttl: "Trilingual", dsc: "EN / HI / MR — all labels & advisories" },
    { ico: "📶", col: C.sky,   ttl: "Offline-first", dsc: "Queue syncs when back online" },
    { ico: "📍", col: C.green, ttl: "GPS + Weather", dsc: "Live local risk context" },
    { ico: "📷", col: C.green, ttl: "Quality Check", dsc: "Auto-assess image before inference" },
    { ico: "🚨", col: C.amber, ttl: "Outbreak Alert", dsc: "≥6 reports in 12 km → alert sent" },
    { ico: "📊", col: C.teal,  ttl: "Officer Analytics", dsc: "Trend charts, verification queue" },
  ];
  feats.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 5.1 + col * 2.45;
    const y = 1.18 + row * 1.42;
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w: 2.28, h: 1.28,
      fill: { color: C.card },
      line: { color: C.lineLight, width: 1 },
      rectRadius: 0.07,
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: x + 0.15, y: y + 0.22, w: 0.6, h: 0.6,
      fill: { color: f.col, transparency: 87 },
    });
    s.addText(f.ico, {
      x: x + 0.15, y: y + 0.22, w: 0.6, h: 0.6,
      fontSize: 16, align: "center", valign: "middle", isTextBox: true,
    });
    s.addText(f.ttl, {
      x: x + 0.88, y: y + 0.2, w: 1.32, h: 0.32,
      fontSize: 11, bold: true, color: C.textDark, fontFace: "Calibri", isTextBox: true,
    });
    s.addText(f.dsc, {
      x: x + 0.88, y: y + 0.52, w: 1.32, h: 0.6,
      fontSize: 9, color: C.textSub, fontFace: "Calibri", isTextBox: true,
    });
  });

  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 5.32, w: 10, h: 0.305,
    fill: { color: C.green },
  });
  s.addText("KrishiRakshak AI  ·  SIH26131", {
    x: 0.5, y: 5.35, w: 9, h: 0.25,
    fontSize: 9, color: C.white, fontFace: "Calibri", isTextBox: true,
  });
}


// ══════════════════════════════════════════════════════════════
//  SLIDE 6 — IMPACT & THANK YOU
// ══════════════════════════════════════════════════════════════
{
  const s = dark();
  slideNum(s, 6, 6);

  // ── Decorative circles ──
  s.addShape(pres.ShapeType.ellipse, {
    x: 6.8, y: -2.4, w: 6.5, h: 6.5,
    fill: { color: C.green, transparency: 88 },
  });
  s.addShape(pres.ShapeType.ellipse, {
    x: -2.2, y: 3.6, w: 4.5, h: 4.5,
    fill: { color: C.sky, transparency: 93 },
  });

  // ── Left accent ──
  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 0.35, h: 5.625,
    fill: { color: C.green },
  });

  // ── Impact stats (top) ──
  s.addText("Impact", {
    x: 0.65, y: 0.22, w: 8.8, h: 0.48,
    fontSize: 24, bold: true, color: C.white, fontFace: "Calibri", isTextBox: true,
  });

  const impacts = [
    { num: "< 5 sec",  lbl: "Disease detected\nvs. 3–7 day wait", col: C.green },
    { num: "8 Crops",  lbl: "& 8 disease types\ncovered by IPM KB", col: C.teal },
    { num: "3 Langs",  lbl: "English, Hindi\n& Marathi advisory", col: C.sky },
    { num: "12 km",    lbl: "Spatial clustering\nfor outbreak alerts", col: C.amber },
  ];
  impacts.forEach((imp, i) => {
    const x = 0.62 + i * 2.36;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 0.82, w: 2.12, h: 1.62,
      fill: { color: C.panel },
      line: { color: imp.col, width: 1.5 },
      rectRadius: 0.08,
    });
    s.addText(imp.num, {
      x, y: 0.96, w: 2.12, h: 0.68,
      fontSize: 30, bold: true, color: imp.col,
      align: "center", fontFace: "Calibri", isTextBox: true,
    });
    s.addText(imp.lbl, {
      x, y: 1.66, w: 2.12, h: 0.68,
      fontSize: 9.5, color: "7AACBA",
      align: "center", fontFace: "Calibri", isTextBox: true,
    });
  });

  // ── Roadmap mini-flow ──
  s.addText("Roadmap", {
    x: 0.65, y: 2.65, w: 8.8, h: 0.38,
    fontSize: 14, bold: true, color: C.white, fontFace: "Calibri", isTextBox: true,
  });

  const rm = [
    { n: "✓", lbl: "Tomato YOLO\nModel + App",  col: C.green },
    { n: "2", lbl: "All 8-crop\nDataset",         col: C.teal },
    { n: "3", lbl: "Voice Input\n(Low-literacy)", col: C.sky },
    { n: "4", lbl: "Satellite\nImagery",          col: C.amber },
    { n: "5", lbl: "Insurance\n& Marketplace",    col: C.red },
  ];
  rm.forEach((r, i) => {
    const x = 0.62 + i * 1.9;
    s.addShape(pres.ShapeType.ellipse, {
      x: x + 0.56, y: 3.1, w: 0.56, h: 0.56,
      fill: { color: i === 0 ? C.green : C.panel },
      line: { color: r.col, width: 1.5 },
    });
    s.addText(r.n, {
      x: x + 0.56, y: 3.1, w: 0.56, h: 0.56,
      fontSize: 11, bold: true, color: i === 0 ? C.white : r.col,
      align: "center", valign: "middle", fontFace: "Calibri", isTextBox: true,
    });
    s.addText(r.lbl, {
      x, y: 3.74, w: 1.75, h: 0.56,
      fontSize: 8.5, color: i === 0 ? C.greenBright : "4A6875",
      align: "center", fontFace: "Calibri", isTextBox: true,
    });
    if (i < 4) {
      arrowH(s, x + 1.12, 3.38, 0.84, C.border);
    }
  });

  // ── Thank You ──
  s.addShape(pres.ShapeType.rect, {
    x: 0.62, y: 4.42, w: 9.0, h: 0.02,
    fill: { color: C.border },
  });
  s.addText("Thank You", {
    x: 0.65, y: 4.52, w: 5.5, h: 0.62,
    fontSize: 36, bold: true, color: C.white, fontFace: "Calibri", charSpacing: -0.5, isTextBox: true,
  });
  s.addText("Problem Statement: SIH26131   ·   Smart India Hackathon 2026   ·   Agriculture & Rural Development", {
    x: 0.65, y: 5.08, w: 9.0, h: 0.32,
    fontSize: 10, color: "4A6875", fontFace: "Calibri", isTextBox: true,
  });

  // Bottom accent
  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 5.44, w: 10, h: 0.185,
    fill: { color: C.green },
  });
}


// ══════════════════════════════════════════════════════════════
//  WRITE FILE
// ══════════════════════════════════════════════════════════════
pres.writeFile({ fileName: "KrishiRakshak_SIH26131.pptx" })
  .then(() => console.log("\n✅  KrishiRakshak_SIH26131.pptx  — 6 slides with flowcharts ready!\n"))
  .catch(err => console.error("❌  Error:", err));
