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
   cd c:\Users\Murali\OneDrive\Desktop\hackthon_scaler
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

## 3. Production Build & Preview (Local)

To verify TypeScript types, bundle the app, and preview the production build locally:

```powershell
npm run lint
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
