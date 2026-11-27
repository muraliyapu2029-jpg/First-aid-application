# RakshaAI — AI-Powered Multilingual Voice-First Emergency Assistance

> *"Your Emergency. Our Immediate Assistance."*

RakshaAI is a voice-first, multilingual emergency assistance progressive web app (PWA) designed for people across India — especially rural communities, elderly users, agricultural workers, and anyone who needs immediate help during a medical emergency.

---

## 🚀 Quick Start

### Run with Docker (Recommended)

```bash
# Clone the repo
git clone https://github.com/your-org/raksha-ai.git
cd raksha-ai

# Copy environment config (no API key required for core functionality)
cp .env.example .env

# Start the app
docker compose up --build

# App will be available at http://localhost:3000
```

### Run Locally (Development)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# App will be available at http://localhost:5173
```

---

## 🌍 Supported Languages

| Language | Voice Input | Voice Output | UI Text |
|----------|-------------|--------------|---------|
| **Kannada** (ಕನ್ನಡ) | ✅ | ⚠️ Device-dependent | ✅ |
| **Hindi** (हिंदी) | ✅ | ✅ | ✅ |
| **English** | ✅ | ✅ | ✅ |

> **🗣️ Replies in the user's language:** The app detects whether the user spoke or typed Kannada, Hindi or English, then switches the whole app to it: UI text, first-aid steps and voice. Speech goes through the backend to Sarvam AI, which detects the language automatically (`POST /api/voice/transcribe`). Typed text and offline speech use script detection (`src/services/languageDetection.ts`). Set `SARVAM_API_KEY` in `.env` and run `server/`. See [docs/HOW_TO_RUN.md](docs/HOW_TO_RUN.md).

> **⚠️ Kannada TTS Note:** Browser support for Kannada text-to-speech (`kn-IN`) varies significantly by device and operating system. When Kannada voice is unavailable, the app displays a **clear warning** and shows all instructions as readable Kannada text. It **never silently switches to English.**

---

## 🏥 Emergency Categories Supported

| # | Emergency | Snakebite Special Flow |
|---|-----------|----------------------|
| 1 | 🐍 Snakebite | ✅ Dedicated expanded module |
| 2 | ❤️ Heart Attack | — |
| 3 | 🧠 Stroke | FAST test included |
| 4 | 😶 Unconsciousness | CPR guidance |
| 5 | 🚗 Road Accident | — |
| 6 | 🩸 Heavy Bleeding | — |
| 7 | 🔥 Burns | — |
| 8 | ⚡ Electric Shock | — |
| 9 | 😮‍💨 Choking | Heimlich included |
| 10 | 💨 Breathing Difficulty | — |
| 11 | 🌀 Seizure / Fits | — |
| 12 | 💫 Fainting | — |

---

## 🏗️ Architecture

```
User Voice / Text Input
        ↓
emergencyDetection.ts
   ├── Rule-based keyword matching (offline ✅)
   └── Gemini AI (optional, online only)
        ↓
EmergencyCategory + Confidence
        ↓
firstAidService.ts → firstAidProtocols.ts (offline ✅)
        ↓                        ↓
 7 React Pages            speechSynthesis.ts (TTS)
        ↓
hospitalService.ts → Overpass API (online only)
locationService.ts → navigator.geolocation
```

---

## 📱 Screens

| Screen | Path | Description |
|--------|------|-------------|
| Home | `/` | Microphone, language selector, quick-select grid |
| Listening | `/listening` | Full-screen mic animation, live transcript |
| Emergency | `/emergency` | Identified emergency + immediate action |
| First Aid | `/first-aid` | Step-by-step guidance with TTS |
| Hospitals | `/hospitals` | GPS-based hospital finder |
| Emergency Assist | `/assist` | 112/108/102 calling + location share |
| Settings | `/settings` | Language, voice, privacy |

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GEMINI_API_KEY` | ❌ Optional | Gemini API key for AI-enhanced detection |
| `VITE_OVERPASS_API_URL` | ❌ Optional | Custom Overpass API endpoint |
| `SARVAM_API_KEY` | ❌ Optional (server only) | Sarvam AI speech-to-text with automatic Kannada / Hindi / English detection. Read by `server/` and never exposed to the browser |

---

## 📡 Offline Support

| Feature | Offline Available |
|---------|------------------|
| First-aid protocols | ✅ Yes |
| Emergency detection (rule-based) | ✅ Yes |
| App UI / navigation | ✅ Yes |
| Hospital discovery | ❌ Needs internet |
| AI classification | ❌ Needs internet |
| Voice recognition | ⚠️ Device-dependent |

---

## 🧪 Test Scenarios

### Scenario 1: Snakebite
1. Open the app
2. Type or say: **"A snake bit my father"**
3. Expected: Snakebite emergency identified → DO/DON'T instructions → Hospital finder

### Scenario 2: Road Accident + Bleeding
1. Type or say: **"Road accident, person is bleeding badly"**
2. Expected: Road accident protocol with bleeding guidance

### Scenario 3: Cardiac Emergency
1. Type or say: **"My father has chest pain and is sweating"**
2. Expected: Heart attack protocol with 112 call prompt

### Scenario 4: Language Switch
1. Change language from English → Kannada
2. Expected: All UI text updates, voice uses Kannada if available, warning shown if not

### Scenario 5: Offline
1. Disconnect internet
2. Expected: First-aid fully accessible, hospital search shows offline message

### Scenario 6: Voice Unavailable
1. Block microphone permission
2. Expected: Clear error message, text input and quick-select grid available

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript |
| Styling | Tailwind CSS v3, Google Fonts |
| Icons | Lucide React |
| Routing | React Router v6 |
| Voice Input | Web Speech API (`SpeechRecognition`) |
| Voice Output | Web Speech Synthesis API |
| AI Detection | Google Gemini 1.5 Flash (optional) |
| Hospital Data | OpenStreetMap Overpass API |
| Location | Browser Geolocation API |
| Deployment | Docker, nginx |
| Backend (skeleton) | Node.js, Express, TypeScript |

---

## ⚕️ Medical Safety

- All first-aid protocols are **curated and hardcoded** — AI never invents medical instructions
- Emergency instructions say "possible" / "suspected" — never diagnose with certainty
- Clear disclaimer on every screen: *"This app provides first-aid guidance only."*
- Never fabricates hospital phone numbers or antivenom availability
- Snakebite module explicitly warns against dangerous traditional remedies

---

## 📂 Project Structure

```
raksha-ai/
├── src/
│   ├── components/      # MicrophoneButton, LanguageSelector, etc.
│   ├── context/         # LanguageContext, EmergencyContext
│   ├── data/            # Translations, first-aid protocols, keywords
│   ├── hooks/           # useVoiceInput, useTTS, useOfflineStatus
│   ├── pages/           # Home, Listening, Emergency, FirstAid, etc.
│   ├── services/        # speechRecognition, speechSynthesis, etc.
│   └── types/           # TypeScript type definitions
├── server/              # Express backend skeleton
├── public/              # PWA manifest, icons, offline.html
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 📋 SCALER × Flow Hackathon Submission

- **Problem**: Medical emergencies in India are worsened by language barriers, limited literacy, and difficulty accessing first-aid information quickly.
- **Solution**: A voice-first PWA that understands emergency descriptions in Kannada, Hindi, and English and provides curated first-aid guidance immediately.
- **Target Users**: Rural communities, elderly people, agricultural workers, non-English speakers.
- **AI Role**: Classification only — never generating medical advice.

---

## ⚠️ Important Disclaimer

**RakshaAI is a first-aid guidance tool, not a replacement for professional medical care.**

Always call **112** (National Emergency) in a medical emergency. The first-aid instructions in this app are based on standard guidelines but have not been individually validated by a licensed physician. Always seek professional medical care.

---

*Built with ❤️ for the people of India — SCALER × Flow Hackathon 2024*
