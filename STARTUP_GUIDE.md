# MindEase — Quick Start Guide

## ✅ All Bugs Fixed

The following 7 critical issues have been resolved:

1. **Frontend metro.config.js** — Fixed `node:sea` ENOENT error by switching to `expo/metro-config`
2. **Frontend package.json** — Removed unused native modules (`react-native-keychain`, `react-native-audio-recorder-player`)
3. **Frontend package.json** — Fixed `react-test-renderer` version mismatch (18→19)
4. **Frontend app.json** — Changed API URL from `localhost` to LAN IP `172.16.0.1:8000`
5. **Backend requirements.txt** — Added missing `psycopg2-binary`
6. **Backend whisper_service_stub.py** — Fixed function signature mismatch
7. **Backend settings.py** — Added `extra="ignore"` to prevent .env validation crashes

---

## 🚀 Running the Application

### Prerequisites

1. **PostgreSQL** running with database `mindease`
2. **Python 3.10+** with venv at `backend/.venv`
3. **Node.js 18+** with dependencies installed in `frontend/`
4. **Expo Go** app installed on your mobile device

### Backend Server

```bash
cd backend
.venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Status**: ✅ Running on `http://0.0.0.0:8000`
**Health Check**: `http://localhost:8000/health` → `{"status": "ok", "app": "MindEase"}`

### Frontend Server

```bash
cd frontend
npx expo start
```

**Status**: ✅ Running on `exp://192.168.125.192:8081`

### Mobile App

1. Open **Expo Go** on your phone
2. Scan the QR code displayed in the terminal
3. App will load on your device

---

## 📡 Network Configuration

- **Backend**: Listening on `0.0.0.0:8000` (accessible from LAN)
- **Frontend API Base URL**: `http://172.16.0.1:8000` (your PC's LAN IP)
- **Metro Bundler**: `exp://192.168.125.192:8081`

**Important**: Ensure your phone and PC are on the same WiFi network.

---

## 🔧 Optional Services (for full functionality)

### Ollama (for AI chat responses)

```bash
# Install Ollama from https://ollama.ai
ollama serve

# Pull the model
ollama pull llama3.2
```

Without Ollama, the `/conversation/chat` endpoint will return a 503 error.

### Faster-Whisper (for speech-to-text)

Already in `requirements.txt`. On first transcription request, it will download the Whisper `base` model (~150MB).

If not installed, the stub returns: `"faster-whisper is not installed"`

---

## 🗄️ Database

**Migrations**: Already at HEAD (`032b5186143a`)

Tables created:
- `users`
- `conversations`
- `conversation_messages`
- `categories`

To check migration status:
```bash
cd backend
.venv\Scripts\python.exe -m alembic current
```

---

## 🧪 Testing the Stack

### 1. Backend Health
```bash
curl http://localhost:8000/health
# Expected: {"status":"ok","app":"MindEase"}
```

### 2. Register a User
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### 3. Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 4. Mobile App Flow
1. Open app → See Login screen
2. Tap "Sign Up" → Create account
3. Navigate to Conversation screen
4. Tap microphone → Record audio → Stop
5. Audio transcribes → AI responds (if Ollama running)

---

## 📂 Project Structure

```
MindEase/
├── frontend/              # React Native + Expo
│   ├── src/
│   │   ├── api/          # API clients
│   │   ├── screens/      # UI screens
│   │   ├── hooks/        # Custom hooks
│   │   ├── store/        # Zustand state
│   │   └── config/       # Environment config
│   ├── app.json          # Expo config (apiBaseUrl: 172.16.0.1:8000)
│   ├── metro.config.js   # Metro bundler (expo/metro-config)
│   └── package.json      # Dependencies
│
└── backend/              # FastAPI
    ├── app/
    │   ├── features/     # Auth, Conversation, Analytics
    │   ├── models/       # SQLAlchemy models
    │   ├── core/         # Config, Auth, Database
    │   └── main.py       # FastAPI app
    ├── migrations/       # Alembic
    ├── requirements.txt  # Python deps (psycopg2-binary added)
    └── .env             # Environment variables
```

---

## 🎯 Current Status

✅ **Backend**: Running on port 8000  
✅ **Frontend**: Expo server running  
✅ **Database**: Migrations applied  
✅ **All bugs**: Fixed  

**Ready to use!** Scan the QR code with Expo Go to start.

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
- Verify backend is running: `curl http://localhost:8000/health`
- Check firewall allows port 8000
- Ensure phone and PC on same WiFi

### "Expo Go version incompatible"
- Update Expo Go app from Play Store/App Store
- Frontend uses Expo SDK 55

### "Database connection failed"
- Check PostgreSQL is running
- Verify `DATABASE_URL` in `backend/.env`
- Ensure database `mindease` exists

### "Module not found" errors
- Frontend: `cd frontend && npm install --legacy-peer-deps`
- Backend: `cd backend && .venv\Scripts\pip.exe install -r requirements.txt`

---

## 📝 Environment Variables

### Backend `.env`
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql+psycopg2://postgres:password@localhost:5432/mindease
ALLOWED_ORIGINS=["http://localhost:3000","http://localhost:8081"]
APP_ENV=development
```

### Frontend `app.json`
```json
"extra": {
  "appEnv": "development",
  "apiBaseUrl": "http://172.16.0.1:8000",
  "googleWebClientId": ""
}
```

---

**Last Updated**: March 18, 2026  
**Status**: All systems operational ✅
