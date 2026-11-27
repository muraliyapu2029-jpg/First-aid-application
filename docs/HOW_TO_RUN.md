# How to Run RakshaAI

This guide explains how to install dependencies, configure optional environment variables, and start RakshaAI locally or with Docker.

---

## 1. Prerequisites

- **Node.js** (v18 or newer recommended) and **npm**
- **Docker** & **Docker Compose** *(optional, only needed for containerized runs)*

---

## 2. Run Locally (Development Mode)

1. **Open a terminal in the project folder**:
   ```powershell
   cd "C:\Scalar Voice First\First-aid-application"
   ```

2. **Install dependencies** (if not already installed):
   ```powershell
   npm install
   ```

3. **Configure environment variables *(optional)***:
   The app works out-of-the-box without any API keys using offline rule-based emergency detection.
   If you want to enable optional Gemini AI classification or a custom Overpass endpoint, copy `.env.example` to `.env`:
   ```powershell
   copy .env.example .env
   ```
   Then edit `.env` and fill in `VITE_GEMINI_API_KEY` if desired.

4. **Start the development server**:
   ```powershell
   npm run dev
   ```

5. **Open the app in your browser**:
   Visit **[http://localhost:5173](http://localhost:5173)**.

---

## 2b. Cloud Voice with Sarvam AI *(optional, recommended)*

With a Sarvam key, the app records the user's voice and sends it to the backend, and Sarvam
**auto-detects whether they spoke Kannada, Hindi or English**. The whole app then replies in
that language. Without a key, the app uses the browser's own recognizer in the selected language,
and the Listening screen has one-tap language buttons.

1. Get a key at https://dashboard.sarvam.ai (new accounts get free starter credits).
2. Add it to `.env` in the project root. Only the backend reads it; it is never sent to the browser.
   ```
   SARVAM_API_KEY=your_key_here
   ```
3. Start the backend in a **second terminal**:
   ```powershell
   cd "C:\Scalar Voice First\First-aid-application\server"
   npm install
   npm run dev
   ```
   It should print `Cloud STT: Enabled (Sarvam)`. The Vite dev server forwards `/api` requests to it.
4. Open **Settings**. **Cloud Voice (Sarvam AI)** should show "On".

### Kannada voice replies

Most devices have no Kannada text-to-speech voice, so Kannada instructions are spoken with Sarvam audio:

- **Pre-generated clips** in `public/audio/kn/` ship with the app. They work offline and play instantly.
- **Anything not pre-generated** is synthesized live through the backend (`POST /api/voice/speak`) and cached in `server/.cache/tts/`, so each sentence is paid for only once.

After editing any Kannada first-aid text in `src/data/firstAidTranslations.ts`, regenerate the clips. Only changed sentences are re-synthesized:

```powershell
npm run tts:generate -- --dry-run   # shows how many clips and the estimated cost
npm run tts:generate
```

---

## 3. Production Build & Preview (Local)

To verify TypeScript types, run tests, bundle the app, and preview the production build locally:

```powershell
npm run lint
npm test
npm run build
npm run preview
```

---

## 4. Run with Docker *(Optional)*

1. **Create `.env` from `.env.example`**:
   ```powershell
   copy .env.example .env
   ```

2. **Build and start the frontend container**:
   ```powershell
   docker compose up --build
   ```
   The app will be served at **[http://localhost:3000](http://localhost:3000)**.

3. **With the optional Express backend** (runs on port `4000`):
   ```powershell
   docker compose --profile with-backend up --build
   ```

---

## 5. Quick Verification Checklist

Once the app is open at `http://localhost:5173`:

1. **Text / Voice Detection**: Type `"A snake bit my father"` in the **Describe the emergency** box and submit — it should open `/emergency` with **Snakebite** and let you click **Step-by-Step First Aid** (`/first-aid`).
2. **Language Switch**: Switch between **English**, **हिंदी**, and **ಕನ್ನಡ** at the top of the Home screen to verify all UI labels update.
3. **Emergency Assist & Settings**: Test `/assist` (112/108/102 quick dial & location share) and `/settings` (voice/TTS availability and AI status).
