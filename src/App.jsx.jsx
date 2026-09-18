import { useState, useEffect, useMemo, useRef } from "react";
import {
  Leaf, Sprout, Camera, Upload, MapPin, CloudRain, Droplets, Wind, Thermometer,
  AlertTriangle, ShieldCheck, Activity, TrendingUp, Bug, CheckCircle2, XCircle,
  Clock, Bell, Languages, LayoutDashboard, Users, FileText, Filter, ChevronRight,
  Sun, ArrowRight, Eye, Flag, Info, Sparkles, Gauge, Home, RefreshCw, Calendar,
  Crosshair, Layers, Zap, Signal, Loader2, Check, Send, Search, Stethoscope,
  ClipboardList, WifiOff,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

/* ============================================================================
   KrishiRakshak AI — SIH26131 demo (single-file demo harness)
   Modules below map to production files:
     i18n/*  ·  data/seed.ts  ·  lib/inference/*  ·  lib/risk/*  ·  lib/outbreak/*
   Inference here is a MOCK provider, clearly labelled DEMO. It implements the
   same InferenceProvider contract shown in the write-up; swap for a real model.
   ========================================================================== */

/* ---------- design tokens ---------- */
const C = {
  ink: "#0f1e28", inkPanel: "#16262f", inkCard: "#1a2c36", inkLine: "#263b46",
  inkText: "#e8eef0", inkSub: "#9db0ba", inkFaint: "#63798a",
  paper: "#f4f7f5", card: "#ffffff", line: "#e4eae7", text: "#182a2f",
  sub: "#5a6b70", faint: "#8ba0a2",
  green: "#177149", greenBright: "#28a06a", greenSoft: "#e7f2ec",
  amber: "#bd7d18", amberSoft: "#fbf1dd", red: "#bd3f2d", redSoft: "#fbe6e2",
  sky: "#2c74c9", teal: "#218b81", indigo: "#3a51a8", clay: "#8a5a3c",
};
const CATS = ["#177149", "#bd7d18", "#bd3f2d", "#3a51a8", "#218b81", "#8a5a3c", "#4f9a5e", "#2c74c9"];

/* ---------- geo helpers ---------- */
// abstract Maharashtra projection into a 1000x640 viewBox
const BB = { lngMin: 72.5, lngMax: 81.0, latMin: 15.5, latMax: 22.2, w: 1000, h: 640 };
const proj = (lat, lng) => ({
  x: ((lng - BB.lngMin) / (BB.lngMax - BB.lngMin)) * BB.w,
  y: ((BB.latMax - lat) / (BB.latMax - BB.latMin)) * BB.h,
});
const havKm = (a, b) => {
  const R = 6371, dLat = ((b.lat - a.lat) * Math.PI) / 180, dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

/* ---------- severity + risk bands ---------- */
function sevBand(pct) {
  if (pct <= 5) return { key: "healthy", color: C.green };
  if (pct <= 20) return { key: "low", color: "#4f9a5e" };
  if (pct <= 40) return { key: "moderate", color: C.amber };
  if (pct <= 70) return { key: "severe", color: "#cf6a24" };
  return { key: "critical", color: C.red };
}
function riskBand(score) {
  if (score < 35) return { key: "low", color: C.green };
  if (score < 65) return { key: "moderate", color: C.amber };
  return { key: "high", color: C.red };
}

/* ---------- seeded RNG for deterministic demo data ---------- */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- crops ---------- */
const CROPS = {
  wheat: { emoji: "🌾", name: { en: "Wheat", hi: "गेहूं", mr: "गहू" } },
  rice: { emoji: "🌾", name: { en: "Rice", hi: "चावल", mr: "भात" } },
  cotton: { emoji: "🌱", name: { en: "Cotton", hi: "कपास", mr: "कापूस" } },
  tomato: { emoji: "🍅", name: { en: "Tomato", hi: "टमाटर", mr: "टोमॅटो" } },
  potato: { emoji: "🥔", name: { en: "Potato", hi: "आलू", mr: "बटाटा" } },
  soybean: { emoji: "🌿", name: { en: "Soybean", hi: "सोयाबीन", mr: "सोयाबीन" } },
  maize: { emoji: "🌽", name: { en: "Maize", hi: "मक्का", mr: "मका" } },
  sugarcane: { emoji: "🎋", name: { en: "Sugarcane", hi: "गन्ना", mr: "ऊस" } },
  other: { emoji: "🌿", name: { en: "Other", hi: "अन्य", mr: "इतर" } },
};

/* ---------- disease knowledge base + advisories (IPM) ---------- */
const L = (en, hi, mr) => ({ en, hi, mr });
const DISEASES = {
  early_blight: {
    crop: "tomato", type: "fungal",
    name: L("Early Blight", "अगेती झुलसा", "लवकर करपा"),
    what: L(
      "Alternaria early blight — brown spots with concentric rings on older, lower leaves, often ringed by a yellow halo.",
      "अल्टरनेरिया अगेती झुलसा — पुरानी निचली पत्तियों पर संकेंद्रित छल्लों वाले भूरे धब्बे, अक्सर पीले घेरे के साथ।",
      "अल्टरनेरिया लवकर करपा — जुन्या खालच्या पानांवर वर्तुळाकार तपकिरी ठिपके, अनेकदा पिवळ्या कडेसह."),
    why: L(
      "Warm weather with long leaf wetness from humidity, dew or rain lets the fungus infect and spread, especially on crowded or stressed plants.",
      "गर्म मौसम में नमी, ओस या बारिश से पत्तियां लंबे समय गीली रहने पर फफूंद तेजी से फैलती है, खासकर घने या कमजोर पौधों पर।",
      "उबदार हवामानात आर्द्रता, दव किंवा पावसामुळे पाने बराच वेळ ओली राहिल्यास बुरशी झपाट्याने पसरते, विशेषतः दाट किंवा कमजोर झाडांवर."),
    doNow: L(
      ["Remove and destroy affected lower leaves; do not compost them.", "Improve airflow — stake plants and clear weeds at the base.", "Water at the base early in the day; avoid wetting leaves.", "Scout every 2–3 days and mark new spots."],
      ["प्रभावित निचली पत्तियां हटाकर नष्ट करें; खाद में न डालें।", "हवा आने-जाने दें — पौधों को सहारा दें और जड़ के पास खरपतवार हटाएं।", "सुबह जड़ के पास पानी दें; पत्तियां गीली न करें।", "हर 2–3 दिन में निरीक्षण करें और नए धब्बे चिह्नित करें।"],
      ["बाधित खालची पाने काढून नष्ट करा; कंपोस्टमध्ये टाकू नका.", "हवा खेळती ठेवा — झाडांना आधार द्या व मुळाजवळील तण काढा.", "सकाळी मुळाजवळ पाणी द्या; पाने ओली करू नका.", "दर 2–3 दिवसांनी पाहणी करा व नवीन ठिपके नोंदवा."]),
    avoid: L(
      ["Working with plants while the foliage is wet — it spreads spores.", "Overhead irrigation in the evening.", "Piling infected debris near healthy plants."],
      ["पत्तियां गीली होने पर पौधों के बीच काम करना — इससे बीजाणु फैलते हैं।", "शाम को ऊपर से सिंचाई करना।", "संक्रमित अवशेष स्वस्थ पौधों के पास जमा करना।"],
      ["पाने ओली असताना झाडांमध्ये काम करणे — यामुळे बीजाणू पसरतात.", "संध्याकाळी वरून पाणी देणे.", "बाधित अवशेष निरोगी झाडांजवळ साठवणे."]),
    prevent: L(
      ["Rotate away from tomato/potato for 2–3 seasons.", "Use certified seed and resistant varieties where available.", "Mulch to stop soil splashing onto lower leaves.", "Keep plants healthy with balanced nutrition."],
      ["2–3 मौसम तक टमाटर/आलू न लगाएं (फसल चक्र)।", "प्रमाणित बीज और उपलब्ध हो तो प्रतिरोधी किस्में लगाएं।", "मल्च डालें ताकि मिट्टी निचली पत्तियों पर न छींटे।", "संतुलित पोषण से पौधे स्वस्थ रखें।"],
      ["2–3 हंगाम टोमॅटो/बटाटा लावू नका (पीक फेरपालट).", "प्रमाणित बियाणे व उपलब्ध असल्यास प्रतिरोधक वाण वापरा.", "आच्छादन करा जेणेकरून माती खालच्या पानांवर उडणार नाही.", "संतुलित पोषणाने झाडे निरोगी ठेवा."]),
  },
  late_blight: {
    crop: "potato", type: "fungal",
    name: L("Late Blight", "पछेती झुलसा", "उशिरा करपा"),
    what: L("Phytophthora late blight — fast, water-soaked dark lesions on leaves and stems with white mould underneath in humid weather.", "फाइटोफ्थोरा पछेती झुलसा — नमी में पत्तियों/तनों पर तेजी से फैलते गहरे धब्बे और नीचे सफेद फफूंद।", "फायटोफ्थोरा उशिरा करपा — दमट हवामानात पानांवर/खोडावर झपाट्याने पसरणारे गडद ठिपके व खाली पांढरी बुरशी."),
    why: L("Cool, wet, humid weather drives rapid spread; whole fields can collapse within days.", "ठंडा, गीला, नम मौसम तेजी से फैलाव करता है; कुछ ही दिनों में पूरा खेत प्रभावित हो सकता है।", "थंड, ओले, दमट हवामान झपाट्याने प्रसार करते; काही दिवसांतच संपूर्ण शेत बाधित होऊ शकते."),
    doNow: L(["Remove and destroy infected plants immediately, away from the field.", "Stop overhead watering; improve drainage.", "Do not move through wet, infected rows.", "Alert nearby farmers — this spreads fast."], null, null),
    avoid: L(["Leaving infected foliage or cull piles in the field.", "Irrigating late in the day.", "Delaying action — hours matter with late blight."], null, null),
    prevent: L(["Plant certified, disease-free seed tubers.", "Choose resistant varieties and well-drained plots.", "Hill soil over tubers to protect them.", "Monitor closely in cool, humid spells."], null, null),
  },
  leaf_rust: {
    crop: "wheat", type: "fungal",
    name: L("Leaf Rust", "पत्ती रतुआ", "पानावरील तांबेरा"),
    what: L("Wheat leaf rust — small orange-brown pustules scattered on the upper leaf surface that rub off as powder.", "गेहूं पत्ती रतुआ — पत्ती की ऊपरी सतह पर बिखरे नारंगी-भूरे फफोले जो पाउडर की तरह झड़ते हैं।", "गव्हावरील पानाचा तांबेरा — पानाच्या वरच्या पृष्ठभागावर विखुरलेले नारिंगी-तपकिरी फोड जे पावडरसारखे निघतात."),
    why: L("Mild temperatures with dew or high humidity favour rust; wind carries spores across fields.", "हल्का तापमान और ओस/अधिक नमी रतुआ को बढ़ाते हैं; हवा से बीजाणु फैलते हैं।", "सौम्य तापमान व दव/जास्त आर्द्रतेमुळे तांबेरा वाढतो; वाऱ्याने बीजाणू पसरतात."),
    doNow: L(["Scout the whole field and mark rust-hit patches.", "Avoid excess nitrogen, which softens leaves.", "Note the growth stage — flag leaf protection matters most.", "Consult the agriculture officer before spraying."],
      ["पूरे खेत का निरीक्षण करें और प्रभावित भाग चिह्नित करें।", "अधिक नाइट्रोजन से बचें, इससे पत्तियां कोमल होती हैं।", "वृद्धि अवस्था देखें — फ्लैग लीफ की सुरक्षा सबसे जरूरी है।", "छिड़काव से पहले कृषि अधिकारी से सलाह लें।"],
      ["संपूर्ण शेताची पाहणी करा व बाधित भाग नोंदवा.", "जास्त नत्र टाळा, त्यामुळे पाने मऊ होतात.", "वाढीचा टप्पा पाहा — फ्लॅग लीफचे संरक्षण सर्वात महत्त्वाचे.", "फवारणीपूर्वी कृषी अधिकाऱ्याचा सल्ला घ्या."]),
    avoid: L(["Late, heavy nitrogen top-dressing.", "Ignoring early pustules on lower leaves.", "Dense, un-thinned stands with poor airflow."], null, null),
    prevent: L(["Sow recommended rust-resistant varieties.", "Follow timely sowing windows for your zone.", "Remove volunteer wheat and grassy hosts.", "Keep balanced nutrition, not excess N."], null, null),
  },
  bollworm: {
    crop: "cotton", type: "pest",
    name: L("Bollworm", "सुंडी (बॉलवर्म)", "बोंडअळी"),
    what: L("Cotton bollworm — caterpillars bore into squares and bolls, leaving round holes and frass; flowers and bolls drop.", "कपास सुंडी — इल्लियां फूल-कली और घेंटे में छेद कर देती हैं, गोल छेद और मल दिखते हैं; फूल-घेंटे गिरते हैं।", "कापूस बोंडअळी — अळ्या पात्या व बोंडांना छिद्र पाडतात, गोल छिद्रे व विष्ठा दिसते; फुले व बोंडे गळतात."),
    why: L("Warm weather speeds up the pest's life cycle; egg-laying peaks at flowering and boll formation.", "गर्म मौसम कीट का जीवन चक्र तेज करता है; फूल और घेंटा बनने पर अंडे सबसे अधिक दिए जाते हैं।", "उबदार हवामान किडीचे जीवनचक्र वेगवान करते; फुलोरा व बोंडधारणेच्या वेळी अंडी सर्वाधिक घातली जातात."),
    doNow: L(["Scout 20 plants across the field and count larvae/damaged bolls.", "Install pheromone traps to track moth activity.", "Remove and destroy damaged bolls and larvae by hand.", "Encourage natural enemies; use IPM thresholds before any spray."],
      ["खेत में 20 पौधे देखें और इल्ली/खराब घेंटे गिनें।", "कीट गतिविधि जांचने के लिए फेरोमोन ट्रैप लगाएं।", "खराब घेंटे और इल्लियां हाथ से हटाकर नष्ट करें।", "प्राकृतिक शत्रुओं को बढ़ावा दें; छिड़काव से पहले IPM सीमा देखें।"],
      ["शेतात 20 झाडे पाहा व अळ्या/खराब बोंडे मोजा.", "किडीची हालचाल तपासण्यासाठी फेरोमोन सापळे लावा.", "खराब बोंडे व अळ्या हाताने काढून नष्ट करा.", "नैसर्गिक शत्रूंना प्रोत्साहन द्या; फवारणीपूर्वी IPM मर्यादा पाहा."]),
    avoid: L(["Blanket spraying that kills natural enemies.", "Repeating the same chemical group and building resistance.", "Skipping regular scouting during flowering."], null, null),
    prevent: L(["Grow refuge/Bt as recommended and rotate crops.", "Use pheromone traps early to time action.", "Conserve predators and parasitoids.", "Destroy crop residue after harvest."], null, null),
  },
  blast: { crop: "rice", type: "fungal", name: L("Rice Blast", "ब्लास्ट रोग", "करपा (ब्लास्ट)"),
    what: L("Rice blast — spindle-shaped grey lesions with brown margins on leaves; can rot the neck of the panicle.", null, null),
    why: L("High humidity, long leaf wetness and heavy nitrogen favour blast infection.", null, null),
    doNow: L(["Drain and dry the field slightly if flooded conditions allow.", "Avoid extra nitrogen top-dressing now.", "Scout for neck rot near heading.", "Consult the agriculture officer for verified management."], null, null),
    avoid: L(["Excess nitrogen.", "Dense seeding with poor airflow.", "Continuous deep flooding with stagnant water."], null, null),
    prevent: L(["Use resistant varieties and clean seed.", "Split nitrogen doses; avoid over-fertilising.", "Balanced spacing for airflow."], null, null) },
  soybean_rust: { crop: "soybean", type: "fungal", name: L("Soybean Rust", "सोयाबीन रतुआ", "सोयाबीन तांबेरा"),
    what: L("Soybean rust — tan to reddish-brown pustules on the underside of leaves; leaves yellow and drop early.", null, null),
    why: L("Warm, humid, rainy spells with leaf wetness drive rapid spread.", null, null),
    doNow: L(["Scout lower canopy leaves for pustules.", "Note growth stage — pod fill is most sensitive.", "Improve airflow where possible.", "Consult the agriculture officer before spraying."], null, null),
    avoid: L(["Ignoring the lower canopy where it starts.", "Dense, weedy stands.", "Delaying scouting in humid weather."], null, null),
    prevent: L(["Timely sowing and recommended varieties.", "Field sanitation and weed control.", "Monitor closely in humid periods."], null, null) },
  fall_armyworm: { crop: "maize", type: "pest", name: L("Fall Armyworm", "फॉल आर्मीवर्म", "लष्करी अळी"),
    what: L("Fall armyworm — ragged feeding and moist sawdust-like frass in the whorl; larvae hide deep inside.", null, null),
    why: L("Warm weather and continuous maize allow generations to build up quickly.", null, null),
    doNow: L(["Scout whorls and count damaged plants.", "Handpick egg masses and larvae where feasible.", "Use pheromone traps to monitor moths.", "Follow IPM thresholds; consult the officer before spray."], null, null),
    avoid: L(["Frequent blanket sprays that harm natural enemies.", "Ignoring early whorl damage.", "Continuous maize with no rotation."], null, null),
    prevent: L(["Early, uniform sowing to escape peak.", "Conserve natural enemies.", "Rotate crops and manage residue."], null, null) },
  red_rot: { crop: "sugarcane", type: "fungal", name: L("Red Rot", "लाल सड़न", "लाल कूज"),
    what: L("Sugarcane red rot — reddened internal tissue with white cross-patches and a sour smell when a cane is split.", null, null),
    why: L("Waterlogging, injury and infected setts spread the fungus through the field.", null, null),
    doNow: L(["Remove and destroy affected clumps away from the field.", "Improve drainage to stop waterlogging.", "Avoid moving soil/water from infected patches.", "Consult the agriculture officer for verified guidance."], null, null),
    avoid: L(["Planting setts from infected fields.", "Waterlogged, poorly drained plots.", "Mechanical injury that opens entry points."], null, null),
    prevent: L(["Plant healthy, treated setts of resistant varieties.", "Ensure good drainage.", "Practice crop rotation and field sanitation."], null, null) },
  generic: { crop: "other", type: "unknown", name: L("Unclassified symptom", "अवर्गीकृत लक्षण", "अवर्गीकृत लक्षण"),
    what: L("The symptom could not be confidently matched. Capture clearer photos of affected and healthy parts.", null, null),
    why: L("Low confidence — image quality, angle or an uncommon problem may be the cause.", null, null),
    doNow: L(["Take 3–4 sharp, well-lit photos including leaf underside.", "Note when symptoms started and how fast they spread.", "Isolate a few affected samples.", "Report to your agriculture officer for a closer look."], null, null),
    avoid: L(["Applying random chemicals without a diagnosis.", "Waiting if spread is rapid."], null, null),
    prevent: L(["Regular scouting.", "Field sanitation and balanced nutrition."], null, null) },
};
const pickL = (o, lang) => (o == null ? "" : typeof o === "string" ? o : o[lang] ?? o.en ?? "");

/* ---------- UI strings ---------- */
const U = {
  tagline: L("Detect early. Act smarter. Protect every crop.", "जल्दी पहचानें। समझदारी से कार्य करें। हर फसल बचाएं।", "लवकर ओळखा. हुशारीने कृती करा. प्रत्येक पीक वाचवा."),
  farmer: L("Farmer", "किसान", "शेतकरी"), officer: L("Officer", "अधिकारी", "अधिकारी"),
  online: L("Online", "ऑनलाइन", "ऑनलाइन"), offline: L("Offline", "ऑफ़लाइन", "ऑफलाइन"),
  offlineNote: L("Offline — reports are saved and will sync.", "ऑफ़लाइन — रिपोर्ट सहेजी गई, बाद में सिंक होगी।", "ऑफलाइन — अहवाल जतन केला, नंतर सिंक होईल."),
  greeting: L("Good morning", "सुप्रभात", "सुप्रभात"),
  farmHealth: L("Your farm health", "आपके खेत का स्वास्थ्य", "तुमच्या शेताचे आरोग्य"),
  currentRisk: L("Current risk", "वर्तमान जोखिम", "सध्याचा धोका"),
  weather: L("Weather", "मौसम", "हवामान"), humidity: L("Humidity", "नमी", "आर्द्रता"),
  yourCrops: L("Your crops", "आपकी फसलें", "तुमची पिके"),
  scanCrop: L("Scan my crop", "मेरी फसल स्कैन करें", "माझे पीक स्कॅन करा"),
  reportProblem: L("Report a problem", "समस्या दर्ज करें", "समस्या नोंदवा"),
  followTitle: L("Follow-up monitoring", "फॉलो-अप निगरानी", "फॉलो-अप देखरेख"),
  alerts: L("Alerts", "अलर्ट", "सूचना"),
  selectCrop: L("Select your crop", "अपनी फसल चुनें", "तुमचे पीक निवडा"),
  addPhoto: L("Add a leaf photo", "पत्ती का फोटो जोड़ें", "पानाचा फोटो जोडा"),
  takePhoto: L("Take photo", "फोटो लें", "फोटो घ्या"),
  uploadPhoto: L("Upload image", "इमेज अपलोड करें", "इमेज अपलोड करा"),
  useDemoLeaf: L("Use demo leaf", "डेमो पत्ती इस्तेमाल करें", "डेमो पान वापरा"),
  retake: L("Change photo", "फोटो बदलें", "फोटो बदला"),
  analyze: L("Analyse crop", "फसल का विश्लेषण करें", "पिकाचे विश्लेषण करा"),
  analysing: L("Analysing your crop", "आपकी फसल का विश्लेषण हो रहा है", "तुमच्या पिकाचे विश्लेषण सुरू आहे"),
  demoBadge: L("DEMO inference", "डेमो अनुमान", "डेमो अनुमान"),
  demoNote: L("Demo model for the prototype — replace with a trained model in production.", "प्रोटोटाइप हेतु डेमो मॉडल — उत्पादन में प्रशिक्षित मॉडल लगाएं।", "प्रोटोटाइपसाठी डेमो मॉडेल — उत्पादनात प्रशिक्षित मॉडेल वापरा."),
  detected: L("Detected", "पहचाना गया", "आढळले"),
  cropDetected: L("Crop", "फसल", "पीक"),
  confidence: L("Confidence", "विश्वास", "विश्वास"),
  severity: L("Severity", "गंभीरता", "तीव्रता"),
  risk: L("Risk", "जोखिम", "धोका"),
  estimateNote: L("Severity is an AI estimate, not a laboratory diagnosis.", "गंभीरता एआई अनुमान है, प्रयोगशाला निदान नहीं।", "तीव्रता हा एआय अंदाज आहे, प्रयोगशाळा निदान नाही."),
  whyRisk: L("Why this risk", "यह जोखिम क्यों", "हा धोका का"),
  indicators: L("Visual indicators", "दृश्य संकेत", "दृश्य संकेत"),
  causes: L("Possible causes", "संभावित कारण", "संभाव्य कारणे"),
  action: L("Recommended next step", "अनुशंसित अगला कदम", "शिफारस केलेले पुढील पाऊल"),
  viewAdvisory: L("View full advisory", "पूरी सलाह देखें", "संपूर्ण सल्ला पाहा"),
  submitReport: L("Submit report", "रिपोर्ट भेजें", "अहवाल पाठवा"),
  whatHappened: L("What happened", "क्या हुआ", "काय झाले"),
  whyHappened: L("Why it may have happened", "यह क्यों हुआ", "हे का झाले असावे"),
  doNow: L("What to do now", "अभी क्या करें", "आता काय करावे"),
  avoid: L("What to avoid", "क्या न करें", "काय टाळावे"),
  prevent: L("How to prevent it", "इसे कैसे रोकें", "हे कसे टाळावे"),
  consult: L("If spread is rapid or severe, consult your local agriculture officer before using any chemical control, and always follow label safety directions.", "यदि फैलाव तेज या गंभीर हो, तो किसी भी रासायनिक उपचार से पहले स्थानीय कृषि अधिकारी से सलाह लें और लेबल के सुरक्षा निर्देश मानें।", "प्रसार वेगवान किंवा तीव्र असल्यास, कोणतेही रासायनिक उपचार करण्यापूर्वी स्थानिक कृषी अधिकाऱ्याचा सल्ला घ्या व लेबलवरील सुरक्षा सूचना पाळा."),
  reportSent: L("Report submitted", "रिपोर्ट भेजी गई", "अहवाल पाठवला"),
  reportSentNote: L("Your report is now on the officer dashboard and on the risk map.", "आपकी रिपोर्ट अब अधिकारी डैशबोर्ड और जोखिम मानचित्र पर है।", "तुमचा अहवाल आता अधिकारी डॅशबोर्ड व धोका नकाशावर आहे."),
  queuedNote: L("Saved offline — it will sync when you are back online.", "ऑफ़लाइन सहेजा — ऑनलाइन होते ही सिंक होगा।", "ऑफलाइन जतन — ऑनलाइन होताच सिंक होईल."),
  backHome: L("Back to home", "होम पर लौटें", "होमवर परत जा"),
  previous: L("Previous", "पिछला", "मागील"),
  current: L("Current", "वर्तमान", "सध्याचे"),
  uploadFollow: L("Upload follow-up photo", "फॉलो-अप फोटो अपलोड करें", "फॉलो-अप फोटो अपलोड करा"),
  improving: L("Improving", "सुधार हो रहा है", "सुधारणा होत आहे"),
  timeline: L("Recovery timeline", "रिकवरी समयरेखा", "पुनर्प्राप्ती कालरेषा"),
  scanFirst: L("Scan a crop first to start monitoring.", "निगरानी शुरू करने के लिए पहले फसल स्कैन करें।", "देखरेख सुरू करण्यासाठी आधी पीक स्कॅन करा."),
  // weather
  temp: L("Temperature", "तापमान", "तापमान"), rain: L("Rain chance", "बारिश की संभावना", "पावसाची शक्यता"),
  wind: L("Wind", "हवा", "वारा"), leafWet: L("Leaf wetness", "पत्ती नमी", "पान ओलावा"),
  // officer (English-first; falls back to en)
  overview: L("Overview"), map: L("Disease map"), queue: L("Verification queue"),
  outbreaks: L("Emerging outbreaks"), trends: L("Trends"),
  totalReports: L("Total reports"), activeOutbreaks: L("Active outbreaks"),
  highRisk: L("High-risk zones"), verified: L("Verified cases"),
  cropsAffected: L("Crops affected"), farmersAssisted: L("Farmers assisted"),
  recentReports: L("Recent reports"), weatherRisk: L("Weather risk"),
  casesOverTime: L("Reports over time"), diseaseDist: L("Disease distribution"),
  cropWise: L("Crop-wise cases"), sevDist: L("Severity distribution"),
  filterCrop: L("Crop"), filterDisease: L("Disease"), filterSev: L("Severity"), all: L("All"),
  verify: L("Verify"), reject: L("Reject"), reqInfo: L("Request info"), priority: L("Priority"),
  sendAlert: L("Send area alert"), alertSent: L("Area alert sent to nearby farmers"),
  showing: L("Showing"), of: L("of"), within: L("within"), reportsWord: L("reports"),
  thisWeek: L("this week"), noQueue: L("Queue is clear — no reports waiting."),
  officerAlert: L("Potential outbreak detected"), nearby: L("Nearby reports"),
  sevenDay: L("7-day risk"), weatherSuit: L("Weather suitability"),
};
const sevName = { healthy: L("Healthy", "स्वस्थ", "निरोगी"), low: L("Low", "कम", "कमी"), moderate: L("Moderate", "मध्यम", "मध्यम"), severe: L("Severe", "गंभीर", "गंभीर"), critical: L("Critical", "अति गंभीर", "अति गंभीर") };
const riskName = { low: L("Low", "कम", "कमी"), moderate: L("Moderate", "मध्यम", "मध्यम"), high: L("High", "उच्च", "उच्च") };
const statusName = {
  pending: L("Pending", "लंबित", "प्रलंबित"), ai_detected: L("AI detected", "एआई पहचान", "एआय आढळले"),
  reviewing: L("Reviewing", "समीक्षाधीन", "पुनरावलोकन"),
  synced: L("Synced", "सिंक्ड", "सिंक झाले"),
  expert_verified: L("Expert verified", "विशेषज्ञ सत्यापित", "तज्ज्ञ पडताळणी"),
  confirmed: L("Confirmed", "पुष्ट", "निश्चित"), resolved: L("Resolved", "समाधान", "निराकरण"),
  dismissed: L("Rejected", "अस्वीकृत", "नाकारले"),
};

/* ---------- demo data (data/seed.ts) ---------- */
const ANCHORS = {
  Nagpur: { lat: 21.14, lng: 79.08 }, Wardha: { lat: 20.75, lng: 78.60 }, Bhandara: { lat: 21.17, lng: 79.65 },
  Yavatmal: { lat: 20.39, lng: 78.13 }, Amravati: { lat: 20.93, lng: 77.75 }, Nashik: { lat: 20.0, lng: 73.78 },
  Pune: { lat: 18.52, lng: 73.85 }, Kolhapur: { lat: 16.70, lng: 74.24 }, Aurangabad: { lat: 19.87, lng: 75.34 },
  Jalgaon: { lat: 21.01, lng: 75.56 }, Solapur: { lat: 17.66, lng: 75.91 }, Nanded: { lat: 19.15, lng: 77.32 },
};
const FARMERS = ["Rajesh P.", "Suresh K.", "Anita D.", "Vithal M.", "Ramesh S.", "Sunita B.", "Ganesh T.", "Meena J.", "Prakash W.", "Kavita R.", "Dattatray N.", "Shalini G."];
const STAGES = { tomato: ["Flowering", "Fruiting"], potato: ["Tuber bulking", "Vegetative"], wheat: ["Tillering", "Flag leaf"], cotton: ["Boll formation", "Flowering"], rice: ["Tillering", "Heading"], soybean: ["Pod fill", "Flowering"], maize: ["Whorl", "Tasseling"], sugarcane: ["Grand growth", "Tillering"] };

function seedReports() {
  const rnd = mulberry32(20260131);
  const out = [];
  let id = 1;
  const push = (anchor, cropKey, diseaseKey, dayFrom, dayTo, sevLo, sevHi, status) => {
    const a = ANCHORS[anchor];
    const lat = a.lat + (rnd() - 0.5) * 0.16;
    const lng = a.lng + (rnd() - 0.5) * 0.16;
    const sev = Math.round(sevLo + rnd() * (sevHi - sevLo));
    const day = dayFrom + Math.floor(rnd() * (dayTo - dayFrom + 1));
    const stages = STAGES[cropKey] || ["Vegetative"];
    out.push({
      id: "R" + String(id++).padStart(3, "0"),
      crop: cropKey, disease: diseaseKey, district: anchor, lat, lng,
      severityPct: sev, band: sevBand(sev).key, daysAgo: day,
      confidence: Math.round(83 + rnd() * 12),
      farmer: FARMERS[Math.floor(rnd() * FARMERS.length)],
      stage: stages[Math.floor(rnd() * stages.length)],
      status, priority: false,
    });
  };
  // Nagpur tomato early blight cluster — recent (drives the outbreak)
  const recentStatuses = ["ai_detected", "ai_detected", "pending", "ai_detected", "expert_verified"];
  for (let i = 0; i < 15; i++) push(["Nagpur", "Nagpur", "Wardha", "Bhandara"][i % 4], "tomato", "early_blight", 0, 6, 24, 58, recentStatuses[i % recentStatuses.length]);
  // same area — previous window (for % increase)
  for (let i = 0; i < 9; i++) push(["Nagpur", "Wardha", "Bhandara"][i % 3], "tomato", "early_blight", 8, 13, 18, 46, ["confirmed", "resolved", "expert_verified"][i % 3]);
  // scattered signals across the state
  push("Yavatmal", "cotton", "bollworm", 1, 3, 45, 66, "ai_detected");
  push("Yavatmal", "cotton", "bollworm", 4, 6, 40, 60, "pending");
  push("Amravati", "soybean", "soybean_rust", 2, 4, 26, 40, "ai_detected");
  push("Amravati", "soybean", "soybean_rust", 8, 10, 22, 36, "confirmed");
  push("Nashik", "wheat", "leaf_rust", 1, 2, 12, 24, "ai_detected");
  push("Nashik", "wheat", "leaf_rust", 5, 7, 20, 34, "expert_verified");
  push("Pune", "potato", "late_blight", 1, 3, 52, 74, "pending");
  push("Pune", "potato", "late_blight", 3, 5, 44, 68, "ai_detected");
  push("Kolhapur", "rice", "blast", 2, 4, 24, 38, "ai_detected");
  push("Kolhapur", "rice", "blast", 6, 8, 20, 34, "resolved");
  push("Aurangabad", "maize", "fall_armyworm", 3, 5, 28, 44, "ai_detected");
  push("Jalgaon", "cotton", "bollworm", 4, 6, 14, 26, "pending");
  push("Solapur", "sugarcane", "red_rot", 5, 7, 26, 40, "ai_detected");
  push("Nanded", "wheat", "leaf_rust", 7, 9, 10, 22, "expert_verified");
  return out;
}

/* ---------- engines ---------- */
// lib/risk/weather.ts
const WEATHER = { tempC: 28, humidity: 86, rainProb: 72, windKph: 12, leafWetness: 78, forecast: "Humid, showers likely" };
function weatherRisk(w, type) {
  let s = 0; const why = [];
  if (w.humidity >= 80) { s += 32; why.push("humidity"); } else if (w.humidity >= 65) { s += 18; }
  if (w.rainProb >= 60) { s += 24; why.push("rain"); } else if (w.rainProb >= 30) { s += 12; }
  if (w.tempC >= 20 && w.tempC <= 32) { s += 14; }
  if (w.leafWetness >= 60) { s += 14; why.push("leaf wetness"); }
  if (w.windKph < 15) { s += 6; }
  if (type === "pest") s = Math.round(s * 0.85 + 10);
  s = Math.max(0, Math.min(100, s));
  return { score: s, band: riskBand(s).key, why };
}
// lib/risk/engine.ts
function computeRisk({ confidence, severityPct, weatherScore, nearbyCount, stage }) {
  const diag = (confidence / 100) * severityPct;
  const nearby = Math.min(nearbyCount * 5, 100);
  const stageFactor = ["Fruiting", "Boll formation", "Pod fill", "Heading", "Flowering", "Tuber bulking", "Flag leaf"].includes(stage) ? 80 : 45;
  const score = Math.round(0.34 * weatherScore + 0.30 * diag + 0.22 * nearby + 0.14 * stageFactor);
  return {
    score: Math.max(0, Math.min(100, score)), band: riskBand(score).key,
    factors: [
      { label: "Weather suitability", value: Math.round(weatherScore), weight: "34%" },
      { label: "AI diagnosis (confidence × severity)", value: Math.round(diag), weight: "30%" },
      { label: "Nearby reports pressure", value: Math.round(nearby), weight: "22%" },
      { label: "Growth-stage susceptibility", value: stageFactor, weight: "14%" },
    ],
  };
}
// lib/outbreak/engine.ts — spatial + temporal clustering
function detectOutbreaks(reports, { radiusKm = 12, windowDays = 7, minReports = 6 } = {}) {
  const byDisease = {};
  reports.forEach((r) => { (byDisease[r.disease] = byDisease[r.disease] || []).push(r); });
  const clusters = [];
  Object.entries(byDisease).forEach(([disease, list]) => {
    const recent = list.filter((r) => r.daysAgo <= windowDays);
    const seen = new Set();
    recent.forEach((seed) => {
      if (seen.has(seed.id)) return;
      const members = recent.filter((r) => havKm(seed, r) <= radiusKm);
      if (members.length < minReports) return;
      members.forEach((m) => seen.add(m.id));
      const cLat = members.reduce((s, m) => s + m.lat, 0) / members.length;
      const cLng = members.reduce((s, m) => s + m.lng, 0) / members.length;
      const centroid = { lat: cLat, lng: cLng };
      const prev = list.filter((r) => r.daysAgo > windowDays && r.daysAgo <= windowDays * 2 && havKm(centroid, r) <= radiusKm).length;
      const inc = prev > 0 ? Math.round(((members.length - prev) / prev) * 100) : 100;
      const avgSev = Math.round(members.reduce((s, m) => s + m.severityPct, 0) / members.length);
      let district = "Nagpur", best = 1e9;
      Object.entries(ANCHORS).forEach(([n, a]) => { const d = havKm(centroid, a); if (d < best) { best = d; district = n; } });
      clusters.push({ disease, count: members.length, prev, inc, avgSev, centroid, district, radiusKm, risk: riskBand(60 + Math.min(avgSev / 3, 30)).key });
    });
  });
  return clusters.sort((a, b) => b.count - a.count);
}
// lib/inference/mock.ts — MockInferenceProvider (DEMO). Same contract as production.
const PRIMARY = { tomato: "early_blight", potato: "late_blight", wheat: "leaf_rust", cotton: "bollworm", rice: "blast", soybean: "soybean_rust", maize: "fall_armyworm", sugarcane: "red_rot", other: "generic" };
const INDICATORS = {
  fungal: ["Lesion spots with defined margins", "Yellowing around affected tissue", "Spread on older / lower leaves"],
  pest: ["Feeding damage / boreholes", "Frass or droppings present", "Larvae / eggs on plant parts"],
  unknown: ["Symptom pattern unclear", "Mixed / atypical signs"],
};
function runDemoInference(cropKey) {
  const rnd = Math.random();
  const diseaseKey = PRIMARY[cropKey] || "generic";
  const d = DISEASES[diseaseKey];
  const confidence = cropKey === "tomato" ? 91 : Math.round(84 + rnd * 11);
  const severityPct = cropKey === "tomato" ? 38 : Math.round(24 + rnd * 26);
  return {
    crop: cropKey, cropConfidence: Math.round(92 + rnd * 6),
    diseaseKey, label: pickL(d.name, "en"), type: d.type,
    confidence, severityPct, band: sevBand(severityPct).key,
    indicators: INDICATORS[d.type] || INDICATORS.unknown,
    causes: [pickL(d.why, "en")],
    provider: "mock", isDemo: true,
  };
}

/* ---------- safe storage (localStorage with in-memory fallback) ----------
   Works when run locally (persists across refresh). In sandboxed previews
   where storage is blocked it silently falls back to memory — never crashes. */
const _mem = {};
const store = {
  get(k, fb = null) { try { const v = localStorage.getItem(k); return v == null ? fb : JSON.parse(v); } catch { return k in _mem ? _mem[k] : fb; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { _mem[k] = v; } },
  del(k) { try { localStorage.removeItem(k); } catch { delete _mem[k]; } },
};
const SK = { reports: "kr_demo_v2_reports", alerts: "kr_demo_v2_alerts", seq: "kr_demo_v2_seq" };

/* report id generator: KR-2026-0001 */
function nextReportId() {
  const n = (store.get(SK.seq, 0) || 0) + 1;
  store.set(SK.seq, n);
  return "KR-2026-" + String(n).padStart(4, "0");
}

/* confidence tiers drive confidence-aware UX (never over-claim certainty) */
function confTier(conf) {
  if (conf >= 85) return { key: "high", verb: L("Likely", "संभवतः", "बहुधा") };
  if (conf >= 65) return { key: "medium", verb: L("Possible", "संभावित", "शक्य") };
  return { key: "low", verb: L("Uncertain", "अनिश्चित", "अनिश्चित") };
}

/* lightweight demo image-quality check — dimensions + size heuristic */
function assessImage(file, w, h) {
  if (!file && w == null) return { grade: "good", score: 88 }; // demo leaf
  const px = (w || 0) * (h || 0);
  let score = 60;
  if (px >= 640 * 480) score += 25; else if (px >= 320 * 240) score += 10; else score -= 15;
  const kb = file ? file.size / 1024 : 400;
  if (kb >= 60 && kb <= 6000) score += 10; else if (kb < 20) score -= 20;
  score = Math.max(5, Math.min(98, score));
  const grade = score >= 75 ? "good" : score >= 50 ? "fair" : "poor";
  return { grade, score: Math.round(score) };
}
const QUALITY = {
  good: { label: L("Good", "अच्छी", "चांगली"), color: C.green, icon: "✅", note: L("Clear image — ready to analyse.", "स्पष्ट छवि — विश्लेषण के लिए तैयार।", "स्पष्ट प्रतिमा — विश्लेषणासाठी तयार.") },
  fair: { label: L("Fair", "ठीक", "बरी"), color: C.amber, icon: "⚠️", note: L("Usable, but a sharper, well-lit photo improves accuracy.", "चल जाएगा, पर साफ और अच्छी रोशनी वाला फोटो सटीकता बढ़ाएगा।", "चालेल, पण स्पष्ट व चांगल्या प्रकाशातील फोटो अचूकता वाढवतो.") },
  poor: { label: L("Poor", "खराब", "खराब"), color: C.red, icon: "⚠️", note: L("Try a clearer, well-lit close-up of the affected leaf.", "प्रभावित पत्ती का साफ, अच्छी रोशनी वाला नज़दीकी फोटो लें।", "बाधित पानाचा स्पष्ट, चांगल्या प्रकाशातील जवळून फोटो घ्या.") },
};

/* ============================================================================
   Small UI atoms
   ========================================================================== */
const cx = (...a) => a.filter(Boolean).join(" ");

function Badge({ children, color = C.green, bg, dark }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ color, background: bg || (dark ? "rgba(255,255,255,0.06)" : color + "18") }}>
      {children}
    </span>
  );
}

function Ring({ value, size = 92, color = C.greenBright, track = "#e4eae7", label, sub, dark }) {
  const r = (size - 12) / 2, c = 2 * Math.PI * r, off = c * (1 - value / 100);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset .8s ease" }} />
      </svg>
      <div className="absolute text-center">
        <div className="font-bold" style={{ fontSize: size > 80 ? 22 : 16, color: dark ? C.inkText : C.text }}>{label ?? value + "%"}</div>
        {sub && <div className="text-xs" style={{ color: dark ? C.inkSub : C.faint }}>{sub}</div>}
      </div>
    </div>
  );
}

function SeverityBar({ pct }) {
  const b = sevBand(pct);
  return (
    <div>
      <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: "#eceeed" }}>
        <div className="h-full rounded-full" style={{ width: pct + "%", background: b.color, transition: "width .8s ease" }} />
      </div>
    </div>
  );
}

/* leaf-shield logo mark */
function Mark({ size = 26, on = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 2c5 3 10 3 12 3 0 12-4 19-12 25C8 24 4 17 4 5c2 0 7 0 12-3Z" fill={on} opacity="0.14" />
      <path d="M16 2c5 3 10 3 12 3 0 12-4 19-12 25C8 24 4 17 4 5c2 0 7 0 12-3Z" stroke={on} strokeWidth="1.6" />
      <path d="M16 9c-4 2-6 6-6 11 4 0 7-3 7-7M16 9c4 2 6 6 6 11" stroke={on} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ============================================================================
   TOP BAR
   ========================================================================== */
function TopBar({ role, setRole, lang, setLang, online, setOnline, dark, onReset, onAbout }) {
  const langs = [["en", "EN"], ["hi", "हिं"], ["mr", "मरा"]];
  return (
    <div className="sticky top-0 z-20 w-full border-b" style={{ background: dark ? C.ink : C.card, borderColor: dark ? C.inkLine : C.line }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: C.green }}><Mark size={22} /></div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-bold" style={{ color: dark ? C.inkText : C.text, letterSpacing: "-0.01em" }}>KrishiRakshak <span style={{ color: C.greenBright }}>AI</span></span>
              <span className="hidden rounded-full px-1.5 py-0.5 text-xs font-bold sm:inline" style={{ background: C.amber + "22", color: C.amber }}>DEMO</span>
            </div>
            <div className="text-xs hidden sm:block" style={{ color: dark ? C.inkSub : C.faint }}>Crop Health Intelligence · SIH26131</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {onAbout && <button onClick={onAbout} title="About / Technology" className="hidden items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium md:inline-flex" style={{ color: dark ? C.inkSub : C.sub, background: dark ? C.inkPanel : C.paper }}><Info size={14} /><span className="hidden lg:inline">{pickL(L("About", "बारे में", "बद्दल"), lang)}</span></button>}
          {onReset && <button onClick={onReset} title="Reset demo data" className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium" style={{ color: dark ? C.inkSub : C.sub, background: dark ? C.inkPanel : C.paper }}><RefreshCw size={14} /><span className="hidden lg:inline">{pickL(L("Reset", "रीसेट", "रीसेट"), lang)}</span></button>}
          <button onClick={() => setOnline(!online)} title="Toggle connectivity"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium"
            style={{ color: online ? C.green : C.amber, background: (online ? C.green : C.amber) + "14" }}>
            {online ? <Signal size={14} /> : <WifiOff size={14} />}<span className="hidden sm:inline">{pickL(online ? U.online : U.offline, lang)}</span>
          </button>
          <div className="flex items-center rounded-lg p-0.5" style={{ background: dark ? C.inkPanel : C.paper }}>
            {langs.map(([k, t]) => (
              <button key={k} onClick={() => setLang(k)} className="rounded-md px-2 py-1 text-xs font-semibold"
                style={{ background: lang === k ? (dark ? C.inkCard : C.card) : "transparent", color: lang === k ? C.green : (dark ? C.inkSub : C.faint), boxShadow: lang === k ? "0 1px 2px rgba(0,0,0,.06)" : "none" }}>{t}</button>
            ))}
          </div>
          <div className="flex items-center rounded-lg p-0.5" style={{ background: dark ? C.inkPanel : C.paper }}>
            {[["farmer", U.farmer, Sprout], ["officer", U.officer, LayoutDashboard]].map(([k, lbl, Ic]) => (
              <button key={k} onClick={() => setRole(k)} className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold"
                style={{ background: role === k ? C.green : "transparent", color: role === k ? "#fff" : (dark ? C.inkSub : C.faint) }}>
                <Ic size={13} /><span className="hidden sm:inline">{pickL(lbl, lang)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   FARMER APP
   ========================================================================== */
function DemoLeaf() {
  return (
    <svg viewBox="0 0 200 150" className="w-full" style={{ height: 150 }}>
      <rect width="200" height="150" fill="#eef3ec" />
      <path d="M100 20c-30 8-52 34-52 74 34 2 62-16 66-52" fill="#2f7d3e" />
      <path d="M100 20c30 8 46 34 44 68-30 4-56-14-60-46" fill="#3d8b49" />
      <path d="M100 24C90 60 80 96 78 130" stroke="#1f5a2b" strokeWidth="2" fill="none" />
      {[["58", "70"], ["132", "64"], ["70", "96"], ["120", "100"], ["96", "56"]].map(([cxp, cyp], i) => (
        <g key={i}><circle cx={cxp} cy={cyp} r={7 + (i % 3)} fill="#6b4a1c" opacity="0.85" /><circle cx={cxp} cy={cyp} r={3.5} fill="#3a2a10" /></g>
      ))}
    </svg>
  );
}

function FarmerApp({ lang, reports, setReports, alerts, setAlerts, online, lastScan, setLastScan, setToast }) {
  const [view, setView] = useState("home");
  const [crop, setCrop] = useState(null);
  const [image, setImage] = useState(null); // dataURL | 'demo'
  const [imgFile, setImgFile] = useState(null);
  const [quality, setQuality] = useState(null); // {grade,score}
  const [dx, setDx] = useState(null);
  const [risk, setRisk] = useState(null);
  const [wRisk, setWRisk] = useState(null);
  const [nearby, setNearby] = useState(0);
  const [step, setStep] = useState(0);
  const [follow, setFollow] = useState(null);
  const [wOverride, setWOverride] = useState({ humidity: WEATHER.humidity, rainProb: WEATHER.rainProb });
  const [fName, setFName] = useState("Vithal Patil");
  const [fDesc, setFDesc] = useState("");
  const [submittedId, setSubmittedId] = useState(null);
  const fileRef = useRef(null);

  const t = (k) => pickL(U[k], lang);
  const cName = (key) => pickL(CROPS[key]?.name, lang);
  const dName = (key) => pickL(DISEASES[key]?.name, lang);

  const farmHealth = 82;
  const homeRisk = riskBand(24); // LOW at home baseline

  const onFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (!f.type.startsWith("image/")) { setToast(pickL(L("Please choose an image file", "कृपया इमेज फ़ाइल चुनें", "कृपया इमेज फाइल निवडा"), lang)); return; }
    if (f.size > 12 * 1024 * 1024) { setToast(pickL(L("Image too large (max 12 MB)", "इमेज बहुत बड़ी (अधिकतम 12MB)", "इमेज खूप मोठी (कमाल 12MB)"), lang)); return; }
    setImgFile(f);
    const rd = new FileReader();
    rd.onload = () => {
      setImage(rd.result);
      const im = new Image();
      im.onload = () => setQuality(assessImage(f, im.naturalWidth, im.naturalHeight));
      im.onerror = () => setQuality(assessImage(f, 800, 600));
      im.src = rd.result;
    };
    rd.readAsDataURL(f);
  };
  const useDemo = () => { setImage("demo"); setImgFile(null); setQuality(assessImage(null)); };

  // analysing sequence
  const STEPS = ["Preprocessing image", "Detecting crop", "Classifying disease", "Estimating severity", "Computing risk"];
  useEffect(() => {
    if (view !== "analyzing") return;
    setStep(0);
    const near = crop ? reports.filter((r) => r.disease === PRIMARY[crop] && havKm(r, ANCHORS.Nagpur) <= 12 && r.daysAgo <= 7).length : 0;
    let i = 0;
    const iv = setInterval(() => { i += 1; setStep(i); if (i >= STEPS.length) { clearInterval(iv); finish(near); } }, 520);
    return () => clearInterval(iv);
    // eslint-disable-next-line
  }, [view]);

  const finish = (near) => {
    const d = runDemoInference(crop);
    const wr = weatherRisk(WEATHER, d.type);
    const stage = (STAGES[crop] || ["Vegetative"])[1] || "Vegetative";
    const rk = computeRisk({ confidence: d.confidence, severityPct: d.severityPct, weatherScore: wr.score, nearbyCount: near, stage });
    setDx(d); setWRisk(wr); setRisk(rk); setNearby(near);
    setWOverride({ humidity: WEATHER.humidity, rainProb: WEATHER.rainProb });
    setLastScan({ crop, diseaseKey: d.diseaseKey, severityPct: d.severityPct, stage });
    setView("result");
  };

  // live risk recomputed from the weather what-if sliders (transparent relationship)
  const liveWeather = { ...WEATHER, humidity: wOverride.humidity, rainProb: wOverride.rainProb };
  const liveWRisk = dx ? weatherRisk(liveWeather, dx.type) : null;
  const liveRisk = dx ? computeRisk({ confidence: dx.confidence, severityPct: dx.severityPct, weatherScore: liveWRisk.score, nearbyCount: nearby, stage: (STAGES[crop] || ["Vegetative"])[1] || "Vegetative" }) : risk;

  const submitReport = () => {
    const jLat = ANCHORS.Nagpur.lat + (Math.random() - 0.5) * 0.1;
    const jLng = ANCHORS.Nagpur.lng + (Math.random() - 0.5) * 0.1;
    const id = nextReportId();
    const highRisk = (liveRisk?.band || dx.band) === "high" || ["severe", "critical"].includes(dx.band);
    const nr = {
      id, crop, disease: dx.diseaseKey, district: "Nagpur", lat: jLat, lng: jLng,
      severityPct: dx.severityPct, band: dx.band, daysAgo: 0, confidence: dx.confidence,
      farmer: fName || "Farmer", note: fDesc || "", stage: (STAGES[crop] || ["Vegetative"])[1] || "Vegetative",
      riskScore: liveRisk?.score ?? risk?.score ?? 0, riskLevel: liveRisk?.band ?? risk?.band ?? "moderate",
      image: image === "demo" ? null : image, quality: quality?.grade || "good",
      createdAt: Date.now(), status: online ? "pending" : "queued", priority: highRisk,
    };
    setReports((p) => [nr, ...p]);
    // event-driven alerts (connected to the real report just created)
    const newAlerts = [{ id: "A" + id, audience: "officer", type: "new_report", read: false, createdAt: Date.now(),
      title: pickL(L("New farmer report received", "नई किसान रिपोर्ट प्राप्त", "नवीन शेतकरी अहवाल प्राप्त"), lang),
      body: `${dName(dx.diseaseKey)} · ${cName(crop)} · ${id}`, district: "Nagpur" }];
    if (highRisk) newAlerts.unshift({ id: "AH" + id, audience: "farmers", type: "high_risk", read: false, createdAt: Date.now(),
      title: pickL(L("High disease risk detected", "उच्च रोग जोखिम पाया गया", "उच्च रोग धोका आढळला"), lang),
      body: `${dName(dx.diseaseKey)} · ${cName(crop)} · ${pickL(riskName[nr.riskLevel] || riskName.high, lang)}`, district: "Nagpur" });
    setAlerts((p) => [...newAlerts, ...p]);
    setSubmittedId(id);
    setView("reportDone");
  };

  const startFollow = () => {
    if (!lastScan) return;
    setFollow("analyzing");
    setTimeout(() => {
      const prev = lastScan.severityPct;
      const curr = Math.max(6, Math.round(prev * 0.5));
      const tl = [{ day: "Day 1", sev: prev }, { day: "Day 4", sev: Math.round(prev * 0.82) }, { day: "Day 8", sev: Math.round(prev * 0.66) }, { day: "Day 14", sev: curr }];
      setFollow({ prev, curr, tl });
    }, 1400);
  };

  const Shell = ({ children, back, title }) => (
    <div className="mx-auto w-full max-w-md px-4 pb-24 pt-4">
      {back && (
        <button onClick={back} className="mb-3 inline-flex items-center gap-1 text-sm font-medium" style={{ color: C.sub }}>
          <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} />{title}
        </button>
      )}
      {children}
    </div>
  );

  const Card = ({ children, style }) => (
    <div className="rounded-2xl border p-4" style={{ background: C.card, borderColor: C.line, ...style }}>{children}</div>
  );

  /* ---- HOME ---- */
  if (view === "home") {
    const activeAlerts = alerts.filter((a) => a.audience === "farmers" && !a.read);
    return (
      <Shell>
        {!online && <div className="mb-3 rounded-xl px-3 py-2 text-sm" style={{ background: C.amberSoft, color: C.amber }}>{t("offlineNote")}</div>}
        <div className="mb-1 text-sm" style={{ color: C.sub }}>{t("greeting")} 👋</div>
        <div className="mb-4 text-2xl font-bold" style={{ color: C.text, letterSpacing: "-0.02em" }}>Vithal</div>

        <div className="mb-3 flex gap-3">
          <Card style={{ flex: 1 }}>
            <div className="mb-2 text-xs font-medium" style={{ color: C.sub }}>{t("farmHealth")}</div>
            <div className="flex items-center gap-3">
              <Ring value={farmHealth} size={72} />
              <div>
                <div className="text-xs" style={{ color: C.sub }}>{t("currentRisk")}</div>
                <div className="text-lg font-bold" style={{ color: homeRisk.color }}>{pickL(riskName.low, lang)}</div>
              </div>
            </div>
          </Card>
        </div>

        <Card style={{ marginBottom: 12 }}>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-medium" style={{ color: C.sub }}>{t("weather")} · Nagpur</div>
            <CloudRain size={16} style={{ color: C.sky }} />
          </div>
          <div className="flex items-center justify-between">
            {[[Thermometer, WEATHER.tempC + "°", t("temp")], [Droplets, WEATHER.humidity + "%", t("humidity")], [CloudRain, WEATHER.rainProb + "%", t("rain")], [Wind, WEATHER.windKph, t("wind")]].map(([Ic, v, l], i) => (
              <div key={i} className="text-center">
                <Ic size={16} style={{ color: C.faint, margin: "0 auto" }} />
                <div className="mt-1 font-bold" style={{ color: C.text }}>{v}</div>
                <div className="text-xs" style={{ color: C.faint }}>{l}</div>
              </div>
            ))}
          </div>
        </Card>

        <div className="mb-3 grid grid-cols-1 gap-3">
          <button onClick={() => { setCrop(null); setImage(null); setView("crop"); }}
            className="flex items-center justify-between rounded-2xl p-4 text-left" style={{ background: C.green }}>
            <div>
              <div className="text-lg font-bold text-white">{t("scanCrop")}</div>
              <div className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>{t("addPhoto")}</div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "rgba(255,255,255,0.16)" }}><Camera size={22} color="#fff" /></div>
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setCrop(null); setImage(null); setView("report"); }} className="rounded-2xl border p-3 text-left" style={{ borderColor: C.line, background: C.card }}>
              <FileText size={20} style={{ color: C.amber }} />
              <div className="mt-2 font-semibold" style={{ color: C.text }}>{t("reportProblem")}</div>
            </button>
            <button onClick={() => setView("followup")} className="rounded-2xl border p-3 text-left" style={{ borderColor: C.line, background: C.card }}>
              <Activity size={20} style={{ color: C.teal }} />
              <div className="mt-2 font-semibold" style={{ color: C.text }}>{t("followTitle")}</div>
            </button>
          </div>
        </div>

        {activeAlerts.map((a) => (
          <Card key={a.id} style={{ marginBottom: 10, borderColor: C.redSoft, background: C.redSoft }}>
            <div className="flex items-start gap-2">
              <Bell size={18} style={{ color: C.red, marginTop: 2 }} />
              <div className="flex-1">
                <div className="font-semibold" style={{ color: C.red }}>{a.title}</div>
                <div className="text-sm" style={{ color: "#8a3a2c" }}>{a.body}</div>
              </div>
              <button onClick={() => setAlerts((p) => p.map((x) => x.id === a.id ? { ...x, read: true } : x))}
                className="rounded-lg px-2 py-1 text-xs font-semibold" style={{ color: C.red, background: "rgba(189,63,45,0.12)" }}>
                {pickL(L("Dismiss", "हटाएं", "काढा"), lang)}
              </button>
            </div>
          </Card>
        ))}

        <div className="mb-2 text-sm font-semibold" style={{ color: C.sub }}>{t("yourCrops")}</div>
        <div className="flex gap-2">
          {["wheat", "tomato", "maize"].map((k) => (
            <div key={k} className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: C.line, background: C.card }}>
              <span style={{ fontSize: 18 }}>{CROPS[k].emoji}</span><span className="text-sm font-medium" style={{ color: C.text }}>{cName(k)}</span>
            </div>
          ))}
        </div>
      </Shell>
    );
  }

  /* ---- CROP SELECT ---- */
  if (view === "crop") {
    return (
      <Shell back={() => setView("home")} title={t("backHome")}>
        <div className="mb-4 text-xl font-bold" style={{ color: C.text }}>{t("selectCrop")}</div>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(CROPS).map(([k, c]) => (
            <button key={k} onClick={() => { setCrop(k); setView("capture"); }}
              className="flex flex-col items-center gap-1 rounded-2xl border p-3" style={{ borderColor: crop === k ? C.green : C.line, background: crop === k ? C.greenSoft : C.card }}>
              <span style={{ fontSize: 26 }}>{c.emoji}</span>
              <span className="text-xs font-semibold text-center" style={{ color: C.text }}>{cName(k)}</span>
            </button>
          ))}
        </div>
      </Shell>
    );
  }

  /* ---- CAPTURE ---- */
  if (view === "capture") {
    return (
      <Shell back={() => setView("crop")} title={t("selectCrop")}>
        <div className="mb-3 flex items-center gap-2">
          <Badge color={C.green}>{CROPS[crop].emoji} {cName(crop)}</Badge>
        </div>
        <Card style={{ marginBottom: 12, padding: 0, overflow: "hidden" }}>
          {image ? (image === "demo" ? <DemoLeaf /> : <img src={image} alt="leaf" className="w-full" style={{ height: 200, objectFit: "cover" }} />)
            : <div className="flex flex-col items-center justify-center" style={{ height: 200, background: "#f2f5f2" }}>
                <Camera size={34} style={{ color: C.faint }} />
                <div className="mt-2 text-sm" style={{ color: C.faint }}>{t("addPhoto")}</div>
              </div>}
        </Card>
        {image && quality && (
          <div className="mb-3 flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ background: QUALITY[quality.grade].color + "12" }}>
            <span style={{ fontSize: 15 }}>{QUALITY[quality.grade].icon}</span>
            <div>
              <div className="text-sm font-semibold" style={{ color: QUALITY[quality.grade].color }}>
                {pickL(L("Image quality", "इमेज गुणवत्ता", "इमेज गुणवत्ता"), lang)}: {pickL(QUALITY[quality.grade].label, lang)} · {quality.score}/100
              </div>
              <div className="text-xs" style={{ color: C.sub }}>{pickL(QUALITY[quality.grade].note, lang)}</div>
            </div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} style={{ display: "none" }} />
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-xl border py-3 font-semibold" style={{ borderColor: C.line, color: C.text }}>
            <Upload size={18} />{image ? t("retake") : t("uploadPhoto")}
          </button>
          <button onClick={useDemo} className="inline-flex items-center justify-center gap-2 rounded-xl border py-3 font-semibold" style={{ borderColor: C.line, color: C.text }}>
            <Sparkles size={18} />{t("useDemoLeaf")}
          </button>
        </div>
        <button disabled={!image} onClick={() => setView("analyzing")}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white"
          style={{ background: image ? C.green : "#b9c6bf" }}>
          <Stethoscope size={18} />{t("analyze")}
        </button>
      </Shell>
    );
  }

  /* ---- ANALYSING ---- */
  if (view === "analyzing") {
    return (
      <Shell>
        <div className="flex flex-col items-center pt-10">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full" style={{ background: C.greenSoft }}>
            <Loader2 size={40} className="kr-spin" style={{ color: C.green }} />
          </div>
          <div className="mt-5 text-lg font-bold" style={{ color: C.text }}>{t("analysing")}</div>
          <Badge color={C.amber} bg={C.amberSoft}>{t("demoBadge")}</Badge>
          <div className="mt-6 w-full max-w-xs">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                {i < step ? <CheckCircle2 size={18} style={{ color: C.green }} /> : i === step ? <Loader2 size={18} className="kr-spin" style={{ color: C.amber }} /> : <div className="h-4 w-4 rounded-full" style={{ border: "2px solid #d6ddd8" }} />}
                <span className="text-sm" style={{ color: i <= step ? C.text : C.faint }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  /* ---- RESULT ---- */
  if (view === "result" && dx) {
    const rb = riskBand(liveRisk.score);
    const tier = confTier(dx.confidence);
    const tierColor = tier.key === "high" ? C.green : tier.key === "medium" ? C.amber : C.red;
    return (
      <Shell back={() => setView("capture")} title={t("retake")}>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xl font-bold" style={{ color: C.text }}>{t("detected")}</div>
          <Badge color={C.amber} bg={C.amberSoft}>{t("demoBadge")}</Badge>
        </div>
        {/* confidence-aware headline — never over-claims certainty */}
        <div className="mb-3 rounded-xl px-3 py-2.5" style={{ background: tierColor + "12", border: `1px solid ${tierColor}33` }}>
          <div className="font-semibold" style={{ color: tierColor }}>
            {pickL(tier.verb, lang)} {dName(dx.diseaseKey)}
          </div>
          <div className="text-xs" style={{ color: C.sub }}>
            {tier.key === "high" && pickL(L("High-confidence match. Confirm with your agriculture officer before treatment.", "उच्च-विश्वास मिलान। उपचार से पहले कृषि अधिकारी से पुष्टि करें।", "उच्च-विश्वास जुळणी. उपचारापूर्वी कृषी अधिकाऱ्याकडून खात्री करा."), lang)}
            {tier.key === "medium" && pickL(L("Possible match — add a clearer close-up to verify.", "संभावित मिलान — पुष्टि हेतु साफ नज़दीकी फोटो जोड़ें।", "शक्य जुळणी — खात्रीसाठी स्पष्ट जवळून फोटो जोडा."), lang)}
            {tier.key === "low" && pickL(L("Not confident — please capture a clearer, well-lit image.", "विश्वास नहीं — कृपया साफ, अच्छी रोशनी वाला फोटो लें।", "खात्री नाही — कृपया स्पष्ट, चांगल्या प्रकाशातील फोटो घ्या."), lang)}
          </div>
          {tier.key === "low" && (
            <button onClick={() => { setImage(null); setQuality(null); setView("capture"); }} className="mt-2 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-white" style={{ background: C.red }}>
              <Camera size={13} />{pickL(L("Capture better image", "बेहतर फोटो लें", "चांगला फोटो घ्या"), lang)}
            </button>
          )}
        </div>
        <Card style={{ marginBottom: 12 }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs" style={{ color: C.sub }}>{t("cropDetected")}</div>
              <div className="text-base font-semibold" style={{ color: C.text }}>{CROPS[crop].emoji} {cName(crop)}</div>
              <div className="mt-2 text-xs" style={{ color: C.sub }}>{t("detected")}</div>
              <div className="text-lg font-bold" style={{ color: C.text }}>{dName(dx.diseaseKey)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs" style={{ color: C.sub }}>{t("confidence")}</div>
              <div className="text-2xl font-bold" style={{ color: tierColor }}>{dx.confidence}%</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3" style={{ background: C.paper }}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs" style={{ color: C.sub }}>{t("severity")}</span>
                <span className="text-xs font-bold" style={{ color: sevBand(dx.severityPct).color }}>{pickL(sevName[dx.band], lang)} · {dx.severityPct}%</span>
              </div>
              <SeverityBar pct={dx.severityPct} />
            </div>
            <div className="rounded-xl p-3" style={{ background: rb.color + "12" }}>
              <div className="text-xs" style={{ color: C.sub }}>{t("risk")}</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold" style={{ color: rb.color }}>{pickL(riskName[rb.key], lang)}</span>
                <span className="text-sm font-semibold" style={{ color: rb.color }}>{liveRisk.score}/100</span>
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs" style={{ color: C.faint }}>{t("estimateNote")}</div>
        </Card>

        <Card style={{ marginBottom: 12, background: rb.color + "0d", borderColor: rb.color + "33" }}>
          <div className="mb-2 flex items-center gap-2 font-semibold" style={{ color: rb.color }}><Gauge size={16} />{t("whyRisk")}</div>
          {liveRisk.factors.map((f, i) => (
            <div key={i} className="mb-2">
              <div className="mb-0.5 flex items-center justify-between text-xs" style={{ color: C.sub }}>
                <span>{f.label} <span style={{ color: C.faint }}>({f.weight})</span></span><span className="font-semibold" style={{ color: C.text }}>{f.value}</span>
              </div>
              <div className="h-1.5 w-full rounded-full" style={{ background: "#e7ebe8" }}><div className="h-full rounded-full" style={{ width: f.value + "%", background: rb.color, transition: "width .4s ease" }} /></div>
            </div>
          ))}
          {/* interactive weather what-if — makes the weather→risk relationship transparent */}
          <div className="mt-2 rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.65)" }}>
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold" style={{ color: C.sky }}>
              <CloudRain size={13} />{pickL(L("Weather what-if (demo)", "मौसम परिदृश्य (डेमो)", "हवामान परिस्थिती (डेमो)"), lang)}
            </div>
            {[["humidity", t("humidity"), wOverride.humidity], ["rainProb", t("rain"), wOverride.rainProb]].map(([key, label, val]) => (
              <div key={key} className="mb-1.5">
                <div className="flex items-center justify-between text-xs" style={{ color: C.sub }}>
                  <span>{label}</span><span className="font-semibold" style={{ color: C.text }}>{val}%</span>
                </div>
                <input type="range" min="0" max="100" value={val} onChange={(e) => setWOverride((o) => ({ ...o, [key]: +e.target.value }))}
                  className="w-full" style={{ accentColor: C.sky }} />
              </div>
            ))}
            <div className="text-xs" style={{ color: C.faint }}>
              {nearby} {pickL(U.nearby, lang).toLowerCase()} · {pickL(L("higher humidity + rain raises fungal risk", "अधिक नमी + बारिश से फफूंद जोखिम बढ़ता है", "जास्त आर्द्रता + पाऊस बुरशी धोका वाढवतो"), lang)}.
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold" style={{ color: C.text }}><Eye size={15} />{t("indicators")}</div>
            {dx.indicators.map((x, i) => <div key={i} className="mb-1 flex gap-1.5 text-xs" style={{ color: C.sub }}><span style={{ color: C.amber }}>•</span>{x}</div>)}
          </Card>
          <Card>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold" style={{ color: C.text }}><Info size={15} />{t("causes")}</div>
            <div className="text-xs" style={{ color: C.sub }}>{pickL(DISEASES[dx.diseaseKey].why, lang)}</div>
          </Card>
        </div>

        <button onClick={() => setView("advisory")} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white" style={{ background: C.green }}>
          <ClipboardList size={18} />{t("viewAdvisory")}
        </button>
        <button onClick={() => setView("compose")} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border py-3 font-semibold" style={{ borderColor: C.line, color: C.text }}>
          <Send size={17} />{t("submitReport")}
        </button>
      </Shell>
    );
  }

  /* ---- ADVISORY ---- */
  if (view === "advisory" && dx) {
    const d = DISEASES[dx.diseaseKey];
    const Section = ({ icon, title, color, children }) => (
      <Card style={{ marginBottom: 10 }}>
        <div className="mb-1.5 flex items-center gap-2 font-semibold" style={{ color }}>{icon}{title}</div>
        {children}
      </Card>
    );
    const listBlock = (obj) => (pickL(obj, lang) || []).map((x, i) => (
      <div key={i} className="mb-1 flex gap-2 text-sm" style={{ color: C.sub }}><Check size={15} style={{ color: C.green, marginTop: 2, flexShrink: 0 }} />{x}</div>
    ));
    return (
      <Shell back={() => setView("result")} title={t("detected")}>
        <div className="mb-3">
          <div className="text-xl font-bold" style={{ color: C.text }}>{dName(dx.diseaseKey)}</div>
          <div className="text-sm" style={{ color: C.sub }}>{CROPS[crop].emoji} {cName(crop)} · {pickL(sevName[dx.band], lang)}</div>
        </div>
        <Section icon={<Info size={16} />} title={t("whatHappened")} color={C.text}><div className="text-sm" style={{ color: C.sub }}>{pickL(d.what, lang)}</div></Section>
        <Section icon={<CloudRain size={16} />} title={t("whyHappened")} color={C.sky}><div className="text-sm" style={{ color: C.sub }}>{pickL(d.why, lang)}</div></Section>
        <Section icon={<Zap size={16} />} title={t("doNow")} color={C.green}>{listBlock(d.doNow)}</Section>
        <Section icon={<XCircle size={16} />} title={t("avoid")} color={C.red}>{listBlock(d.avoid)}</Section>
        <Section icon={<ShieldCheck size={16} />} title={t("prevent")} color={C.teal}>{listBlock(d.prevent)}</Section>
        <div className="mb-3 rounded-xl px-3 py-2.5 text-sm" style={{ background: C.amberSoft, color: "#7a5310" }}>
          <div className="flex gap-2"><AlertTriangle size={16} style={{ color: C.amber, flexShrink: 0, marginTop: 2 }} />{t("consult")}</div>
        </div>
        <button onClick={() => setView("compose")} className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white" style={{ background: C.green }}>
          <Send size={18} />{t("submitReport")}
        </button>
      </Shell>
    );
  }

  /* ---- COMPOSE (capture farmer name + optional note before submit) ---- */
  if (view === "compose" && dx) {
    return (
      <Shell back={() => setView("result")} title={t("detected")}>
        <div className="mb-3 text-xl font-bold" style={{ color: C.text }}>{t("submitReport")}</div>
        <Card style={{ marginBottom: 12 }}>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="font-semibold" style={{ color: C.text }}>{dName(dx.diseaseKey)}</div>
              <div className="text-xs" style={{ color: C.sub }}>{CROPS[crop].emoji} {cName(crop)} · {pickL(sevName[dx.band], lang)} · {dx.confidence}%</div>
            </div>
            <Badge color={riskBand(liveRisk.score).color} bg={riskBand(liveRisk.score).color + "18"}>{pickL(riskName[riskBand(liveRisk.score).key], lang)}</Badge>
          </div>
          {image && (image === "demo" ? <div style={{ height: 90, borderRadius: 10, overflow: "hidden" }}><DemoLeaf /></div> : <img src={image} alt="leaf" style={{ height: 90, width: "100%", objectFit: "cover", borderRadius: 10 }} />)}
        </Card>
        <div className="mb-2 text-xs font-medium" style={{ color: C.sub }}>{pickL(L("Your name", "आपका नाम", "तुमचे नाव"), lang)}</div>
        <input value={fName} onChange={(e) => setFName(e.target.value)} className="mb-3 w-full rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: C.line, color: C.text, background: C.card }} />
        <div className="mb-2 text-xs font-medium" style={{ color: C.sub }}>{pickL(L("Notes (optional)", "टिप्पणी (वैकल्पिक)", "टिपणी (ऐच्छिक)"), lang)}</div>
        <textarea value={fDesc} onChange={(e) => setFDesc(e.target.value)} rows={3} placeholder={pickL(L("e.g. spots started 3 days ago on lower leaves", "जैसे 3 दिन पहले निचली पत्तियों पर धब्बे शुरू हुए", "उदा. 3 दिवसांपूर्वी खालच्या पानांवर ठिपके सुरू झाले"), lang)}
          className="mb-3 w-full rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: C.line, color: C.text, background: C.card }} />
        <div className="mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm" style={{ background: C.paper, color: C.sub }}><MapPin size={15} style={{ color: C.green }} /> Nagpur, Maharashtra · GPS attached</div>
        <button onClick={submitReport} className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white" style={{ background: C.green }}>
          <Send size={18} />{t("submitReport")}
        </button>
      </Shell>
    );
  }

  /* ---- REPORT DONE ---- */
  if (view === "reportDone") {
    return (
      <Shell>
        <div className="flex flex-col items-center pt-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ background: C.greenSoft }}><CheckCircle2 size={44} style={{ color: C.green }} /></div>
          <div className="mt-4 text-2xl font-bold" style={{ color: C.text }}>{t("reportSent")}</div>
          {submittedId && <div className="mt-1 rounded-lg px-3 py-1 font-mono text-sm font-bold" style={{ background: C.greenSoft, color: C.green }}>{submittedId}</div>}
          <div className="mt-2 max-w-xs text-sm" style={{ color: C.sub }}>{online ? t("reportSentNote") : t("queuedNote")}</div>
          {!online && <Badge color={C.amber} bg={C.amberSoft}>{pickL(L("Queued for sync", "सिंक के लिए कतारबद्ध", "सिंकसाठी रांगेत"), lang)}</Badge>}
          <div className="mt-6 flex gap-3">
            <button onClick={() => setView("followup")} className="rounded-xl border px-4 py-2.5 font-semibold" style={{ borderColor: C.line, color: C.text }}>{t("followTitle")}</button>
            <button onClick={() => setView("home")} className="rounded-xl px-4 py-2.5 font-semibold text-white" style={{ background: C.green }}>{t("backHome")}</button>
          </div>
        </div>
      </Shell>
    );
  }

  /* ---- REPORT (manual) ---- */
  if (view === "report") {
    return (
      <Shell back={() => setView("home")} title={t("backHome")}>
        <div className="mb-4 text-xl font-bold" style={{ color: C.text }}>{t("reportProblem")}</div>
        <Card style={{ marginBottom: 12 }}>
          <div className="mb-1 text-xs" style={{ color: C.sub }}>{t("selectCrop")}</div>
          <div className="mb-3 flex flex-wrap gap-2">
            {["tomato", "cotton", "wheat", "rice"].map((k) => (
              <button key={k} onClick={() => setCrop(k)} className="rounded-lg border px-3 py-1.5 text-sm font-medium" style={{ borderColor: crop === k ? C.green : C.line, background: crop === k ? C.greenSoft : C.card, color: C.text }}>{CROPS[k].emoji} {cName(k)}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm" style={{ background: C.paper, color: C.sub }}><MapPin size={15} style={{ color: C.green }} /> Nagpur, Maharashtra · GPS attached</div>
        </Card>
        <button onClick={() => { setCrop(crop || "tomato"); setImage("demo"); setQuality(assessImage(null)); setView("capture"); }} className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white" style={{ background: C.green }}>
          <Camera size={18} />{t("addPhoto")}
        </button>
      </Shell>
    );
  }

  /* ---- FOLLOW-UP ---- */
  if (view === "followup") {
    return (
      <Shell back={() => setView("home")} title={t("backHome")}>
        <div className="mb-4 text-xl font-bold" style={{ color: C.text }}>{t("followTitle")}</div>
        {!lastScan ? (
          <Card><div className="text-sm" style={{ color: C.sub }}>{t("scanFirst")}</div>
            <button onClick={() => setView("crop")} className="mt-3 rounded-xl px-4 py-2.5 font-semibold text-white" style={{ background: C.green }}>{t("scanCrop")}</button>
          </Card>
        ) : follow === "analyzing" ? (
          <div className="flex flex-col items-center pt-8"><Loader2 size={36} className="kr-spin" style={{ color: C.green }} /><div className="mt-3 text-sm" style={{ color: C.sub }}>{t("analysing")}</div></div>
        ) : follow ? (
          <>
            <Card style={{ marginBottom: 12 }}>
              <div className="mb-3 flex items-center gap-2"><Badge color={C.green}>{dName(lastScan.diseaseKey)}</Badge></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3 text-center" style={{ background: C.paper }}>
                  <div className="text-xs" style={{ color: C.sub }}>{t("previous")}</div>
                  <div className="text-2xl font-bold" style={{ color: sevBand(follow.prev).color }}>{follow.prev}%</div>
                  <div className="text-xs" style={{ color: C.faint }}>{pickL(sevName[sevBand(follow.prev).key], lang)}</div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: C.greenSoft }}>
                  <div className="text-xs" style={{ color: C.sub }}>{t("current")}</div>
                  <div className="text-2xl font-bold" style={{ color: sevBand(follow.curr).color }}>{follow.curr}%</div>
                  <div className="text-xs" style={{ color: C.faint }}>{pickL(sevName[sevBand(follow.curr).key], lang)}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold" style={{ background: C.greenSoft, color: C.green }}>
                <TrendingUp size={18} style={{ transform: "scaleY(-1)" }} />{t("improving")}
              </div>
            </Card>
            <Card>
              <div className="mb-3 text-sm font-semibold" style={{ color: C.text }}>{t("timeline")}</div>
              <div className="flex items-end justify-between gap-2" style={{ height: 110 }}>
                {follow.tl.map((p, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1" style={{ height: "100%" }}>
                    <div className="text-xs font-bold" style={{ color: sevBand(p.sev).color }}>{p.sev}%</div>
                    <div className="w-full rounded-t-md" style={{ height: p.sev + "%", background: sevBand(p.sev).color, transition: "height .6s ease" }} />
                    <div className="text-xs" style={{ color: C.faint }}>{p.day}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs" style={{ color: C.faint }}>{t("estimateNote")}</div>
            </Card>
          </>
        ) : (
          <Card>
            <div className="mb-3 text-sm" style={{ color: C.sub }}>{dName(lastScan.diseaseKey)} · {t("previous")} {lastScan.severityPct}%</div>
            <button onClick={startFollow} className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white" style={{ background: C.green }}>
              <Camera size={18} />{t("uploadFollow")}
            </button>
          </Card>
        )}
      </Shell>
    );
  }

  return null;
}

/* ============================================================================
   OFFICER DASHBOARD
   ========================================================================== */
function HotspotMap({ reports, lang, onSelect }) {
  const rm = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const land = "M 150 230 C 180 150, 300 110, 430 120 C 520 126, 560 90, 650 100 C 760 112, 880 120, 900 200 C 915 260, 860 300, 840 350 C 820 400, 830 470, 760 500 C 690 528, 620 500, 560 520 C 500 540, 470 560, 420 545 C 360 527, 350 470, 300 440 C 240 405, 150 400, 140 330 C 135 290, 130 260, 150 230 Z";
  const outbreaks = detectOutbreaks(reports);
  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ background: "#0c1a22", border: `1px solid ${C.inkLine}` }}>
      <svg viewBox="0 0 1000 640" className="w-full" style={{ display: "block" }}>
        {/* graticule */}
        {[120, 240, 360, 480, 600, 720, 840, 960].map((x) => <line key={"v" + x} x1={x} y1={0} x2={x} y2={640} stroke="#132732" strokeWidth="1" />)}
        {[80, 160, 240, 320, 400, 480, 560].map((y) => <line key={"h" + y} x1={0} y1={y} x2={1000} y2={y} stroke="#132732" strokeWidth="1" />)}
        {/* risk zone tints */}
        <ellipse cx={proj(21.05, 79.1).x} cy={proj(21.05, 79.1).y} rx="120" ry="90" fill={C.red} opacity="0.16" />
        <ellipse cx={proj(20.4, 78.0).x} cy={proj(20.4, 78.0).y} rx="80" ry="60" fill={C.amber} opacity="0.14" />
        <ellipse cx={proj(18.5, 73.9).x} cy={proj(18.5, 73.9).y} rx="70" ry="55" fill={C.amber} opacity="0.12" />
        {/* land */}
        <path d={land} fill="#16303b" stroke="#2b4a58" strokeWidth="2" />
        <path d={land} fill="none" stroke="#3a6070" strokeWidth="1" opacity="0.4" />
        {/* outbreak rings */}
        {outbreaks.map((o, i) => {
          const p = proj(o.centroid.lat, o.centroid.lng);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="70" fill="none" stroke={C.red} strokeWidth="2" strokeDasharray="6 6" opacity="0.8">
                {!rm && <animate attributeName="r" values="60;82;60" dur="3s" repeatCount="indefinite" />}
                {!rm && <animate attributeName="opacity" values="0.8;0.25;0.8" dur="3s" repeatCount="indefinite" />}
              </circle>
              <text x={p.x} y={p.y - 84} fill={C.red} fontSize="16" fontWeight="700" textAnchor="middle">⚠ {o.count} {pickL(U.reportsWord, lang)}</text>
            </g>
          );
        })}
        {/* report dots — clickable */}
        {reports.map((r) => {
          const p = proj(r.lat, r.lng); const b = sevBand(r.severityPct);
          return <g key={r.id} onClick={onSelect ? () => onSelect(r) : undefined} style={{ cursor: onSelect ? "pointer" : "default" }}>
            <circle cx={p.x} cy={p.y} r={b.key === "critical" || b.key === "severe" ? 9 : 6.5} fill={b.color} opacity="0.92" stroke="#0c1a22" strokeWidth="1.5">
              <title>{pickL(DISEASES[r.disease]?.name, lang)} · {r.severityPct}% · {r.district}</title>
            </circle>
            {onSelect && <circle cx={p.x} cy={p.y} r="16" fill="transparent" />}
          </g>;
        })}
        {/* district labels */}
        {Object.entries({ Nagpur: ANCHORS.Nagpur, Pune: ANCHORS.Pune, Nashik: ANCHORS.Nashik, Yavatmal: ANCHORS.Yavatmal, Kolhapur: ANCHORS.Kolhapur, Amravati: ANCHORS.Amravati }).map(([n, a]) => {
          const p = proj(a.lat, a.lng);
          return <text key={n} x={p.x + 10} y={p.y + 4} fill="#7f93a0" fontSize="14" fontWeight="600">{n}</text>;
        })}
        {/* north + scale */}
        <g transform="translate(940,60)"><path d="M0 -18 L6 6 L0 0 L-6 6 Z" fill="#8fa6b2" /><text x="0" y="24" fill="#8fa6b2" fontSize="12" textAnchor="middle">N</text></g>
        <g transform="translate(60,600)"><line x1="0" y1="0" x2="90" y2="0" stroke="#8fa6b2" strokeWidth="2" /><text x="0" y="-6" fill="#8fa6b2" fontSize="12">~80 km</text></g>
      </svg>
      {/* legend */}
      <div className="absolute left-3 top-3 rounded-lg px-3 py-2" style={{ background: "rgba(9,20,26,0.82)", border: `1px solid ${C.inkLine}` }}>
        <div className="mb-1 text-xs font-semibold" style={{ color: C.inkSub }}>{pickL(U.filterSev, lang)}</div>
        {[["low", "Low"], ["moderate", "Moderate"], ["severe", "Severe"], ["critical", "Critical"]].map(([k, l]) => (
          <div key={k} className="flex items-center gap-2 text-xs" style={{ color: C.inkText }}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: sevBand(k === "low" ? 12 : k === "moderate" ? 30 : k === "severe" ? 55 : 80).color }} />{pickL(sevName[k], lang)}
          </div>
        ))}
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, tint }) {
  return (
    <div className="rounded-xl border p-3" style={{ background: C.inkCard, borderColor: C.inkLine }}>
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: tint + "22" }}>{icon}</div>
      </div>
      <div className="mt-2 text-2xl font-bold" style={{ color: C.inkText }}>{value}</div>
      <div className="text-xs" style={{ color: C.inkSub }}>{label}</div>
    </div>
  );
}

function OfficerApp({ lang, reports, setReports, alerts, setAlerts, setToast }) {
  const [tab, setTab] = useState("overview");
  const [fCrop, setFCrop] = useState("all");
  const [fDis, setFDis] = useState("all");
  const [fSev, setFSev] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null); // selected report for detail modal
  const t = (k) => pickL(U[k], lang);
  const dName = (key) => pickL(DISEASES[key]?.name, lang);
  const cName = (key) => pickL(CROPS[key]?.name, lang);
  const isPending = (s) => ["pending", "ai_detected", "queued"].includes(s);
  const isOpen = (s) => !["resolved", "dismissed", "synced"].includes(s);

  const filtered = useMemo(() => reports.filter((r) => {
    const statusMatch = fStatus === "all"
      || (fStatus === "pending" && isPending(r.status))
      || (fStatus === "reviewing" && r.status === "reviewing")
      || (fStatus === "resolved" && ["resolved", "expert_verified", "confirmed"].includes(r.status));
    const ql = q.trim().toLowerCase();
    const qMatch = !ql || [r.id, r.farmer, r.district, pickL(DISEASES[r.disease]?.name, "en"), pickL(CROPS[r.crop]?.name, "en")]
      .filter(Boolean).some((x) => String(x).toLowerCase().includes(ql));
    return (fCrop === "all" || r.crop === fCrop) && (fDis === "all" || r.disease === fDis)
      && (fSev === "all" || r.band === fSev) && statusMatch && qMatch;
  }), [reports, fCrop, fDis, fSev, fStatus, q]);

  const outbreaks = useMemo(() => detectOutbreaks(reports), [reports]);
  const kpis = useMemo(() => {
    const pending = reports.filter((r) => isPending(r.status)).length;
    const resolved = reports.filter((r) => ["resolved", "expert_verified", "confirmed"].includes(r.status)).length;
    const highRisk = reports.filter((r) => ["severe", "critical"].includes(r.band) || r.riskLevel === "high").length;
    const farmers = new Set(reports.map((r) => r.farmer)).size;
    return { total: reports.length, out: outbreaks.length, pending, resolved, highRisk, farmers };
  }, [reports, outbreaks]);

  const diseaseDist = useMemo(() => {
    const m = {}; filtered.forEach((r) => (m[r.disease] = (m[r.disease] || 0) + 1));
    return Object.entries(m).map(([k, v]) => ({ name: pickL(DISEASES[k]?.name, "en"), value: v, key: k }));
  }, [filtered]);
  const cropDist = useMemo(() => {
    const m = {}; filtered.forEach((r) => (m[r.crop] = (m[r.crop] || 0) + 1));
    return Object.entries(m).map(([k, v]) => ({ name: pickL(CROPS[k]?.name, "en"), value: v }));
  }, [filtered]);
  const sevDist = useMemo(() => {
    const order = ["low", "moderate", "severe", "critical"]; const m = { low: 0, moderate: 0, severe: 0, critical: 0 };
    filtered.forEach((r) => { if (m[r.band] != null) m[r.band] += 1; });
    return order.map((k) => ({ name: pickL(sevName[k], "en"), value: m[k], color: sevBand(k === "low" ? 12 : k === "moderate" ? 30 : k === "severe" ? 55 : 80).color }));
  }, [filtered]);
  const timeSeries = useMemo(() => {
    // weekly reports, rising early-blight tail
    const base = [[3, 5], [4, 6], [5, 7], [6, 8], [7, 9], [9, 8], [12, 10], [outbreaks[0]?.count || 15, 12]];
    return base.map((v, i) => ({ week: "W" + (i + 1), earlyBlight: v[0], other: v[1] }));
  }, [outbreaks]);

  const act = (id, action) => {
    let next = null;
    setReports((p) => p.map((r) => {
      if (r.id !== id) return r;
      if (action === "review") { next = { ...r, status: "reviewing" }; return next; }
      if (action === "resolve") { next = { ...r, status: "resolved" }; return next; }
      if (action === "verify") { next = { ...r, status: "expert_verified" }; return next; }
      if (action === "reject") { next = { ...r, status: "dismissed" }; return next; }
      if (action === "info") { next = { ...r, status: "pending" }; return next; }
      if (action === "priority") { next = { ...r, priority: !r.priority }; return next; }
      return r;
    }));
    if (sel && sel.id === id && next) setSel(next);
    const msg = { review: L("Marked reviewing", "समीक्षाधीन", "पुनरावलोकनात"), resolve: L("Marked resolved", "समाधान", "निराकरण"), verify: L("Report verified", "रिपोर्ट सत्यापित", "अहवाल पडताळला"), reject: L("Report rejected", "रिपोर्ट अस्वीकृत", "अहवाल नाकारला") }[action];
    if (msg) setToast(pickL(msg, lang));
  };
  const sendAlert = (o) => {
    setAlerts((p) => [{ id: "AO" + Date.now(), audience: "farmers", type: "area", read: false, createdAt: Date.now(), title: pickL(L("High disease risk in your area", "आपके क्षेत्र में उच्च रोग जोखिम", "तुमच्या भागात उच्च रोग धोका"), lang), body: `${dName(o.disease)} · ${o.district} · ${o.count} ${t("reportsWord")}`, district: o.district }, ...p]);
    setToast(t("alertSent"));
  };

  const statusColor = (s) => ({ pending: C.amber, ai_detected: C.sky, reviewing: C.indigo, synced: C.teal, expert_verified: C.green, confirmed: C.teal, resolved: C.green, dismissed: C.red }[s] || C.faint);
  const Panel = ({ children, style }) => <div className="rounded-xl border p-4" style={{ background: C.inkPanel, borderColor: C.inkLine, ...style }}>{children}</div>;
  const PanelTitle = ({ icon, children, right }) => (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2 font-semibold" style={{ color: C.inkText }}>{icon}{children}</div>{right}
    </div>
  );

  const tabs = [["overview", U.overview, LayoutDashboard], ["map", U.map, MapPin], ["queue", U.queue, ClipboardList], ["outbreaks", U.outbreaks, AlertTriangle]];
  const queueList = filtered.filter((r) => isOpen(r.status)).sort((a, b) => (b.priority - a.priority) || (a.daysAgo - b.daysAgo));

  const filtersEl = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search size={13} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: C.inkSub }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={pickL(L("Search id, farmer, disease…", "आईडी, किसान, रोग खोजें…", "आयडी, शेतकरी, रोग शोधा…"), lang)}
          className="rounded-lg py-1.5 text-xs" style={{ paddingLeft: 26, paddingRight: 10, background: C.inkCard, color: C.inkText, border: `1px solid ${C.inkLine}`, width: 200 }} />
      </div>
      {[[fCrop, setFCrop, U.filterCrop, Object.keys(CROPS).slice(0, 8), (k) => cName(k)],
        [fDis, setFDis, U.filterDisease, Object.keys(DISEASES).filter((k) => k !== "generic"), (k) => dName(k)],
        [fSev, setFSev, U.filterSev, ["low", "moderate", "severe", "critical"], (k) => pickL(sevName[k], lang)],
        [fStatus, setFStatus, L("Status", "स्थिति", "स्थिती"), ["pending", "reviewing", "resolved"], (k) => pickL(statusName[k], lang)]].map(([val, set, lbl, opts, fmt], i) => (
        <select key={i} value={val} onChange={(e) => set(e.target.value)} className="rounded-lg px-2 py-1.5 text-xs font-medium"
          style={{ background: C.inkCard, color: C.inkText, border: `1px solid ${C.inkLine}` }}>
          <option value="all">{pickL(lbl, lang)}: {t("all")}</option>
          {opts.map((k) => <option key={k} value={k}>{fmt(k)}</option>)}
        </select>
      ))}
      {(q || fCrop !== "all" || fDis !== "all" || fSev !== "all" || fStatus !== "all") && (
        <button onClick={() => { setFCrop("all"); setFDis("all"); setFSev("all"); setFStatus("all"); setQ(""); }}
          className="rounded-lg px-2 py-1.5 text-xs font-semibold" style={{ color: C.inkSub, background: C.inkCard, border: `1px solid ${C.inkLine}` }}>
          {pickL(L("Clear", "साफ़ करें", "साफ करा"), lang)}
        </button>
      )}
    </div>
  );

  return (
    <div style={{ background: C.ink, minHeight: "100vh" }}>
      <div className="mx-auto max-w-7xl px-4 py-4">
        {/* header row */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold" style={{ color: C.inkText, letterSpacing: "-0.01em" }}>Agriculture Intelligence Dashboard</div>
            <div className="text-sm" style={{ color: C.inkSub }}>Maharashtra · live crop-health monitoring</div>
          </div>
          <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: C.inkPanel }}>
            {tabs.map(([k, lbl, Ic]) => (
              <button key={k} onClick={() => setTab(k)} className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold"
                style={{ background: tab === k ? C.green : "transparent", color: tab === k ? "#fff" : C.inkSub }}>
                <Ic size={14} /><span className="hidden md:inline">{pickL(lbl, lang)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* KPI row (always visible) */}
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Kpi icon={<FileText size={16} color={C.sky} />} label={t("totalReports")} value={kpis.total} tint={C.sky} />
          <Kpi icon={<Clock size={16} color={C.amber} />} label={pickL(L("Pending", "लंबित", "प्रलंबित"), lang)} value={kpis.pending} tint={C.amber} />
          <Kpi icon={<Crosshair size={16} color={C.red} />} label={t("highRisk")} value={kpis.highRisk} tint={C.red} />
          <Kpi icon={<CheckCircle2 size={16} color={C.green} />} label={pickL(L("Resolved", "समाधान", "निराकरण"), lang)} value={kpis.resolved} tint={C.green} />
          <Kpi icon={<AlertTriangle size={16} color={C.indigo} />} label={t("activeOutbreaks")} value={kpis.out} tint={C.indigo} />
          <Kpi icon={<Users size={16} color={C.teal} />} label={t("farmersAssisted")} value={kpis.farmers} tint={C.teal} />
        </div>

        {(tab === "overview" || tab === "map") && (
          <div className="mb-4"><Panel>
            <PanelTitle icon={<MapPin size={16} style={{ color: C.greenBright }} />} right={<span className="text-xs" style={{ color: C.inkSub }}>{t("showing")} {filtered.length} {t("of")} {reports.length}</span>}>{t("map")}</PanelTitle>
            <div className="mb-3">{filtersEl}</div>
            <HotspotMap reports={filtered} lang={lang} onSelect={setSel} />
          </Panel></div>
        )}

        {tab === "overview" && (
          <>
            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Panel>
                <PanelTitle icon={<TrendingUp size={16} style={{ color: C.sky }} />}>{t("casesOverTime")}</PanelTitle>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeries} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.red} stopOpacity={0.6} /><stop offset="100%" stopColor={C.red} stopOpacity={0.05} /></linearGradient>
                        <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.sky} stopOpacity={0.4} /><stop offset="100%" stopColor={C.sky} stopOpacity={0.03} /></linearGradient>
                      </defs>
                      <CartesianGrid stroke="#263b46" strokeOpacity={0.15} vertical={false} />
                      <XAxis dataKey="week" tick={{ fill: C.inkSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: C.inkSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: C.inkCard, border: `1px solid ${C.inkLine}`, borderRadius: 8, color: C.inkText }} />
                      <Area type="monotone" dataKey="earlyBlight" name="Tomato early blight" stroke={C.red} fill="url(#g1)" strokeWidth={2} />
                      <Area type="monotone" dataKey="other" name="Other" stroke={C.sky} fill="url(#g2)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
              <Panel>
                <PanelTitle icon={<Activity size={16} style={{ color: C.amber }} />}>{t("diseaseDist")}</PanelTitle>
                <div style={{ height: 200 }} className="flex items-center">
                  <ResponsiveContainer width="60%" height="100%">
                    <PieChart>
                      <Pie data={diseaseDist} dataKey="value" nameKey="name" innerRadius={42} outerRadius={72} paddingAngle={2}>
                        {diseaseDist.map((e, i) => <Cell key={i} fill={CATS[i % CATS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: C.inkCard, border: `1px solid ${C.inkLine}`, borderRadius: 8, color: C.inkText }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1">
                    {diseaseDist.slice(0, 6).map((d, i) => (
                      <div key={i} className="mb-1 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5" style={{ color: C.inkSub }}><span className="h-2 w-2 rounded-full" style={{ background: CATS[i % CATS.length] }} />{dName(d.key)}</span>
                        <span className="font-semibold" style={{ color: C.inkText }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            </div>
            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Panel>
                <PanelTitle icon={<Layers size={16} style={{ color: C.teal }} />}>{t("cropWise")}</PanelTitle>
                <div style={{ height: 190 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cropDist} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke="#263b46" strokeOpacity={0.15} vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: C.inkSub, fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={44} />
                      <YAxis tick={{ fill: C.inkSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: C.inkCard, border: `1px solid ${C.inkLine}`, borderRadius: 8, color: C.inkText }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={C.teal} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
              <Panel>
                <PanelTitle icon={<Gauge size={16} style={{ color: C.amber }} />}>{t("sevDist")}</PanelTitle>
                <div style={{ height: 190 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sevDist} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke="#263b46" strokeOpacity={0.15} vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: C.inkSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: C.inkSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: C.inkCard, border: `1px solid ${C.inkLine}`, borderRadius: 8, color: C.inkText }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>{sevDist.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </div>
          </>
        )}

        {/* OUTBREAKS (also shown compact on overview) */}
        {(tab === "outbreaks" || tab === "overview") && (
          <div className="mb-4"><Panel style={{ borderColor: outbreaks.length ? "#4a2a24" : C.inkLine }}>
            <PanelTitle icon={<AlertTriangle size={16} style={{ color: C.red }} />} right={<Badge color={C.red} dark>{outbreaks.length} {t("activeOutbreaks").toLowerCase()}</Badge>}>{t("outbreaks")}</PanelTitle>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {outbreaks.map((o, i) => {
                const rb = riskBand(72);
                return (
                  <div key={i} className="rounded-xl border p-3" style={{ background: "#20120f", borderColor: "#4a2a24" }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold" style={{ color: C.inkText }}>{dName(o.disease)}</span>
                          <Badge color={C.red} dark>{pickL(riskName.high, lang)}</Badge>
                        </div>
                        <div className="mt-0.5 text-sm" style={{ color: C.inkSub }}>{cName(DISEASES[o.disease].crop)} · {o.district}</div>
                      </div>
                      <span className="text-2xl">⚠</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div><div className="text-lg font-bold" style={{ color: C.inkText }}>{o.count}</div><div className="text-xs" style={{ color: C.inkFaint }}>{t("reportsWord")}</div></div>
                      <div><div className="text-lg font-bold" style={{ color: C.inkText }}>{o.radiusKm}km</div><div className="text-xs" style={{ color: C.inkFaint }}>{t("within")}</div></div>
                      <div><div className="text-lg font-bold" style={{ color: C.red }}>↑{o.inc}%</div><div className="text-xs" style={{ color: C.inkFaint }}>{t("thisWeek")}</div></div>
                    </div>
                    <button onClick={() => sendAlert(o)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-white" style={{ background: C.red }}>
                      <Bell size={14} />{t("sendAlert")}
                    </button>
                  </div>
                );
              })}
              {!outbreaks.length && <div className="text-sm" style={{ color: C.inkSub }}>No clusters currently exceed the outbreak threshold.</div>}
            </div>
          </Panel></div>
        )}

        {/* QUEUE (also compact on overview) */}
        {(tab === "queue" || tab === "overview") && (
          <Panel>
            <PanelTitle icon={<ClipboardList size={16} style={{ color: C.sky }} />} right={tab === "overview" ? <button onClick={() => setTab("queue")} className="text-xs font-semibold" style={{ color: C.greenBright }}>{pickL(L("View all", "सभी देखें", "सर्व पाहा"), lang)} →</button> : <span className="text-xs" style={{ color: C.inkSub }}>{queueList.length} {pickL(L("waiting", "प्रतीक्षा", "प्रतीक्षेत"), lang)}</span>}>{t("queue")}</PanelTitle>
            <div className="space-y-2">
              {(tab === "overview" ? queueList.slice(0, 4) : queueList).map((r) => (
                <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border p-3" style={{ background: C.inkCard, borderColor: r.priority ? C.red : C.inkLine }}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: sevBand(r.severityPct).color }} />
                  <button onClick={() => setSel(r)} className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold" style={{ color: C.inkText }}>{dName(r.disease)}</span>
                      {r.priority && <Flag size={13} style={{ color: C.red }} />}
                      {r.daysAgo === 0 && <Badge color={C.greenBright} dark>new</Badge>}
                    </div>
                    <div className="text-xs" style={{ color: C.inkSub }}>{r.id} · {CROPS[r.crop].emoji} {cName(r.crop)} · {r.district} · {r.confidence}% · {r.daysAgo === 0 ? pickL(L("today", "आज", "आज"), lang) : r.daysAgo + "d"}</div>
                  </button>
                  <Badge color={statusColor(r.status)} dark>{pickL(statusName[r.status], lang)}</Badge>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setSel(r)} title={pickL(L("Open", "खोलें", "उघडा"), lang)} className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: C.sky + "22" }}><Eye size={15} color={C.sky} /></button>
                    <button onClick={() => act(r.id, "verify")} title={t("verify")} className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: C.green + "22" }}><Check size={15} color={C.greenBright} /></button>
                    <button onClick={() => act(r.id, "reject")} title={t("reject")} className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: C.red + "22" }}><XCircle size={15} color={C.red} /></button>
                    <button onClick={() => act(r.id, "priority")} title={t("priority")} className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: C.amber + "22" }}><Flag size={15} color={C.amber} /></button>
                  </div>
                </div>
              ))}
              {!queueList.length && <div className="text-sm" style={{ color: C.inkSub }}>{t("noQueue")}</div>}
            </div>
          </Panel>
        )}
      </div>

      {/* REPORT DETAIL MODAL */}
      {sel && (() => {
        const rb = riskBand(sel.riskScore ?? (sel.severityPct + 20));
        const rl = sel.riskLevel || rb.key;
        const dt = sel.createdAt ? new Date(sel.createdAt).toLocaleString() : (sel.daysAgo === 0 ? pickL(L("Today", "आज", "आज"), lang) : sel.daysAgo + pickL(L(" days ago", " दिन पहले", " दिवसांपूर्वी"), lang));
        const rows = [
          [pickL(L("Report ID", "रिपोर्ट आईडी", "अहवाल आयडी"), lang), sel.id],
          [pickL(L("Farmer", "किसान", "शेतकरी"), lang), sel.farmer],
          [t("cropDetected"), cName(sel.crop)],
          [pickL(L("Growth stage", "वृद्धि अवस्था", "वाढीचा टप्पा"), lang), sel.stage],
          [t("confidence"), sel.confidence + "%"],
          [t("severity"), pickL(sevName[sel.band], lang) + " · " + sel.severityPct + "%"],
          [t("risk"), pickL(riskName[rl] || riskName.moderate, lang) + (sel.riskScore ? " · " + sel.riskScore + "/100" : "")],
          [pickL(L("Location", "स्थान", "स्थान"), lang), sel.district + " · " + sel.lat.toFixed(3) + ", " + sel.lng.toFixed(3)],
          [pickL(L("Reported", "रिपोर्ट किया", "नोंदवले"), lang), dt],
        ];
        const StatusBtn = ({ k, action, label }) => {
          const activeNow = (k === "pending" && isPending(sel.status)) || (k === "reviewing" && sel.status === "reviewing") || (k === "resolved" && ["resolved", "expert_verified", "confirmed"].includes(sel.status));
          return <button onClick={() => act(sel.id, action)} className="flex-1 rounded-lg py-2 text-xs font-semibold"
            style={{ background: activeNow ? statusColor(k === "resolved" ? "resolved" : k) : C.inkCard, color: activeNow ? "#fff" : C.inkSub, border: `1px solid ${C.inkLine}` }}>{label}</button>;
        };
        return (
          <div onClick={() => setSel(null)} style={{ position: "fixed", inset: 0, background: "rgba(4,10,14,0.62)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div onClick={(e) => e.stopPropagation()} className="w-full" style={{ maxWidth: 460, maxHeight: "90vh", overflowY: "auto", background: C.inkPanel, border: `1px solid ${C.inkLine}`, borderRadius: 16 }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${C.inkLine}`, position: "sticky", top: 0, background: C.inkPanel }}>
                <div className="flex items-center gap-2">
                  <span className="font-bold" style={{ color: C.inkText }}>{dName(sel.disease)}</span>
                  <Badge color={statusColor(sel.status)} dark>{pickL(statusName[sel.status], lang)}</Badge>
                </div>
                <button onClick={() => setSel(null)}><XCircle size={20} color={C.inkSub} /></button>
              </div>
              <div className="p-4">
                <div className="mb-3 overflow-hidden rounded-xl" style={{ border: `1px solid ${C.inkLine}` }}>
                  {sel.image ? <img src={sel.image} alt="leaf" style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }} /> : <DemoLeaf />}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {rows.map(([k, v], i) => (
                    <div key={i}>
                      <div className="text-xs" style={{ color: C.inkFaint }}>{k}</div>
                      <div className="text-sm font-semibold" style={{ color: C.inkText }}>{v}</div>
                    </div>
                  ))}
                </div>
                {sel.note && <div className="mt-3 rounded-lg p-2.5 text-sm" style={{ background: C.inkCard, color: C.inkSub }}>“{sel.note}”</div>}
                <div className="mt-3 flex items-start gap-2 rounded-lg p-2.5 text-xs" style={{ background: C.amber + "14", color: C.inkSub }}>
                  <Info size={14} style={{ color: C.amber, flexShrink: 0, marginTop: 1 }} />
                  {pickL(L("AI result is advisory. Confirm with field inspection before recommending treatment.", "एआई परिणाम सलाहकारी है। उपचार से पहले क्षेत्र निरीक्षण से पुष्टि करें।", "एआय निकाल सल्लागार आहे. उपचारापूर्वी क्षेत्र तपासणीने खात्री करा."), lang)}
                </div>
                <div className="mt-3 mb-1 text-xs font-semibold" style={{ color: C.inkSub }}>{pickL(L("Update status", "स्थिति बदलें", "स्थिती बदला"), lang)}</div>
                <div className="flex gap-2">
                  <StatusBtn k="pending" action="info" label={pickL(statusName.pending, lang)} />
                  <StatusBtn k="reviewing" action="review" label={pickL(statusName.reviewing, lang)} />
                  <StatusBtn k="resolved" action="resolve" label={pickL(L("Resolved", "समाधान", "निराकरण"), lang)} />
                </div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => act(sel.id, "verify")} className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold" style={{ background: C.green + "22", color: C.greenBright }}><Check size={14} />{t("verify")}</button>
                  <button onClick={() => act(sel.id, "reject")} className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold" style={{ background: C.red + "22", color: C.red }}><XCircle size={14} />{t("reject")}</button>
                  <button onClick={() => act(sel.id, "priority")} className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold" style={{ background: C.amber + "22", color: C.amber }}><Flag size={14} />{t("priority")}</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ============================================================================
   LANDING
   ========================================================================== */
function Landing({ lang, go, onAbout }) {
  const t = (k) => pickL(U[k], lang);
  const steps = [
    { ic: <Camera size={20} color={C.green} />, tl: "Scan", d: "Farmer photographs a leaf; on-device-ready AI identifies crop, disease and severity." },
    { ic: <CloudRain size={20} color={C.sky} />, tl: "Predict", d: "Weather + crop stage + nearby reports combine into an explained risk score." },
    { ic: <MapPin size={20} color={C.red} />, tl: "Detect", d: "Geotagged reports cluster into outbreaks before they spread." },
    { ic: <ShieldCheck size={20} color={C.teal} />, tl: "Act", d: "Officers verify cases and push area alerts; farmers get IPM advisories in their language." },
  ];
  return (
    <div style={{ background: C.paper }}>
      {/* hero */}
      <div className="relative overflow-hidden" style={{ background: C.ink }}>
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <Badge color={C.greenBright} dark><Sparkles size={13} /> SIH26131 · Crop Health Intelligence</Badge>
              <h1 className="mt-4 text-4xl font-bold leading-tight" style={{ color: C.inkText, letterSpacing: "-0.02em" }}>
                Catch crop disease<br />before it spreads.
              </h1>
              <p className="mt-4 max-w-md text-lg" style={{ color: C.inkSub }}>
                {pickL(L("AI leaf diagnosis, weather-aware risk prediction and geospatial outbreak detection — in one platform, in the farmer's language.", "एआई पत्ती निदान, मौसम-आधारित जोखिम और भू-स्थानिक प्रकोप पहचान — एक ही मंच पर, किसान की भाषा में।", "एआय पान निदान, हवामान-आधारित धोका आणि भू-स्थानिक प्रादुर्भाव शोध — एकाच मंचावर, शेतकऱ्याच्या भाषेत."), lang)}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => go("farmer")} className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-white" style={{ background: C.green }}><Camera size={18} />{t("scanCrop")}</button>
                <button onClick={() => go("officer")} className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold" style={{ background: "rgba(255,255,255,0.08)", color: C.inkText, border: `1px solid ${C.inkLine}` }}><MapPin size={18} />{pickL(L("View risk map", "जोखिम मानचित्र देखें", "धोका नकाशा पाहा"), lang)}</button>
                {onAbout && <button onClick={onAbout} className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium" style={{ color: C.inkSub }}><Info size={16} />{pickL(L("About the tech", "तकनीक के बारे में", "तंत्रज्ञानाबद्दल"), lang)}</button>}
              </div>
              <div className="mt-8 flex gap-6">
                {[["9", pickL(L("crops", "फसलें", "पिके"), lang)], ["3", pickL(L("languages", "भाषाएं", "भाषा"), lang)], ["1", pickL(L("outbreak loop", "प्रकोप लूप", "प्रादुर्भाव लूप"), lang)]].map(([n, l], i) => (
                  <div key={i}><div className="text-2xl font-bold" style={{ color: C.greenBright }}>{n}</div><div className="text-xs" style={{ color: C.inkSub }}>{l}</div></div>
                ))}
              </div>
            </div>
            {/* mini live map preview */}
            <div className="hidden lg:block"><HotspotMap reports={SEED} lang={lang} /></div>
          </div>
        </div>
      </div>
      {/* how it works */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 text-sm font-semibold" style={{ color: C.green }}>How it works</div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={i} className="rounded-2xl border p-5" style={{ background: C.card, borderColor: C.line }}>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: C.paper }}>{s.ic}</div>
                <span className="text-sm font-bold" style={{ color: C.faint }}>{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="mt-3 text-lg font-bold" style={{ color: C.text }}>{s.tl}</div>
              <div className="mt-1 text-sm" style={{ color: C.sub }}>{s.d}</div>
            </div>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[["Prevent losses", "Early intervention protects yield and income", ShieldCheck, C.green],
            ["Explainable AI", "Every score shows why, not just a number", Gauge, C.amber],
            ["Command center", "Officers see outbreaks form in real time", LayoutDashboard, C.sky],
            ["Field-ready", "Mobile-first, multilingual, offline-tolerant", Sprout, C.teal]].map(([tl, d, Ic, col], i) => (
            <div key={i} className="rounded-2xl p-5" style={{ background: col + "10" }}>
              <Ic size={22} style={{ color: col }} />
              <div className="mt-2 font-bold" style={{ color: C.text }}>{tl}</div>
              <div className="text-sm" style={{ color: C.sub }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   ROOT
   ========================================================================== */
const SEED = seedReports();

export default function App() {
  const [role, setRole] = useState("landing"); // landing | farmer | officer
  const [lang, setLang] = useState("en");
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [reports, setReports] = useState(() => store.get(SK.reports) ?? SEED);
  const [alerts, setAlerts] = useState(() => store.get(SK.alerts) ?? []);
  const [lastScan, setLastScan] = useState(null);
  const [toast, setToast] = useState(null);
  const [about, setAbout] = useState(false);

  // persist demo data (survives refresh when run locally)
  useEffect(() => { store.set(SK.reports, reports); }, [reports]);
  useEffect(() => { store.set(SK.alerts, alerts); }, [alerts]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2600); return () => clearTimeout(t); }, [toast]);

  // react to real browser connectivity + simulate sync of queued reports on reconnect
  useEffect(() => {
    const goOn = () => setOnline(true), goOff = () => setOnline(false);
    window.addEventListener("online", goOn); window.addEventListener("offline", goOff);
    return () => { window.removeEventListener("online", goOn); window.removeEventListener("offline", goOff); };
  }, []);
  useEffect(() => {
    if (!online) return;
    const queued = reports.some((r) => r.status === "queued");
    if (!queued) return;
    setToast(pickL(L("Back online — syncing…", "फिर ऑनलाइन — सिंक हो रहा है…", "पुन्हा ऑनलाइन — सिंक होत आहे…"), lang));
    const tm = setTimeout(() => setReports((p) => p.map((r) => r.status === "queued" ? { ...r, status: "synced" } : r)), 1200);
    return () => clearTimeout(tm);
  }, [online, reports, lang]);

  const resetDemo = () => {
    store.del(SK.reports); store.del(SK.alerts); store.del(SK.seq);
    setReports(SEED); setAlerts([]); setLastScan(null);
    setToast(pickL(L("Demo data reset", "डेमो डेटा रीसेट", "डेमो डेटा रीसेट"), lang));
  };

  const dark = role === "officer";
  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif", minHeight: "100vh", background: dark ? C.ink : C.paper }}>
      <style>{`
        .kr-spin{animation:krspin 1s linear infinite}
        @keyframes krspin{to{transform:rotate(360deg)}}
        @media (prefers-reduced-motion: reduce){.kr-spin{animation:none}}
        select{outline:none}
        input[type=range]{height:4px;border-radius:4px}
        button{transition:filter .15s ease}
        button:hover{filter:brightness(1.05)}
        button:focus-visible{outline:2px solid ${C.greenBright};outline-offset:2px}
      `}</style>

      <TopBar role={role === "officer" ? "officer" : "farmer"} setRole={setRole} lang={lang} setLang={setLang} online={online} setOnline={setOnline} dark={dark} onReset={resetDemo} onAbout={() => setAbout(true)} />

      {role === "landing" && <Landing lang={lang} go={setRole} onAbout={() => setAbout(true)} />}
      {role === "farmer" && <FarmerApp lang={lang} reports={reports} setReports={setReports} alerts={alerts} setAlerts={setAlerts} online={online} lastScan={lastScan} setLastScan={setLastScan} setToast={setToast} />}
      {role === "officer" && <OfficerApp lang={lang} reports={reports} setReports={setReports} alerts={alerts} setAlerts={setAlerts} setToast={setToast} />}

      {/* toast */}
      {toast && (
        <div className="fixed left-1/2 z-50" style={{ bottom: 24, transform: "translateX(-50%)" }}>
          <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white" style={{ background: C.green, boxShadow: "0 8px 24px rgba(0,0,0,.25)" }}>
            <CheckCircle2 size={17} />{toast}
          </div>
        </div>
      )}

      {/* ABOUT / TECHNOLOGY modal */}
      {about && (
        <div onClick={() => setAbout(false)} style={{ position: "fixed", inset: 0, background: "rgba(4,10,14,0.62)", zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full" style={{ maxWidth: 520, maxHeight: "90vh", overflowY: "auto", background: C.card, borderRadius: 16 }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.line}` }}>
              <div className="flex items-center gap-2"><Info size={18} style={{ color: C.green }} /><span className="font-bold" style={{ color: C.text }}>{pickL(L("About / Technology", "बारे में / तकनीक", "बद्दल / तंत्रज्ञान"), lang)}</span></div>
              <button onClick={() => setAbout(false)}><XCircle size={20} color={C.faint} /></button>
            </div>
            <div className="p-5">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: C.amberSoft, color: C.amber }}><Sparkles size={12} /> SIH DEMO MODE</div>
              <p className="mb-3 text-sm" style={{ color: C.sub }}>
                {pickL(L("Prototype for SIH26131 — early detection and management of crop diseases and pest infestations. Built to demonstrate the full farmer → AI → officer loop.", "SIH26131 हेतु प्रोटोटाइप — फसल रोग व कीट प्रकोप की शीघ्र पहचान व प्रबंधन। किसान → एआई → अधिकारी लूप दिखाने हेतु।", "SIH26131 साठी प्रोटोटाइप — पीक रोग व कीड प्रादुर्भावाची लवकर ओळख व व्यवस्थापन. शेतकरी → एआय → अधिकारी लूप दाखवण्यासाठी."), lang)}
              </p>
              {[
                [pickL(L("Frontend", "फ्रंटएंड", "फ्रंटएंड"), lang), "React + JSX, Tailwind styling"],
                [pickL(L("Visualization", "विज़ुअलाइज़ेशन", "व्हिज्युअलायझेशन"), lang), "Recharts + custom SVG risk map"],
                [pickL(L("Inference", "अनुमान", "अनुमान"), lang), pickL(L("Replaceable InferenceProvider — currently a labelled DEMO mock (no trained model)", "बदली-योग्य InferenceProvider — अभी लेबल किया डेमो मॉक (प्रशिक्षित मॉडल नहीं)", "बदलण्याजोगा InferenceProvider — सध्या लेबल केलेला डेमो मॉक (प्रशिक्षित मॉडेल नाही)"), lang)],
                [pickL(L("Risk & outbreak", "जोखिम व प्रकोप", "धोका व प्रादुर्भाव"), lang), pickL(L("Transparent weighted engine + spatial clustering (prototype factors)", "पारदर्शी भारित इंजन + स्थानिक क्लस्टरिंग (प्रोटोटाइप कारक)", "पारदर्शक भारित इंजिन + स्थानिक क्लस्टरिंग (प्रोटोटाइप घटक)"), lang)],
                [pickL(L("Data & storage", "डेटा व भंडारण", "डेटा व संचय"), lang), pickL(L("Seeded demo dataset, browser localStorage for the prototype", "सीड किया डेमो डेटासेट, प्रोटोटाइप हेतु ब्राउज़र localStorage", "सीड केलेला डेमो डेटासेट, प्रोटोटाइपसाठी ब्राउझर localStorage"), lang)],
                [pickL(L("Planned (not yet built)", "नियोजित (अभी नहीं)", "नियोजित (अजून नाही)"), lang), pickL(L("Trained CV model, Next.js + Supabase/PostGIS backend, live weather API, GIS map tiles", "प्रशिक्षित CV मॉडल, Next.js + Supabase/PostGIS बैकएंड, लाइव मौसम API, GIS मैप", "प्रशिक्षित CV मॉडेल, Next.js + Supabase/PostGIS बॅकएंड, लाइव्ह हवामान API, GIS नकाशा"), lang)],
              ].map(([k, v], i) => (
                <div key={i} className="mb-2 rounded-lg p-2.5" style={{ background: C.paper }}>
                  <div className="text-xs font-semibold" style={{ color: C.green }}>{k}</div>
                  <div className="text-sm" style={{ color: C.text }}>{v}</div>
                </div>
              ))}
              <div className="mt-3 flex items-start gap-2 rounded-lg p-3 text-sm" style={{ background: C.amberSoft, color: "#7a5310" }}>
                <AlertTriangle size={16} style={{ color: C.amber, flexShrink: 0, marginTop: 2 }} />
                {pickL(L("AI results are advisory and do not replace confirmation from qualified agricultural experts. No pesticide dosages are prescribed — always follow verified label guidance and your agriculture officer.", "एआई परिणाम सलाहकारी हैं और योग्य कृषि विशेषज्ञों की पुष्टि का विकल्प नहीं। कोई कीटनाशक मात्रा निर्धारित नहीं — हमेशा सत्यापित लेबल व कृषि अधिकारी का पालन करें।", "एआय निकाल सल्लागार आहेत व पात्र कृषी तज्ज्ञांच्या खात्रीला पर्याय नाहीत. कोणतीही कीटकनाशक मात्रा दिलेली नाही — नेहमी पडताळलेले लेबल व कृषी अधिकाऱ्याचे पालन करा."), lang)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* landing footer badge */}
      {role === "landing" && (
        <div className="py-6 text-center text-xs" style={{ color: C.faint }}>
          KrishiRakshak AI · SIH DEMO MODE · mock inference clearly labelled · sample geodata
        </div>
      )}
    </div>
  );
}
