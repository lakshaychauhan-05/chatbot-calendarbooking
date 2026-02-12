#!/bin/bash

# Deploy to Railway - Quick Deployment Script
# This script helps you deploy the Calendar Booking Platform to Railway

set -e

echo "🚀 Railway Deployment Helper"
echo "============================"
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

# Ask for confirmation
read -p "Deploy branch '$BRANCH' to Railway? (y/n) " -n 1 -r
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

# Display next steps
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Railway will now automatically detect and deploy your changes"
echo ""
echo "2. Monitor your deployment:"
echo "   ${BLUE}Backend logs:${NC}  railway link --service backend && railway logs"
echo "   ${BLUE}Frontend logs:${NC} railway link --service frontend && railway logs"
echo ""
echo "3. Check deployment status:"
echo "   ${BLUE}Dashboard:${NC} https://railway.com/project/c4f571ad-e818-43ad-8b3e-87d0c7240b76"
echo ""
echo "4. Verify services are healthy:"
echo "   ${BLUE}Backend:${NC}  curl https://your-backend-domain.up.railway.app/health"
echo "   ${BLUE}Frontend:${NC} Open https://your-frontend-domain.up.railway.app in browser"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}🎉 Deployment initiated successfully!${NC}"
echo ""
echo "📖 For detailed setup instructions, see: RAILWAY_DEPLOYMENT_UNIFIED.md"
echo ""

# Ask if user wants to watch logs
read -p "Do you want to watch backend deployment logs? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Linking to backend service..."
    railway link --service backend 2>/dev/null || echo "Service already linked or not found"
    echo "Following logs (Press Ctrl+C to exit)..."
    railway logs --follow
fi
