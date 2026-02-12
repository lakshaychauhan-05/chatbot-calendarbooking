# 🚀 Railway Deployment Guide - Unified Setup

This guide explains how to deploy your **Unified Calendar Booking Platform** to Railway with **2 services**:
- **Backend**: Single FastAPI app (Core API + Doctor Portal + Admin Portal + Chatbot)
- **Frontend**: Single React app (Chatbot + Doctor Portal + Admin Portal)

---

## 📋 Prerequisites

- ✅ Railway CLI installed (`which railway` shows `/usr/local/bin/railway`)
- ✅ Git repository connected to Railway
- ✅ Railway account and project created

**Your Project URL**: https://railway.com/project/c4f571ad-e818-43ad-8b3e-87d0c7240b76

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│          Railway Project                    │
│                                             │
│  ┌──────────────────┐    ┌───────────────┐ │
│  │   Backend        │    │   Frontend    │ │
│  │   Port: $PORT    │◄───│   Port: 80    │ │
│  │   (Python/FastAPI)│    │   (React/Vite)│ │
│  │                  │    │               │ │
│  │  • Core API      │    │  • Chatbot    │ │
│  │  • Doctor Portal │    │  • Doctor UI  │ │
│  │  • Admin Portal  │    │  • Admin UI   │ │
│  │  • Chatbot       │    │               │ │
│  └─────────┬────────┘    └───────────────┘ │
│            │                                 │
│            ▼                                 │
│  ┌──────────────────┐                       │
│  │   PostgreSQL     │                       │
│  │   Database       │                       │
│  └──────────────────┘                       │
└─────────────────────────────────────────────┘
```

---

## 🚀 Quick Deployment Steps

### Step 1: Prepare Your Local Repository

```bash
# Make sure you're in the project root
cd /Users/bicomputing/CC2/chatbot-calendarbooking

# Commit any pending changes
git add .
git commit -m "Prepare for Railway deployment"

# Push to your branch
git push origin arc  # or your main branch
```

---

### Step 2: Create Railway Services

You can either use the Railway CLI or the Dashboard.

#### Option A: Using Railway CLI (Recommended)

```bash
# Link to your Railway project
railway link

# Create backend service
railway service create backend

# Create frontend service
railway service create frontend

# Add PostgreSQL database
railway add postgresql
```

#### Option B: Using Railway Dashboard

1. Go to: https://railway.com/project/c4f571ad-e818-43ad-8b3e-87d0c7240b76
2. Click **"+ New"** → **"Empty Service"** → Name it **"backend"**
3. Click **"+ New"** → **"Empty Service"** → Name it **"frontend"**
4. Click **"+ New"** → **"Database"** → **"PostgreSQL"**

---

### Step 3: Configure Backend Service

#### 3.1 Set Build Configuration

**Via Dashboard:**
1. Click on **"backend"** service
2. Go to **Settings** → **Source**
3. Connect your GitHub repository
4. Set:
   - **Branch**: `arc` (or your main branch)
   - **Root Directory**: `/` (empty = root)
5. Railway will auto-detect the `railway.toml` file

**Via CLI:**
```bash
railway link --service backend
railway up
```

#### 3.2 Set Environment Variables

**Via Dashboard:**
Go to **backend** service → **Variables** tab → Add the following:

**Via CLI:**
```bash
railway link --service backend

# Database (automatically set if using Railway PostgreSQL)
railway variables --set DATABASE_URL=${{Postgres.DATABASE_URL}}

# Server
railway variables --set PORT=8000
railway variables --set DEBUG=false
railway variables --set DEFAULT_TIMEZONE=Asia/Kolkata

# Application
railway variables --set APP_NAME="Calendar Booking Platform"
railway variables --set APP_VERSION=1.0.0

# Core API Authentication
railway variables --set SERVICE_API_KEY=p_vhr7URkOawqX17IzrZYEIh7YnA4AaXUJluKocevYM
railway variables --set API_KEY_RATE_LIMIT_PER_MINUTE=120
railway variables --set API_KEY_RATE_LIMIT_BURST=30

# Doctor Portal JWT
railway variables --set DOCTOR_PORTAL_JWT_SECRET=d32f6a11-420d-4063-8597-41225579910a
railway variables --set DOCTOR_PORTAL_JWT_ALGORITHM=HS256
railway variables --set DOCTOR_PORTAL_ACCESS_TOKEN_EXPIRE_MINUTES=60
railway variables --set DOCTOR_PORTAL_REFRESH_TOKEN_EXPIRE_MINUTES=43200

# Admin Portal JWT
railway variables --set ADMIN_PORTAL_JWT_SECRET=change-this-admin-secret-in-production
railway variables --set ADMIN_PORTAL_JWT_ALGORITHM=HS256
railway variables --set ADMIN_PORTAL_ACCESS_TOKEN_EXPIRE_MINUTES=60
railway variables --set ADMIN_EMAIL=admin@example.com
railway variables --set ADMIN_PASSWORD=Admin@123

# OpenAI (for chatbot) - REPLACE WITH YOUR KEY
railway variables --set OPENAI_API_KEY=sk-your-openai-api-key-here
railway variables --set OPENAI_MODEL=gpt-4o-mini
railway variables --set OPENAI_TEMPERATURE=0.3
railway variables --set OPENAI_MAX_TOKENS=1000

# Google Calendar (disabled by default)
railway variables --set DISABLE_CALENDAR_WORKERS=true

# Twilio SMS (optional) - REPLACE WITH YOUR CREDENTIALS
railway variables --set SMS_NOTIFICATIONS_ENABLED=True
railway variables --set TWILIO_ACCOUNT_SID=your-twilio-sid
railway variables --set TWILIO_AUTH_TOKEN=your-twilio-token
railway variables --set TWILIO_PHONE_NUMBER=+1234567890

# CORS - will update after getting frontend URL
railway variables --set CORS_ALLOW_ORIGINS=http://localhost:5173
```

#### 3.3 Generate Backend Domain

**Via Dashboard:**
1. In **backend** service → **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://backend-production-xxxx.up.railway.app`)

**Via CLI:**
```bash
railway link --service backend
railway domain
# Copy the generated URL
```

**Save this URL!** You'll need it for frontend configuration.

---

### Step 4: Configure Frontend Service

#### 4.1 Set Build Configuration

**Via Dashboard:**
1. Click on **"frontend"** service
2. Go to **Settings** → **Source**
3. Connect your GitHub repository
4. Set:
   - **Branch**: `arc` (or your main branch)
   - **Root Directory**: `frontend`
5. Railway will auto-detect the `railway.toml` file in the frontend folder

**Via CLI:**
```bash
railway link --service frontend
railway up --path frontend
```

#### 4.2 Set Build Arguments (IMPORTANT!)

The frontend needs to know the backend URL at **build time**.

**Via Dashboard:**
1. Go to **frontend** service → **Variables**
2. Add:
   ```
   VITE_API_URL=https://your-backend-domain.up.railway.app
   ```
   Replace with your actual backend URL from Step 3.3

**Via CLI:**
```bash
railway link --service frontend
railway variables --set VITE_API_URL=https://your-backend-domain.up.railway.app
```

⚠️ **Important**: Vite bakes environment variables into the build at build time, so make sure this is set BEFORE deploying!

#### 4.3 Generate Frontend Domain

**Via Dashboard:**
1. In **frontend** service → **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://frontend-production-xxxx.up.railway.app`)

**Via CLI:**
```bash
railway link --service frontend
railway domain
# Copy the generated URL
```

---

### Step 5: Update Backend CORS

Now that you have the frontend URL, update backend CORS settings:

**Via Dashboard:**
1. Go to **backend** service → **Variables**
2. Update `CORS_ALLOW_ORIGINS`:
   ```
   CORS_ALLOW_ORIGINS=https://your-frontend-domain.up.railway.app,http://localhost:5173
   ```

**Via CLI:**
```bash
railway link --service backend
railway variables --set CORS_ALLOW_ORIGINS=https://your-frontend-domain.up.railway.app,http://localhost:5173
```

The backend will automatically redeploy with the new CORS settings.

---

### Step 6: Setup Database

#### Option 1: Railway PostgreSQL (Recommended)

If you added PostgreSQL via Railway:

1. Go to your project dashboard
2. Click on **Postgres** service
3. Go to **Variables** tab
4. Click **"Share Variables"**
5. Select **backend** service
6. Enable sharing `DATABASE_URL`
7. Backend will automatically redeploy with the database URL

#### Option 2: External Database

If using an external database (Supabase, AWS RDS, etc.):

```bash
railway link --service backend
railway variables --set DATABASE_URL=postgresql://user:password@host:port/dbname
```

---

### Step 7: Deploy!

Both services should now deploy automatically. You can monitor the deployment:

**Via Dashboard:**
- Click on each service → **Deployments** → Latest deployment → **View Logs**

**Via CLI:**
```bash
# Watch backend logs
railway link --service backend
railway logs

# Watch frontend logs (in a new terminal)
railway link --service frontend
railway logs
```

---

## ✅ Verification

### Check Backend Health

```bash
# Replace with your actual backend URL
curl https://backend-production-xxxx.up.railway.app/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "Calendar Booking Platform",
  "version": "1.0.0",
  "checks": {
    "database": "healthy",
    "calendar_credentials": "disabled",
    "openai": "configured"
  }
}
```

### Check Backend API Documentation

Visit: `https://your-backend-domain.up.railway.app/docs`

You should see the Swagger UI with all endpoints.

### Check Frontend

Visit: `https://your-frontend-domain.up.railway.app`

You should see the Calendar Booking Platform homepage with:
- Chatbot interface at `/`
- Doctor login at `/doctor/login`
- Admin login at `/admin/login`

---

## 🔧 Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes | `postgresql://user:pass@host:5432/db` |
| `PORT` | Server port (Railway sets this automatically) | ✅ Yes | `8000` |
| `SERVICE_API_KEY` | Core API authentication key | ✅ Yes | `your-secure-key` |
| `DOCTOR_PORTAL_JWT_SECRET` | JWT secret for doctor portal | ✅ Yes | `your-jwt-secret` |
| `ADMIN_PORTAL_JWT_SECRET` | JWT secret for admin portal | ✅ Yes | `your-jwt-secret` |
| `ADMIN_EMAIL` | Admin login email | ✅ Yes | `admin@example.com` |
| `ADMIN_PASSWORD` | Admin login password | ✅ Yes | `Admin@123` |
| `OPENAI_API_KEY` | OpenAI API key for chatbot | ✅ Yes | `sk-...` |
| `CORS_ALLOW_ORIGINS` | Allowed frontend URLs | ✅ Yes | `https://frontend.app` |
| `DISABLE_CALENDAR_WORKERS` | Disable Google Calendar sync | No | `true` |
| `SMS_NOTIFICATIONS_ENABLED` | Enable Twilio SMS | No | `true` |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | No | `AC...` |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | No | `...` |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | No | `+1234567890` |

### Frontend Environment Variables (Build Args)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | ✅ Yes | `https://backend.railway.app` |

---

## 🔍 Monitoring & Debugging

### View Logs

```bash
# Backend logs
railway link --service backend
railway logs --follow

# Frontend logs
railway link --service frontend
railway logs --follow
```

### Check Service Status

```bash
railway status
```

### Run Migrations Manually

```bash
railway link --service backend
railway run python run_migrations.py
```

### SSH into Container (for debugging)

```bash
railway link --service backend
railway shell
```

---

## 🐛 Common Issues & Solutions

### Issue: Frontend Can't Connect to Backend

**Symptoms:** CORS errors, network errors in browser console

**Solutions:**
1. Check that `VITE_API_URL` is set correctly in frontend variables
2. Check that `CORS_ALLOW_ORIGINS` includes your frontend URL in backend variables
3. Verify both services are deployed and healthy
4. Rebuild frontend after changing `VITE_API_URL` (Vite bakes it into the build)

### Issue: Database Connection Failed

**Symptoms:** Backend health check shows database unhealthy

**Solutions:**
1. Verify `DATABASE_URL` is set correctly
2. Check that PostgreSQL service is running
3. If using Railway Postgres, ensure variable sharing is enabled
4. Check backend logs for specific error messages

### Issue: Migrations Don't Run

**Symptoms:** Database tables don't exist

**Solutions:**
1. Check backend logs for migration errors
2. Run migrations manually:
   ```bash
   railway link --service backend
   railway run python run_migrations.py
   ```
3. Verify database connection is working

### Issue: Build Fails - "credentials/ not found"

**Symptoms:** Backend build fails looking for credentials folder

**Solution:** The Dockerfile creates an empty credentials folder. If Google Calendar is enabled (`DISABLE_CALENDAR_WORKERS=false`), you need to provide credentials via environment variable or Railway volume mount.

### Issue: OpenAI API Errors

**Symptoms:** Chatbot doesn't respond

**Solutions:**
1. Verify `OPENAI_API_KEY` is set correctly
2. Check you have credits in your OpenAI account
3. Verify the API key hasn't expired
4. Check backend logs for specific OpenAI errors

---

## 🔄 Continuous Deployment

Railway automatically deploys when you push to your connected branch:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin arc

# Railway will automatically:
# 1. Detect the push
# 2. Build both services
# 3. Run migrations (backend)
# 4. Deploy the new version
```

---

## 📊 Service URLs Summary

After deployment, you'll have:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | `https://frontend-production-xxxx.up.railway.app` | Main application |
| **Backend API** | `https://backend-production-xxxx.up.railway.app` | API server |
| **API Docs** | `https://backend-production-xxxx.up.railway.app/docs` | Swagger UI |
| **Health Check** | `https://backend-production-xxxx.up.railway.app/health` | Health status |
| **Chatbot** | `https://frontend-production-xxxx.up.railway.app/` | Chatbot UI |
| **Doctor Login** | `https://frontend-production-xxxx.up.railway.app/doctor/login` | Doctor portal |
| **Admin Login** | `https://frontend-production-xxxx.up.railway.app/admin/login` | Admin portal |

---

## 🎯 Checklist

Before going to production:

- [ ] Update all JWT secrets to secure random values
- [ ] Update admin password
- [ ] Set up proper HTTPS (Railway handles this automatically)
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring/alerts
- [ ] Test all authentication flows
- [ ] Test chatbot functionality
- [ ] Test doctor portal functionality
- [ ] Test admin portal functionality
- [ ] Enable Google Calendar integration if needed
- [ ] Enable SMS notifications if needed
- [ ] Set up database backups
- [ ] Review and update CORS origins
- [ ] Check all API keys are valid and have appropriate limits

---

## 📞 Support

- **Railway Docs**: https://docs.railway.app/
- **Project Dashboard**: https://railway.com/project/c4f571ad-e818-43ad-8b3e-87d0c7240b76
- **Railway CLI**: `railway help`

---

## 🎉 You're All Set!

Your unified Calendar Booking Platform is now deployed on Railway with:
- ✅ Automatic deployments on git push
- ✅ Managed PostgreSQL database
- ✅ HTTPS enabled by default
- ✅ Health checks and auto-restart
- ✅ Centralized logging
- ✅ Scalable infrastructure

Happy deploying! 🚀
