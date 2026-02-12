# 🚀 Railway Quick Start Guide

**TL;DR**: Deploy your Calendar Booking Platform to Railway in 5 minutes.

---

## ⚡ Super Quick Deployment

### 1️⃣ Automatic Deployment Script

```bash
./deploy-to-railway.sh
```

This script will:
- ✅ Check for uncommitted changes
- ✅ Push to GitHub
- ✅ Trigger Railway deployment
- ✅ Show you next steps

---

## 🔧 First-Time Setup (Do Once)

### Step 1: Create Services in Railway

**Option A: Via CLI (Recommended)**

```bash
# Link to your project
railway link

# Create services
railway service create backend
railway service create frontend
railway add postgresql
```

**Option B: Via Dashboard**

Visit: https://railway.com/project/c4f571ad-e818-43ad-8b3e-87d0c7240b76

- Click "+ New" → "Empty Service" → Name: **backend**
- Click "+ New" → "Empty Service" → Name: **frontend**
- Click "+ New" → "Database" → **PostgreSQL**

---

### Step 2: Configure Backend

```bash
# Link to backend service
railway link --service backend

# Set essential variables (copy-paste all at once)
railway variables --set DATABASE_URL='${{Postgres.DATABASE_URL}}' \
  --set PORT=8000 \
  --set DEBUG=false \
  --set SERVICE_API_KEY=p_vhr7URkOawqX17IzrZYEIh7YnA4AaXUJluKocevYM \
  --set DOCTOR_PORTAL_JWT_SECRET=d32f6a11-420d-4063-8597-41225579910a \
  --set ADMIN_PORTAL_JWT_SECRET=change-this-in-production \
  --set ADMIN_EMAIL=admin@example.com \
  --set ADMIN_PASSWORD=Admin@123 \
  --set OPENAI_API_KEY=your-openai-key-here \
  --set OPENAI_MODEL=gpt-4o-mini \
  --set DISABLE_CALENDAR_WORKERS=true \
  --set CORS_ALLOW_ORIGINS=http://localhost:5173

# Generate domain
railway domain
# Copy the backend URL (e.g., https://backend-production-xxxx.up.railway.app)
```

---

### Step 3: Configure Frontend

```bash
# Link to frontend service
railway link --service frontend

# Set backend URL (replace with your actual backend URL)
railway variables --set VITE_API_URL=https://backend-production-xxxx.up.railway.app

# Generate domain
railway domain
# Copy the frontend URL (e.g., https://frontend-production-xxxx.up.railway.app)
```

---

### Step 4: Update Backend CORS

```bash
# Link back to backend
railway link --service backend

# Update CORS with frontend URL
railway variables --set CORS_ALLOW_ORIGINS=https://frontend-production-xxxx.up.railway.app,http://localhost:5173
```

---

### Step 5: Deploy!

```bash
# Push to GitHub (Railway auto-deploys)
git push origin arc

# Or use the deployment script
./deploy-to-railway.sh
```

---

## 🎯 Essential Commands

### Check Service Status
```bash
railway status
```

### View Logs
```bash
# Backend
railway link --service backend
railway logs --follow

# Frontend
railway link --service frontend
railway logs --follow
```

### Set Environment Variables
```bash
railway link --service backend
railway variables --set KEY=value
```

### Redeploy
```bash
railway redeploy
```

### Run Commands in Backend
```bash
railway link --service backend
railway run python run_migrations.py
```

### Open Dashboard
```bash
railway open
```

---

## 📋 Required Environment Variables

### Backend (Minimum Required)

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | Auto-set by Railway Postgres |
| `SERVICE_API_KEY` | Your secure API key |
| `DOCTOR_PORTAL_JWT_SECRET` | Your JWT secret |
| `ADMIN_PORTAL_JWT_SECRET` | Your JWT secret |
| `ADMIN_EMAIL` | admin@example.com |
| `ADMIN_PASSWORD` | Admin@123 |
| `OPENAI_API_KEY` | sk-... |
| `CORS_ALLOW_ORIGINS` | Frontend URL |

### Frontend

| Variable | Example |
|----------|---------|
| `VITE_API_URL` | Backend URL |

---

## ✅ Quick Health Check

```bash
# Check backend (replace with your URL)
curl https://backend-production-xxxx.up.railway.app/health

# Expected response:
# {
#   "status": "healthy",
#   "service": "Calendar Booking Platform",
#   ...
# }
```

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Frontend can't connect to backend | Check `VITE_API_URL` is set correctly, rebuild frontend |
| CORS errors | Update `CORS_ALLOW_ORIGINS` in backend to include frontend URL |
| Database errors | Check `DATABASE_URL` is set, verify Postgres service is running |
| Build fails | Check Railway logs: `railway logs` |

---

## 📖 Full Documentation

For detailed setup instructions, see: [RAILWAY_DEPLOYMENT_UNIFIED.md](RAILWAY_DEPLOYMENT_UNIFIED.md)

---

## 🔗 Your URLs

After deployment, you'll have:

| Service | URL Template | Purpose |
|---------|--------------|---------|
| Backend | `https://backend-production-xxxx.up.railway.app` | API server |
| Frontend | `https://frontend-production-xxxx.up.railway.app` | Web app |
| API Docs | `https://backend-production-xxxx.up.railway.app/docs` | Swagger UI |
| Health | `https://backend-production-xxxx.up.railway.app/health` | Health check |

---

## 🎉 That's It!

Your platform is now live on Railway with:
- ✅ Auto-deploy on git push
- ✅ Managed database
- ✅ HTTPS enabled
- ✅ Health monitoring

**Dashboard**: https://railway.com/project/c4f571ad-e818-43ad-8b3e-87d0c7240b76
