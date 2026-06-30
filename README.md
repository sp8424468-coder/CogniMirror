# CogniMirror - AI Multilingual Voice Journaling Platform

CogniMirror is a production-ready AI-powered multilingual voice journaling SaaS platform (AI Cognitive Companion). It enables users to record vocal reflections naturally, transcribe dialects, map recurring cognitive distortions (logical distortions) using cognitive behavioral science principles, and discover personalized emotional baseline charts.

---

## 🏗️ Project Architecture

This application is built following **Clean Architecture** and **SOLID Principles** to ensure complete separation of concerns, testability, and code reusability.

```text
CogniMirror/
├── frontend/             # Next.js 15 App (React 19, TypeScript, TailwindCSS v4)
│   ├── src/
│   │   ├── app/          # App Router Groups (marketing), (auth), (dashboard)
│   │   ├── components/   # UI elements (Cards, Buttons) & Layout (Sidebar, Header)
│   │   ├── hooks/        # State hooks & API integrations
│   │   ├── lib/          # Utilities (class mergers)
│   │   └── context/      # React Providers (QueryProvider, AuthContext)
│   ├── .env.example      # Example environment variables for frontend
│   └── .gitignore        # Frontend-specific gitignore rules
├── backend/              # FastAPI Backend (Python 3.11, SQLAlchemy 2.0, Pydantic v2)
│   ├── app/
│   │   ├── api/          # Route Controllers (Auth, Journals, Insights, Profiles)
│   │   ├── core/         # JWT Security, Database Connection and Config settings
│   │   ├── models/       # Relational database ORM Models (SQLAlchemy)
│   │   ├── schemas/      # Pydantic validation & serialization schemas
│   │   ├── services/     # Business logic mapping (AI analysis & stats engine)
│   │   └── main.py       # API router initialization and startup configuration
│   ├── .env.example      # Example environment variables for backend
│   ├── requirements.txt  # Python pip dependencies
│   └── runtime.txt       # Python runtime environment specification for Render
├── database/             # Relational Database Schema Mappings
│   └── schema.sql        # PostgreSQL table definition and indexing script
├── render.yaml           # Render Blueprint deployment definition
└── .gitignore            # Root-level Gitignore rules
```

---

## ✨ Core Features

* **Multilingual Speech-to-Text (STT)**: Integration with Sarvam AI STT to accurately transcribe spoken reflections, supports local dialects and regional languages.
* **Cognitive Behavioral Analysis**: Powering insights with Google Gemini AI to highlight cognitive distortions (such as catastrophizing, emotional reasoning, and mind reading).
* **Interactive Dashboard**: Track your emotional logs, energy indices, and stress metrics over time.
* **Audio Uploads**: Secure multipart file upload API for raw audio recordings.
* **Secure Session Authentication**: Secure user authentication using JWT and password hashing (bcrypt).
* **Robust Fail-Safe Engine**: Robust fallback logic built-in to handle third-party service limitations smoothly.

---

## 🧪 Tech Stack

* **Frontend**: Next.js 15 (App Router), React 19, TypeScript, TailwindCSS v4, Framer Motion, React Hook Form + Zod, React Query.
* **Backend**: Python FastAPI, SQLAlchemy 2.0 (ORM), PyJWT, PostgreSQL / SQLite.
* **AI Pipelines**: Google Gemini AI (Cognitive Distortion mapping), Sarvam AI STT (Voice to Text Dialects).

---

## 🔧 Environment Variables

### Backend Configuration (`backend/.env`)

Configure these variables to connect the FastAPI backend with database and AI APIs:

| Variable Name | Description | Default / Example | Required |
| :--- | :--- | :--- | :--- |
| `SECRET_KEY` | Private key to sign JWT tokens. Will use `JWT_SECRET` if not specified. | *Secure random string* | **Yes (Fail-fast)** |
| `DATABASE_URL` | Connection URL for SQLite (development) or PostgreSQL (production). | `sqlite:///./cognimirror.db` | No (dev default) |
| `BACKEND_CORS_ORIGINS` | Comma-separated list of origins allowed to request the API. | `http://localhost:3000` | No |
| `GEMINI_API_KEY` | API Key for Gemini Content Generation API. | `AIzaSy...` | No (falls back to mock) |
| `SARVAM_API_KEY` | API Subscription Key for Sarvam Speech-to-Text. | `sk_...` | No (falls back to mock) |
| `GOOGLE_CLIENT_ID` | OAuth Client ID for Google login features. | `...apps.googleusercontent.com` | No |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret for Google login features. | `GOCSPX-...` | No |

### Frontend Configuration (`frontend/.env.local`)

| Variable Name | Description | Default / Example | Required |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | The base URL of the deployed FastAPI backend API. | `http://localhost:8000` | **Yes** |

---

## 🚀 Local Setup & Launch Instructions

### 1. Database Schema
For local SQLite testing, the database tables are created automatically on application launch. If deploying with **PostgreSQL** or **Supabase**:
1. Connect to your database instance (e.g. Supabase console).
2. Open the SQL editor.
3. Execute the SQL statements from [database/schema.sql](file:///c:/hackathon/CogniMirror/database/schema.sql).

---

### 2. Backend Server Setup
The backend requires Python 3.10+.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell/CMD):
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template:
   ```bash
   copy .env.example .env
   ```
   Fill in your `SECRET_KEY`, `GEMINI_API_KEY`, and `SARVAM_API_KEY` in `.env`.
5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The Swagger interactive documentation will be available at `http://localhost:8000/docs`.*

---

### 3. Frontend App Setup
The frontend requires Node.js 18+.

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm modules:
   ```bash
   npm install
   ```
3. Copy the environment template:
   ```bash
   copy .env.example .env.local
   ```
4. Run the Next.js dev server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:3000` in your web browser.*

---

## 🔒 GitHub & Publication Setup

To publish this project safely to GitHub without exposing secrets:
1. Ensure the root `.gitignore` is present and active.
2. Run `git status` to verify that `.env`, `.env.local`, `.db`, `venv/`, and `node_modules/` are recognized as ignored.
3. Commit only the tracked code:
   ```bash
   git add .
   git commit -m "chore: prepare repository for production deployment"
   ```
4. Push to your private or public GitHub repository.

---

## ☁️ Production Deployment

### Backend Deployment (Render)

Render reads [render.yaml](file:///c:/hackathon/CogniMirror/render.yaml) to configure and deploy a blueprint instance automatically.

#### Option A: Blueprint Deploy (Recommended)
1. Commit and push your code containing the `render.yaml` file to GitHub.
2. Log in to the [Render Dashboard](https://dashboard.render.com).
3. Click **New** -> **Blueprint**.
4. Connect your GitHub repository.
5. Review the blueprint resources. Under `cognimirror-backend`, input your environment secrets:
   - `GEMINI_API_KEY`
   - `SARVAM_API_KEY`
   - `DATABASE_URL` (e.g. from Supabase)
   - `BACKEND_CORS_ORIGINS` (your frontend Next.js URL on Vercel)
6. Click **Apply**. Render will build and start the service automatically.

#### Option B: Manual Web Service Deploy
1. Click **New** -> **Web Service** on Render.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Under **Environment Variables**, add the variables detailed in the Backend Configuration table.

---

### Frontend Deployment (Vercel)

Vercel detects Next.js configurations automatically.

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Set the **Root Directory** option to `frontend`.
5. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: Set this to your deployed FastAPI backend URL on Render (e.g. `https://cognimirror-backend.onrender.com`).
6. Click **Deploy**. Vercel will build and launch your frontend.

---

## 🛠️ Troubleshooting

### 1. Backend Fails to Start with `ValidationError`
* **Symptom**: Startup crashes with an error trace mentioning `CRITICAL STARTUP ERROR: The SECRET_KEY environment variable is not configured.`
* **Solution**: Ensure you have defined either `SECRET_KEY` or `JWT_SECRET` in your `.env` file (or system environment variables) inside the backend workspace directory.

### 2. CORS Errors in Web Browser
* **Symptom**: Frontend console prints `Access to fetch at ... has been blocked by CORS policy`.
* **Solution**: Verify that `BACKEND_CORS_ORIGINS` in your backend environment variables contains the exact URL of your running frontend application (without trailing slashes), e.g. `https://cognimirror.vercel.app`.

### 3. File Upload Failures (`413 Payload Too Large` or `Permission Denied`)
* **Symptom**: Uploading large audio journal logs fails.
* **Solution**: Increase the body limit on your reverse proxy (e.g. Nginx or Cloudflare) or ensure the directory `backend/uploads` has write permissions on the target system.
