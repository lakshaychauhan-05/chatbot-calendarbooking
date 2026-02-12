# 🚀 Deployment Scripts Guide

Three deployment scripts for maximum flexibility.

---

## 📋 Available Scripts

| Script | Purpose | When to Use |
|--------|---------|-------------|
| **[deploy-to-railway.sh](deploy-to-railway.sh)** | Deploy **both** services | Full deployment, after major changes |
| **[deploy-backend.sh](deploy-backend.sh)** | Deploy **backend only** | API changes, backend fixes |
| **[deploy-frontend.sh](deploy-frontend.sh)** | Deploy **frontend only** | UI changes, styling updates |

---

## 🎯 Quick Reference

### Deploy Everything
```bash
./deploy-to-railway.sh
```
**Deploys:**
- ✅ Backend (API + all portals)
- ✅ Frontend (UI + all portals)

---

### Deploy Backend Only
```bash
./deploy-backend.sh
```
**Deploys:**
- ✅ Backend (FastAPI)
- ✅ Core Calendar API
- ✅ Doctor Portal API
- ✅ Admin Portal API
- ✅ Chatbot API
- ✅ Database migrations

**Use when:**
- Changed Python code
- Updated API endpoints
- Modified database models
- Fixed backend bugs
- Updated environment variables

---

### Deploy Frontend Only
```bash
./deploy-frontend.sh
```
**Deploys:**
- ✅ Frontend (React + Vite)
- ✅ Chatbot UI
- ✅ Doctor Portal UI
- ✅ Admin Portal UI

**Use when:**
- Changed React components
- Updated UI/styling
- Modified frontend routes
- Fixed frontend bugs
- Changed VITE_API_URL

⚠️ **Important:** VITE_API_URL must be set in Railway before deployment!

---

## 🔄 Deployment Flow

### All Scripts Follow Same Pattern:

```
1. Check Railway CLI installed
   ↓
2. Check for uncommitted changes
   ↓
3. Prompt to commit (if needed)
   ↓
4. Confirm deployment
   ↓
5. Push to GitHub (with token support)
   ↓
6. Link to Railway service
   ↓
7. Railway auto-deploys
   ↓
8. Show monitoring commands
   ↓
9. Optional: Watch logs
```

---

## 💡 Common Scenarios

### Scenario 1: Changed Backend Code Only

```bash
# Only deploy backend
./deploy-backend.sh
```

**Example changes:**
- Fixed bug in appointment API
- Updated doctor authentication
- Added new chatbot function
- Modified database query

**Result:**
- ✅ Backend rebuilds and deploys (~3 minutes)
- ⏭️ Frontend unchanged (stays running)

---

### Scenario 2: Changed Frontend Code Only

```bash
# Only deploy frontend
./deploy-frontend.sh
```

**Example changes:**
- Updated chatbot UI
- Fixed styling issue
- Changed doctor dashboard layout
- Updated admin panel

**Result:**
- ⏭️ Backend unchanged (stays running)
- ✅ Frontend rebuilds and deploys (~5 minutes)

---

### Scenario 3: Changed Both Frontend & Backend

```bash
# Deploy both
./deploy-to-railway.sh
```

**Example changes:**
- Added new feature requiring API + UI changes
- Updated authentication flow
- Major version update

**Result:**
- ✅ Backend rebuilds and deploys (~3 minutes)
- ✅ Frontend rebuilds and deploys (~5 minutes)
- 🔄 Both deploy in parallel

---

### Scenario 4: Only Changed Environment Variables

**Backend Variables:**
```bash
# Set variables via CLI
railway link --service backend
railway variables --set KEY=value

# Trigger redeploy (no code push needed)
railway redeploy
```

**Frontend Variables:**
```bash
# Set variables via CLI
railway link --service frontend
railway variables --set VITE_API_URL=new-url

# Must rebuild (VITE vars are build-time)
./deploy-frontend.sh
```

---

## 🛠️ Script Features

### All Scripts Include:

1. **Git Integration**
   - Detects uncommitted changes
   - Prompts to commit
   - Supports custom commit messages

2. **Token Authentication**
   - Tries regular git push first
   - Falls back to token prompt if needed
   - Secure token handling (not logged)

3. **Confirmation Prompts**
   - Confirm before deploying
   - Show what will be deployed
   - Cancel option at any step

4. **Service Linking**
   - Automatically links to Railway service
   - Shows if already linked

5. **Deployment Info**
   - Shows what's being deployed
   - Provides monitoring commands
   - Gives verification steps

6. **Log Watching**
   - Option to watch logs after deploy
   - Shows build progress
   - Real-time deployment status

---

## 📊 Deployment Comparison

| Aspect | deploy-to-railway.sh | deploy-backend.sh | deploy-frontend.sh |
|--------|---------------------|-------------------|-------------------|
| **Services** | Both | Backend only | Frontend only |
| **Build Time** | ~8 min (both) | ~3 min | ~5 min |
| **Code Push** | Yes | Yes | Yes |
| **Git Required** | Yes | Yes | Yes |
| **Railway CLI** | Yes | Yes | Yes |
| **Token Support** | ✅ | ✅ | ✅ |
| **Log Watching** | Backend | Backend | Frontend |

---

## 🎓 Advanced Usage

### Deploy with Custom Commit Message

```bash
# Backend
git add .
git commit -m "Fix appointment booking bug"
./deploy-backend.sh

# Frontend
git add .
git commit -m "Update chatbot UI"
./deploy-frontend.sh
```

### Deploy Specific Branch

```bash
# Switch branch first
git checkout feature-branch

# Then deploy
./deploy-backend.sh
```

### Force Redeploy Without Code Changes

```bash
# Link to service
railway link --service backend

# Force redeploy
railway redeploy
```

### Deploy with Environment Variable Changes

```bash
# 1. Update variables
railway link --service backend
railway variables --set NEW_VAR=value

# 2. Redeploy (if backend)
railway redeploy

# OR if frontend (needs rebuild)
./deploy-frontend.sh
```

---

## 🔍 Monitoring Deployments

### Watch Backend Deployment

```bash
railway link --service backend
railway logs --follow
```

### Watch Frontend Deployment

```bash
railway link --service frontend
railway logs --follow
```

### Check Deployment Status

```bash
railway status
```

### Open Dashboard

```bash
railway open
```

Or visit: https://railway.com/project/c4f571ad-e818-43ad-8b3e-87d0c7240b76

---

## ✅ Verification Steps

### After Backend Deployment

```bash
# Check health
curl https://your-backend-domain.up.railway.app/health

# Check API docs
open https://your-backend-domain.up.railway.app/docs
```

### After Frontend Deployment

```bash
# Check frontend
open https://your-frontend-domain.up.railway.app

# Check health
curl https://your-frontend-domain.up.railway.app/health

# Test routes
open https://your-frontend-domain.up.railway.app/doctor/login
open https://your-frontend-domain.up.railway.app/admin/login
```

---

## 🐛 Troubleshooting

### Script Won't Push to Git

**Error:** `Authentication failed` or `Permission denied`

**Solution:**
1. Script will automatically prompt for GitHub token
2. Or set up SSH: `ssh-keygen` and add to GitHub
3. Or use GitHub CLI: `gh auth login`

### Railway Service Not Found

**Error:** `Service not found`

**Solution:**
```bash
# List available services
railway status

# Link to correct service
railway link --service backend
# or
railway link --service frontend
```

### Frontend Can't Connect to Backend

**Error:** Network errors in browser console

**Solution:**
1. Check VITE_API_URL is set in Railway:
   ```bash
   railway link --service frontend
   railway variables
   ```

2. Verify backend CORS includes frontend URL:
   ```bash
   railway link --service backend
   railway variables
   ```

3. Rebuild frontend if VITE_API_URL changed:
   ```bash
   ./deploy-frontend.sh
   ```

### Build Fails on Railway

**Check logs:**
```bash
railway link --service backend  # or frontend
railway logs
```

**Common issues:**
- Missing environment variables
- Dependencies not installed
- Build errors in code

---

## 📝 Best Practices

### 1. Test Locally First
```bash
# Backend
python run.py

# Frontend
cd frontend && npm run dev

# Or use Docker
docker-compose up
```

### 2. Commit Changes Before Deploying
```bash
git add .
git commit -m "Descriptive message"
./deploy-backend.sh  # or deploy-frontend.sh
```

### 3. Deploy One Service at a Time
```bash
# Deploy backend first, verify it works
./deploy-backend.sh

# Then deploy frontend
./deploy-frontend.sh
```

### 4. Watch Logs During Deployment
```bash
# Always watch logs for the first few deployments
# Select "yes" when script asks to watch logs
```

### 5. Verify After Deployment
```bash
# Always test endpoints after deployment
curl https://your-backend-domain.up.railway.app/health
open https://your-frontend-domain.up.railway.app
```

---

## 🎯 Cheat Sheet

```bash
# Deploy everything
./deploy-to-railway.sh

# Deploy backend only
./deploy-backend.sh

# Deploy frontend only
./deploy-frontend.sh

# Watch backend logs
railway link --service backend && railway logs --follow

# Watch frontend logs
railway link --service frontend && railway logs --follow

# Check status
railway status

# Open dashboard
railway open

# Redeploy without code changes
railway link --service backend && railway redeploy
```

---

## 📚 Related Documentation

- [RAILWAY_QUICK_START.md](RAILWAY_QUICK_START.md) - Quick Railway setup
- [RAILWAY_DEPLOYMENT_UNIFIED.md](RAILWAY_DEPLOYMENT_UNIFIED.md) - Complete guide
- [GIT_PUSH_WITH_TOKEN.md](GIT_PUSH_WITH_TOKEN.md) - GitHub token guide
- [ENV_FILES_EXPLAINED.md](ENV_FILES_EXPLAINED.md) - Environment variables

---

## 🎉 Quick Start

**First time deploying?**

1. Deploy backend first:
   ```bash
   ./deploy-backend.sh
   ```

2. Get backend URL from Railway

3. Set frontend VITE_API_URL:
   ```bash
   railway link --service frontend
   railway variables --set VITE_API_URL=https://your-backend-url.railway.app
   ```

4. Deploy frontend:
   ```bash
   ./deploy-frontend.sh
   ```

5. Update backend CORS:
   ```bash
   railway link --service backend
   railway variables --set CORS_ALLOW_ORIGINS=https://your-frontend-url.railway.app
   railway redeploy
   ```

**Done!** 🚀

---

## 💡 Pro Tips

1. **Alias the scripts** for faster access:
   ```bash
   alias deploy-be='./deploy-backend.sh'
   alias deploy-fe='./deploy-frontend.sh'
   alias deploy-all='./deploy-to-railway.sh'
   ```

2. **Use VS Code tasks** for one-click deployment:
   ```json
   {
     "label": "Deploy Backend",
     "type": "shell",
     "command": "./deploy-backend.sh"
   }
   ```

3. **Set up GitHub Actions** for automatic deployment on push

4. **Use Railway webhooks** to trigger notifications on deployment

---

You now have complete control over your Railway deployments! 🎯
