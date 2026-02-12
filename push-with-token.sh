#!/bin/bash

# Push to GitHub using Personal Access Token
# This script helps you push changes when SSH is not configured

set -e

echo "🔐 Push to GitHub with Token"
echo "============================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get current branch
BRANCH=$(git branch --show-current)
echo -e "${BLUE}Current branch: $BRANCH${NC}"
echo ""

# Get repository info
REPO_URL=$(git remote get-url origin)
echo -e "${BLUE}Repository: $REPO_URL${NC}"
echo ""

# Check if there are commits to push
if git diff origin/$BRANCH..HEAD --quiet 2>/dev/null; then
    if [[ -z $(git status -s) ]]; then
        echo -e "${GREEN}✅ Nothing to push - already up to date${NC}"
        exit 0
    fi
fi

# Show what will be pushed
echo -e "${YELLOW}📝 Commits to push:${NC}"
git log origin/$BRANCH..HEAD --oneline --decorate 2>/dev/null || echo "New branch or no upstream set"
echo ""

# Prompt for GitHub token
echo -e "${YELLOW}🔑 GitHub Personal Access Token Required${NC}"
echo ""
echo "You need a GitHub Personal Access Token with 'repo' scope."
echo ""
echo "To create one:"
echo "  1. Go to: https://github.com/settings/tokens"
echo "  2. Click 'Generate new token' → 'Generate new token (classic)'"
echo "  3. Give it a name (e.g., 'Railway Deployment')"
echo "  4. Select scope: 'repo' (Full control of private repositories)"
echo "  5. Click 'Generate token'"
echo "  6. Copy the token (starts with 'ghp_')"
echo ""
read -sp "Enter your GitHub token: " GITHUB_TOKEN
echo ""
echo ""

if [[ -z "$GITHUB_TOKEN" ]]; then
    echo -e "${RED}❌ No token provided${NC}"
    exit 1
fi

# Validate token format
if [[ ! $GITHUB_TOKEN =~ ^(ghp_|github_pat_) ]]; then
    echo -e "${YELLOW}⚠️  Token doesn't look like a GitHub PAT (should start with 'ghp_' or 'github_pat_')${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Push cancelled."
        exit 0
    fi
fi

# Extract username and repo from URL
if [[ $REPO_URL =~ github.com[:/]([^/]+)/([^/.]+) ]]; then
    USERNAME="${BASH_REMATCH[1]}"
    REPO="${BASH_REMATCH[2]}"
else
    echo -e "${RED}❌ Could not parse repository URL${NC}"
    exit 1
fi

echo -e "${BLUE}Repository: $USERNAME/$REPO${NC}"
echo ""

# Construct authenticated URL
AUTH_URL="https://${GITHUB_TOKEN}@github.com/${USERNAME}/${REPO}.git"

# Push using token
echo -e "${YELLOW}📤 Pushing to GitHub...${NC}"
if git push "$AUTH_URL" "$BRANCH" 2>&1 | grep -v "$GITHUB_TOKEN"; then
    echo ""
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎯 Next Steps:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Railway will automatically deploy your changes."
    echo ""
    echo "Monitor deployment:"
    echo "  • Dashboard: https://railway.com/project/c4f571ad-e818-43ad-8b3e-87d0c7240b76"
    echo "  • Backend logs:  ${BLUE}railway link --service backend && railway logs${NC}"
    echo "  • Frontend logs: ${BLUE}railway link --service frontend && railway logs${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo ""
    echo -e "${RED}❌ Push failed${NC}"
    echo ""
    echo "Common issues:"
    echo "  • Token expired or invalid"
    echo "  • Token doesn't have 'repo' scope"
    echo "  • Branch protection rules preventing push"
    echo "  • Network/connectivity issues"
    echo ""
    exit 1
fi

# Optional: Update remote to use HTTPS with token (for future pushes)
echo ""
read -p "Do you want to save this token for future pushes? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}⚠️  WARNING: This will store your token in plain text in .git/config${NC}"
    echo "Only do this on a secure, personal machine."
    echo ""
    read -p "Are you sure? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote set-url origin "$AUTH_URL"
        echo -e "${GREEN}✅ Remote updated. Future pushes will use this token.${NC}"
        echo ""
        echo "To remove the token later, run:"
        echo "  git remote set-url origin https://github.com/$USERNAME/$REPO.git"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Done!${NC}"
