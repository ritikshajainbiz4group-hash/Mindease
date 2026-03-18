# PostgreSQL Database Setup for MindEase

## Step 1: Create the Database

**Option A — Using pgAdmin (GUI):**
1. Open **pgAdmin 4** from Start menu
2. Connect to your PostgreSQL server (enter your password)
3. Right-click **Databases** → Create → Database
4. Name: `mindease`
5. Click Save

**Option B — Using SQL Shell (psql):**
1. Open **SQL Shell (psql)** from Start menu
2. Press Enter for all prompts (Server, Database, Port, Username) to use defaults
3. Enter your PostgreSQL password
4. Run: `CREATE DATABASE mindease;`
5. Verify: `\l` (should show mindease in the list)
6. Exit: `\q`

---

## Step 2: Configure `.env` File

1. In `e:\MindEase\backend\`, copy `.env.example` to `.env`
2. Edit `.env` and update these values:

```env
# ── Security ─────────────────────────────────────────────────────────────────
SECRET_KEY=REPLACE_WITH_OUTPUT_FROM_COMMAND_BELOW
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# ── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql+psycopg2://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/mindease

# ── CORS ─────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS=["http://localhost:19006","http://192.168.1.XXX:19006"]
```

**Generate SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```
Copy the output and paste it as `SECRET_KEY` value.

**Replace `YOUR_POSTGRES_PASSWORD`** with the password you set during PostgreSQL installation.

**Replace `192.168.1.XXX`** with your PC's local IP (run `ipconfig` to find it).

---

## Step 3: Install Python Dependencies

```bash
cd e:\MindEase\backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

---

## Step 4: Run Database Migrations

```bash
# Still in backend folder with venv activated
alembic revision --autogenerate -m "initial_tables"
alembic upgrade head
```

Expected output:
```
INFO  [alembic.runtime.migration] Running upgrade  -> abc123def, initial_tables
```

---

## Step 5: Verify Setup

**Start the backend:**
```bash
uvicorn app.main:app --reload
```

**Test in browser:**
- Open http://localhost:8000/docs
- Try `GET /health` — should return `{"status": "ok", "app": "MindEase"}`

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `psql: command not found` | Use **SQL Shell (psql)** from Start menu instead |
| `password authentication failed` | Check password in `DATABASE_URL` matches PostgreSQL password |
| `database "mindease" does not exist` | Complete Step 1 first |
| `ModuleNotFoundError: No module named 'psycopg2'` | Run `pip install psycopg2-binary` |
| `could not connect to server` | Start PostgreSQL service: Win+R → `services.msc` → find PostgreSQL → Start |

---

## Next: Install Ollama

After database is working:
1. Download Ollama from https://ollama.com/download/windows
2. Install and run: `ollama serve`
3. Pull model: `ollama pull llama3.2`

Then your backend will be fully ready!
