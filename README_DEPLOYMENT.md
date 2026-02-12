# 🚀 Quick Deployment Guide

Choose the right script for your deployment needs.

---

## 🎯 Which Script Should I Use?

```
┌─────────────────────────────────────────────┐
│  What did you change?                       │
└─────────────────────────────────────────────┘
            │
            ├─── Changed Python/Backend code?
            │    └─> Use: ./deploy-backend.sh
            │
            ├─── Changed React/Frontend code?
            │    └─> Use: ./deploy-frontend.sh
            │
            └─── Changed both or major update?
                 └─> Use: ./deploy-to-railway.sh
```

---

## 📦 Available Deployment Scripts

### 1. Deploy Both Services (Full Deployment)
```bash
./deploy-to-railway.sh
```
**Deploys:** Backend + Frontend
**Time:** ~8 minutes
**Use when:** Major changes, first deployment

---

### 2. Deploy Backend Only
```bash
./deploy-backend.sh
```
**Deploys:** Backend (API)
**Time:** ~3 minutes
**Use when:**
- Changed Python files
- Updated API endpoints
- Modified database models
- Changed backend logic

---

### 3. Deploy Frontend Only
```bash
./deploy-frontend.sh
```
**Deploys:** Frontend (UI)
**Time:** ~5 minutes
**Use when:**
- Changed React components
- Updated CSS/styling
- Modified frontend routes
- Changed UI behavior

---

## 🎬 Quick Start Example

### Scenario: You fixed a bug in the backend

```bash
# 1. Make your changes to backend code
vim app/routes/appointment.py

# 2. Test locally (optional but recommended)
python run.py

# 3. Deploy backend only
./deploy-backend.sh

# Script will:
# - Detect changes
# - Ask to commit
# - Push to GitHub
# - Deploy to Railway
# - Show logs
```

---

### Scenario: You updated the chatbot UI

```bash
# 1. Make your changes to frontend code
vim frontend/src/components/Chatbot.tsx

# 2. Test locally (optional but recommended)
cd frontend && npm run dev

# 3. Deploy frontend only
./deploy-frontend.sh

# Script will:
# - Check VITE_API_URL is set
# - Detect changes
# - Ask to commit
# - Push to GitHub
# - Deploy to Railway
# - Show logs
```

---

## 📊 Comparison Table

| What Changed | Script to Use | What Gets Deployed | Time |
|--------------|--------------|-------------------|------|
| Backend code | `./deploy-backend.sh` | API only | ~3 min |
| Frontend code | `./deploy-frontend.sh` | UI only | ~5 min |
| Both | `./deploy-to-railway.sh` | API + UI | ~8 min |
| Env vars only (backend) | `railway redeploy` | API only | ~2 min |
| Env vars (frontend) | `./deploy-frontend.sh` | UI only | ~5 min |

---

## 🔑 Authentication

All scripts support GitHub token authentication:

1. **First try:** Regular git push
2. **If fails:** Automatically prompts for GitHub token
3. **Create token at:** https://github.com/settings/tokens
4. **Required scope:** `repo`

---

## 📝 What Each Script Does

### deploy-to-railway.sh
```
✅ Commits changes (if uncommitted)
✅ Pushes to GitHub
✅ Triggers Railway deployment
✅ Deploys BOTH services
✅ Shows monitoring commands
✅ Option to watch logs
```

### deploy-backend.sh
```
✅ Commits changes (if uncommitted)
✅ Pushes to GitHub
✅ Triggers Railway deployment
✅ Deploys BACKEND only
✅ Links to backend service
✅ Shows backend monitoring
✅ Option to watch backend logs
```

### deploy-frontend.sh
```
✅ Checks VITE_API_URL is set
✅ Commits changes (if uncommitted)
✅ Pushes to GitHub
✅ Triggers Railway deployment
✅ Deploys FRONTEND only
✅ Links to frontend service
✅ Shows frontend monitoring
✅ Option to watch frontend logs
```

---

## ⚡ Super Quick Commands

```bash
# Deploy backend
./deploy-backend.sh

# Deploy frontend
./deploy-frontend.sh

# Deploy both
./deploy-to-railway.sh

# Watch backend logs
railway link --service backend && railway logs --follow

# Watch frontend logs
railway link --service frontend && railway logs --follow
```

---

## ✅ Verify Deployments

### Backend Health Check
```bash
curl https://your-backend-domain.up.railway.app/health
```

### Frontend Health Check
```bash
curl https://your-frontend-domain.up.railway.app/health
```

### Open in Browser
```bash
# Backend API docs
open https://your-backend-domain.up.railway.app/docs

# Frontend app
open https://your-frontend-domain.up.railway.app
```

---

## 🐛 Common Issues

### "Authentication failed"
**Solution:** Script will prompt for GitHub token

### "VITE_API_URL not set"
**Solution:**
```bash
railway link --service frontend
railway variables --set VITE_API_URL=https://backend-url.railway.app
```

### "Service not found"
**Solution:**
```bash
railway link --service backend  # or frontend
```

---

## 📚 Full Documentation

- **[DEPLOYMENT_SCRIPTS.md](DEPLOYMENT_SCRIPTS.md)** - Complete guide for all scripts
- **[RAILWAY_QUICK_START.md](RAILWAY_QUICK_START.md)** - Railway setup guide
- **[GIT_PUSH_WITH_TOKEN.md](GIT_PUSH_WITH_TOKEN.md)** - GitHub token guide

---

## 🎯 Recommended Workflow

### For Development

1. **Make changes locally**
2. **Test locally**
   ```bash
   # Backend
   python run.py

   # Frontend
   cd frontend && npm run dev
   ```
3. **Deploy appropriate service**
   ```bash
   ./deploy-backend.sh   # or
   ./deploy-frontend.sh  # or
   ./deploy-to-railway.sh
   ```
4. **Verify deployment**
5. **Monitor logs if needed**

---

## 🎉 Ready to Deploy?

**Choose your script:**

- Changed backend? → `./deploy-backend.sh`
- Changed frontend? → `./deploy-frontend.sh`
- Changed both? → `./deploy-to-railway.sh`

**Just run it!** The script handles everything else. 🚀
