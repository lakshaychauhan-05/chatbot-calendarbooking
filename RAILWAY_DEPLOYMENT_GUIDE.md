# Railway Deployment Guide - Backend + Frontend

## ✅ Services Created Successfully!

Two services have been created in your Railway project:
1. **Backend Service** (API + Portals + Chatbot)
2. **Frontend Service** (React + Vite)

**Project URL**: https://railway.com/project/c4f571ad-e818-43ad-8b3e-87d0c7240b76

---

## 📋 Configuration Required

### Step 1: Push Git Changes (Required!)

The credentials folder was added locally but needs to be pushed to GitHub:

```bash
# If you have SSH key configured:
git remote set-url origin git@github.com:lakshaychauhan-05/chatbot-calendarbooking.git
git push origin arc

# OR configure GitHub CLI:
gh auth login
git push origin arc

# OR push via GitHub Desktop or web interface
```

---

## 🔧 Step 2: Configure Backend Service

### 2.1 Set Build Configuration

1. Go to Railway Dashboard: https://railway.com/project/c4f571ad-e818-43ad-8b3e-87d0c7240b76
2. Click on **"backend"** service
3. Go to **Settings** → **Build**
4. Set the following:
   - **Root Directory**: `/` (leave empty or set to root)
   - **Dockerfile Path**: `Dockerfile`
   - **Branch**: `arc`

### 2.2 Set Environment Variables

Click on **"backend"** service → **Variables** tab

**Essential Variables:**

```bash
# Database (you'll set this up yourself)
DATABASE_URL=postgresql://user:password@host:port/dbname

# Server
PORT=8000
DEBUG=false
DISABLE_CALENDAR_WORKERS=true
DEFAULT_TIMEZONE=Asia/Kolkata

# Application
APP_NAME=Calendar Booking Platform
APP_VERSION=1.0.0

# Core API Authentication
SERVICE_API_KEY=p_vhr7URkOawqX17IzrZYEIh7YnA4AaXUJluKocevYM
API_KEY_RATE_LIMIT_PER_MINUTE=120
API_KEY_RATE_LIMIT_BURST=30

# Doctor Portal JWT
DOCTOR_PORTAL_JWT_SECRET=d32f6a11-420d-4063-8597-41225579910a
DOCTOR_PORTAL_JWT_ALGORITHM=HS256
DOCTOR_PORTAL_ACCESS_TOKEN_EXPIRE_MINUTES=60
DOCTOR_PORTAL_REFRESH_TOKEN_EXPIRE_MINUTES=43200

# Admin Portal JWT
ADMIN_PORTAL_JWT_SECRET=change-this-admin-secret
ADMIN_PORTAL_JWT_ALGORITHM=HS256
ADMIN_PORTAL_ACCESS_TOKEN_EXPIRE_MINUTES=60
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123

# OpenAI (for chatbot)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.3
OPENAI_MAX_TOKENS=1000

# Twilio (for SMS)
SMS_NOTIFICATIONS_ENABLED=True
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# CORS (will update after getting frontend URL)
CORS_ALLOW_ORIGINS=http://localhost:5173
```

### 2.3 Generate Public Domain for Backend

1. In **backend** service → **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://backend-production-xxxx.up.railway.app`)
4. Save this URL - you'll need it for frontend configuration

---

## 🎨 Step 3: Configure Frontend Service

### 3.1 Set Build Configuration

1. Click on **"frontend"** service
2. Go to **Settings** → **Build**
3. Set the following:
   - **Root Directory**: `frontend`
   - **Dockerfile Path**: `frontend/Dockerfile`
   - **Branch**: `arc`

### 3.2 Set Build Arguments

In **Settings** → **Build** → **Build Arguments**:

```bash
VITE_API_URL=https://your-backend-domain.up.railway.app
```

Replace `your-backend-domain.up.railway.app` with the actual backend URL from Step 2.3

### 3.3 Generate Public Domain for Frontend

1. In **frontend** service → **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://frontend-production-xxxx.up.railway.app`)

---

## 🔄 Step 4: Update Backend CORS

Now that you have the frontend URL, update backend environment variables:

1. Go to **backend** service → **Variables**
2. Update:

```bash
CORS_ALLOW_ORIGINS=https://your-frontend-domain.up.railway.app,http://localhost:5173
```

3. Click **"Redeploy"** in the backend service

---

## 🗄️ Step 5: Setup Database (You'll do this manually)

### Option 1: Railway PostgreSQL

1. Click **"+ New"** in your project
2. Select **"Database"** → **"PostgreSQL"**
3. Once created, go to **Postgres** service → **Settings** → **Shared Variables**
4. Enable sharing `DATABASE_URL` with the **backend** service
5. Redeploy backend service

### Option 2: External Database

1. Create database on your preferred provider (AWS RDS, Supabase, etc.)
2. Get the connection string
3. Set it in backend **Variables**:
   ```bash
   DATABASE_URL=postgresql://user:password@host:port/dbname
   ```
4. Redeploy backend service

---

## ✅ Step 6: Verify Deployment

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

### Check Frontend

Open your frontend URL in a browser:
```
https://frontend-production-xxxx.up.railway.app
```

You should see the Calendar Booking Platform homepage.

### Check API Documentation

Visit:
```
https://backend-production-xxxx.up.railway.app/docs
```

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────┐
│          Railway Project                    │
│                                             │
│  ┌─────────────┐      ┌─────────────┐     │
│  │   Backend   │      │  Frontend   │     │
│  │  (Python)   │◄─────┤   (React)   │     │
│  │   Port 8000 │      │   Port 80   │     │
│  └──────┬──────┘      └─────────────┘     │
│         │                                   │
│         ▼                                   │
│  ┌─────────────┐                           │
│  │  Database   │ (You'll setup)            │
│  │ (PostgreSQL)│                           │
│  └─────────────┘                           │
└─────────────────────────────────────────────┘
```

---

## 🔍 Monitoring & Logs

### View Backend Logs
```bash
railway link --service backend
railway logs
```

### View Frontend Logs
```bash
railway link --service frontend
railway logs
```

### Or use Railway Dashboard
- Click on service → **Deployments** → Latest deployment → **View Logs**

---

## 🐛 Troubleshooting

### Backend Build Fails: "credentials/ not found"

**Solution**: Push the git changes (credentials folder was created locally)
```bash
git push origin arc
```

### Frontend Can't Connect to Backend

**Check**:
1. VITE_API_URL is set correctly in frontend build args
2. CORS_ALLOW_ORIGINS includes frontend URL in backend env vars
3. Both services are deployed and running

### Database Connection Error

**Check**:
1. DATABASE_URL is set in backend env vars
2. Database is accessible from Railway (check firewall/whitelist)
3. Connection string format is correct

### Migrations Don't Run

**Solution**:
- Check backend logs for migration errors
- Manually run migrations:
  ```bash
  railway link --service backend
  railway run python run_migrations.py
  ```

---

## 📝 Quick Commands Reference

```bash
# Link to project
railway link --project calendar-booking-api

# Link to specific service
railway link --service backend
railway link --service frontend

# View logs
railway logs

# Run commands in backend
railway link --service backend
railway run python run_migrations.py

# Check status
railway status

# Redeploy
railway redeploy

# Add environment variable
railway variables --set KEY=value
```

---

## 🎯 Next Steps

1. ✅ Push git changes: `git push origin arc`
2. ✅ Configure backend service (Root: `/`, Dockerfile: `Dockerfile`)
3. ✅ Set backend environment variables
4. ✅ Generate backend domain
5. ✅ Configure frontend service (Root: `frontend/`, Dockerfile: `frontend/Dockerfile`)
6. ✅ Set frontend build args with backend URL
7. ✅ Generate frontend domain
8. ✅ Update backend CORS with frontend URL
9. ✅ Setup database and add DATABASE_URL
10. ✅ Test endpoints and application

---

## 🚀 Your Services Are Ready!

Once configured, your services will automatically:
- Build on every git push to the `arc` branch
- Run migrations automatically (backend)
- Serve the application with proper health checks
- Scale based on Railway's infrastructure

**Dashboard**: https://railway.com/project/c4f571ad-e818-43ad-8b3e-87d0c7240b76

---

Good luck with your deployment! 🎉
