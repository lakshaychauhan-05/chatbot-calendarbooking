# 📝 Environment Files Explained

Understanding how `.env` files work in different environments.

---

## 🎯 TL;DR

| Environment | Uses .env File? | How Config is Loaded |
|-------------|----------------|----------------------|
| **Local Dev** | ✅ Yes | Reads from `.env` files |
| **Docker Compose** | ✅ Yes | Uses `.env` + docker-compose.yml |
| **Railway** | ❌ No | Uses Railway environment variables |

---

## 📂 Environment Files in Your Project

```
chatbot-calendarbooking/
├── .env                     ✅ Backend config (LOCAL)
├── .env.example             📋 Template
├── frontend/
│   ├── .env                 ✅ Frontend config (LOCAL)
│   └── .env.example         📋 Template
├── env.railway.example      📋 Railway reference
└── docker-compose.yml       🐳 Docker config
```

---

## 🏠 Local Development (PowerShell/Bash)

### How It Works:

**Backend:**
```python
# app/config.py uses pydantic-settings
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",  # ← Reads from .env
    )
```

**Frontend:**
```typescript
// Vite automatically reads .env files
const API_URL = import.meta.env.VITE_API_URL
```

### Files Used:
- ✅ Root `.env` → Backend
- ✅ `frontend/.env` → Frontend

### Start Command:
```bash
# Backend
python run.py

# Frontend
cd frontend && npm run dev
```

---

## 🐳 Docker Compose

### How It Works:

**Backend:**
```yaml
# docker-compose.yml
backend:
  environment:
    DATABASE_URL: postgresql://...  # ← Set directly
    SERVICE_API_KEY: ${SERVICE_API_KEY}  # ← From .env
```

**Frontend:**
```yaml
# docker-compose.yml
frontend:
  build:
    args:
      VITE_API_URL: http://localhost:8000  # ← Build arg
```

### Files Used:
- ✅ Root `.env` → Docker Compose can read it
- ❌ Frontend `.env` → Not used (build args instead)

### Start Command:
```bash
docker-compose up --build
```

---

## 🚂 Railway Deployment

### How It Works:

**Backend:**
- Railway injects environment variables **directly into the container**
- **NO `.env` file needed** - variables come from Railway dashboard/CLI
- `pydantic-settings` reads from environment variables automatically

**Frontend:**
- Build arguments set in Railway dashboard/CLI
- `VITE_API_URL` is baked into the build at build time
- **NO `.env` file needed**

### Configuration:

**Backend Variables (Railway Dashboard → Variables):**
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
SERVICE_API_KEY=your-key
OPENAI_API_KEY=your-key
CORS_ALLOW_ORIGINS=https://frontend.railway.app
# ... etc
```

**Frontend Build Args (Railway Dashboard → Variables):**
```bash
VITE_API_URL=https://backend.railway.app
```

### Files Used:
- ❌ No `.env` files
- ✅ Railway environment variables (set in dashboard/CLI)

### Deployment:
```bash
git push origin arc
# Railway automatically deploys
```

---

## 🔍 Why the Error Messages?

The error `.env file not found!` appears when:

1. **Running scripts from wrong directory**
   ```bash
   # ❌ Wrong - script looks for .env in current dir
   cd /some/other/directory
   python /path/to/run_migrations.py

   # ✅ Correct
   cd /Users/bicomputing/CC2/chatbot-calendarbooking
   python run_migrations.py
   ```

2. **Multiple terminal windows**
   - Old terminal windows showing old errors
   - Different directories in different terminals

3. **Script checking for .env when not needed (Railway)**
   - Fixed in updated `run_migrations.py`
   - Now works with or without `.env` file

---

## ✅ Verifying Your Setup

### Check Local .env Files:

```bash
# Check backend .env exists
ls -la .env

# Check frontend .env exists
ls -la frontend/.env

# View backend .env (first 20 lines)
head -20 .env

# View frontend .env
cat frontend/.env
```

### Expected Results:

```bash
# Backend .env should contain:
DATABASE_URL=postgresql://...
SERVICE_API_KEY=...
OPENAI_API_KEY=...
# ... and more

# Frontend .env should contain:
VITE_API_URL=http://localhost:8000
```

---

## 🔧 Migration Script Behavior

### Updated `run_migrations.py` Logic:

```python
if os.path.exists('.env'):
    print("Found .env file (local development)")
else:
    if os.getenv('DATABASE_URL'):
        print("Using DATABASE_URL from environment (Railway)")
    else:
        print("WARNING: No .env and no DATABASE_URL!")
        # Continues anyway - let Alembic handle the error
```

### What This Means:

| Scenario | Behavior |
|----------|----------|
| **Local with .env** | ✅ Uses .env, runs migrations |
| **Railway** | ✅ Uses env vars, runs migrations |
| **Neither** | ⚠️ Warns but continues (Alembic will error) |

---

## 🚀 For Railway Deployment

### What Gets Deployed:

**Backend Container:**
```
- Python app
- Alembic migrations
- NO .env file
- Environment variables injected by Railway
```

**Frontend Container:**
```
- Built React app (static files)
- Nginx server
- NO .env file
- VITE_API_URL was baked in at build time
```

### How Environment Variables Work:

```
Railway Dashboard
      ↓
Environment Variables Set
      ↓
Container Starts
      ↓
Python reads os.environ
      ↓
pydantic-settings loads variables
      ↓
App runs with Railway config
```

---

## 📊 Priority Order (pydantic-settings)

When loading configuration, pydantic-settings checks in this order:

1. **Environment variables** (highest priority)
2. `.env` file (if exists)
3. Default values (in code)

This means:
- Railway env vars **override** `.env` file
- Perfect for deployment!

---

## 🐛 Troubleshooting

### "ERROR: .env file not found!"

**Check:**
```bash
# 1. Are you in the right directory?
pwd
# Should be: /Users/bicomputing/CC2/chatbot-calendarbooking

# 2. Does .env exist?
ls -la .env

# 3. Is this for Railway?
# If deploying to Railway, ignore this error - it's expected!
```

**Solutions:**

For **Local Development**:
```bash
# Make sure you're in the right directory
cd /Users/bicomputing/CC2/chatbot-calendarbooking

# Verify .env exists
ls .env

# If missing, copy from example
cp .env.example .env
```

For **Railway**:
- Don't worry! Railway doesn't use `.env` files
- Make sure environment variables are set in Railway dashboard

---

## ✅ Current Status

Your project has:

- ✅ Root `.env` (4553 bytes) - Backend config for local dev
- ✅ `frontend/.env` - Frontend config for local dev
- ✅ Docker configuration - docker-compose.yml
- ✅ Railway configuration - railway.toml files
- ✅ Updated run_migrations.py - Works with or without .env

**Everything is properly configured for all three environments!**

---

## 🎯 Next Steps

### For Local Testing:
```bash
# Start locally
./scripts/start_app.ps1
# or
docker-compose up
```

### For Railway Deployment:
```bash
# Deploy
./deploy-to-railway.sh

# No .env files needed - Railway handles environment variables!
```

---

## 📝 Summary

| Question | Answer |
|----------|--------|
| Do I need .env locally? | ✅ Yes |
| Do I need .env in Docker? | Optional (docker-compose can use it) |
| Do I need .env in Railway? | ❌ No - use Railway variables |
| Will migrations work in Railway? | ✅ Yes - uses Railway DATABASE_URL |
| Will frontend get the API URL? | ✅ Yes - via Railway build args |

---

**You're all set!** The `.env` files are configured correctly for each environment. 🎉
