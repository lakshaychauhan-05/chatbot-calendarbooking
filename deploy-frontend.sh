#!/bin/bash

# Deploy Frontend to Railway
# This script deploys only the frontend service

set -e

echo "🎨 Railway Frontend Deployment"
echo "==============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found!${NC}"
    echo "Install it from: https://docs.railway.app/develop/cli"
    exit 1
fi

echo -e "${GREEN}✅ Railway CLI found${NC}"
echo ""

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes:${NC}"
    git status -s
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Enter commit message:"
        read commit_message
        git add .
        git commit -m "$commit_message"
        echo -e "${GREEN}✅ Changes committed${NC}"
    else
        echo -e "${YELLOW}⚠️  Continuing without committing...${NC}"
    fi
fi

# Get current branch
BRANCH=$(git branch --show-current)
echo -e "${BLUE}Current branch: $BRANCH${NC}"
echo ""

# Check if VITE_API_URL is configured
echo -e "${YELLOW}⚠️  IMPORTANT: Frontend Build Configuration${NC}"
echo ""
echo "The frontend needs VITE_API_URL to be set in Railway."
echo "This variable is baked into the build at build time."
echo ""
read -p "Have you set VITE_API_URL in Railway frontend variables? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}Please set VITE_API_URL first:${NC}"
    echo ""
    echo "  1. Link to frontend service:"
    echo "     ${BLUE}railway link --service frontend${NC}"
    echo ""
    echo "  2. Set the backend URL:"
    echo "     ${BLUE}railway variables --set VITE_API_URL=https://your-backend-domain.up.railway.app${NC}"
    echo ""
    echo "  3. Then run this script again"
    echo ""
    exit 0
fi

# Ask for confirmation
echo ""
read -p "Deploy frontend from branch '$BRANCH' to Railway? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Push to GitHub with token support
echo ""
echo "📤 Pushing to GitHub..."

# Get repository info
REPO_URL=$(git remote get-url origin)

# Function to push with token
push_with_token() {
    echo ""
    echo -e "${YELLOW}🔑 GitHub Personal Access Token Required${NC}"
    echo ""
    echo "Create a token at: https://github.com/settings/tokens"
    echo "Required scope: 'repo'"
    echo ""
    read -sp "Enter your GitHub token (or press Enter to skip): " GITHUB_TOKEN
    echo ""

    if [[ -z "$GITHUB_TOKEN" ]]; then
        echo -e "${RED}❌ No token provided${NC}"
        return 1
    fi

    # Extract username and repo from URL
    if [[ $REPO_URL =~ github.com[:/]([^/]+)/([^/.]+) ]]; then
        USERNAME="${BASH_REMATCH[1]}"
        REPO="${BASH_REMATCH[2]}"

        # Construct authenticated URL
        AUTH_URL="https://${GITHUB_TOKEN}@github.com/${USERNAME}/${REPO}.git"

        # Push using token
        if git push "$AUTH_URL" "$BRANCH" 2>&1 | grep -v "$GITHUB_TOKEN"; then
            echo -e "${GREEN}✅ Pushed to GitHub with token${NC}"
            return 0
        else
            echo -e "${RED}❌ Push with token failed${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Could not parse repository URL${NC}"
        return 1
    fi
}

# Try regular push first
if git push origin $BRANCH 2>&1; then
    echo -e "${GREEN}✅ Pushed to GitHub${NC}"
else
    echo -e "${YELLOW}⚠️  Regular push failed, trying with token...${NC}"
    if ! push_with_token; then
        echo ""
        echo "Alternative methods:"
        echo "  1. Run: ./push-with-token.sh"
        echo "  2. Configure SSH: ssh-keygen && add key to GitHub"
        echo "  3. Use GitHub CLI: gh auth login"
        exit 1
    fi
fi
echo ""

# Link to frontend service
echo -e "${BLUE}Linking to frontend service...${NC}"
railway link --service frontend 2>/dev/null || echo -e "${YELLOW}Service already linked or needs manual linking${NC}"

# Display deployment info
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Frontend Deployment Started"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ Code pushed to GitHub${NC}"
echo -e "${BLUE}⏳ Railway is building and deploying frontend...${NC}"
echo ""
echo "What's being deployed:"
echo "  • React + Vite Frontend"
echo "  • Chatbot UI (/)"
echo "  • Doctor Portal (/doctor/*)"
echo "  • Admin Portal (/admin/*)"
echo "  • Nginx server (Port: 80)"
echo ""
echo "Build process:"
echo "  1. npm install dependencies"
echo "  2. Vite build (with VITE_API_URL)"
echo "  3. Docker image build"
echo "  4. Deploy to Railway"
echo ""
echo "⏱️  Expected build time: 3-5 minutes"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Monitor Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "View logs:"
echo "  ${BLUE}railway logs --follow${NC}"
echo ""
echo "Check status:"
echo "  ${BLUE}railway status${NC}"
echo ""
echo "Open dashboard:"
echo "  ${BLUE}railway open${NC}"
echo "  Or visit: https://railway.com/project/c4f571ad-e818-43ad-8b3e-87d0c7240b76"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Verify Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Once deployed, test frontend:"
echo "  • Open: ${BLUE}https://your-frontend-domain.up.railway.app${NC}"
echo "  • Chatbot: ${BLUE}https://your-frontend-domain.up.railway.app/${NC}"
echo "  • Doctor Login: ${BLUE}https://your-frontend-domain.up.railway.app/doctor/login${NC}"
echo "  • Admin Login: ${BLUE}https://your-frontend-domain.up.railway.app/admin/login${NC}"
echo ""
echo "Health check:"
echo "  ${BLUE}curl https://your-frontend-domain.up.railway.app/health${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  Important Notes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "• VITE_API_URL is baked into the build at build time"
echo "• If you change VITE_API_URL, you must rebuild frontend"
echo "• Make sure backend CORS includes your frontend URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ask if user wants to watch logs
read -p "Do you want to watch frontend deployment logs now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Following frontend logs (Press Ctrl+C to exit)...${NC}"
    echo ""
    sleep 2
    railway logs --follow
else
    echo ""
    echo -e "${GREEN}🎉 Frontend deployment initiated!${NC}"
    echo ""
    echo "Watch logs later with: ${BLUE}railway link --service frontend && railway logs --follow${NC}"
    echo ""
fi
