# 🔐 Git Push with Token Guide

Quick reference for pushing to GitHub using a Personal Access Token.

---

## 🚀 Quick Commands

### Method 1: Use the Deployment Script (Recommended)
```bash
./deploy-to-railway.sh
```
- Will automatically prompt for token if SSH/HTTPS push fails
- Handles commit, push, and Railway deployment

### Method 2: Use the Token-Only Script
```bash
./push-with-token.sh
```
- Only handles git push with token
- More focused, good for just pushing changes

### Method 3: Manual One-Liner
```bash
# Replace YOUR_TOKEN, USERNAME, and REPO
git push https://YOUR_TOKEN@github.com/USERNAME/REPO.git arc
```

For your repository:
```bash
git push https://YOUR_TOKEN@github.com/lakshaychauhan-05/chatbot-calendarbooking.git arc
```

---

## 🔑 Create GitHub Token

1. Go to: **https://github.com/settings/tokens**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `Railway Deployment`
4. Select scope: ✅ **repo** (Full control of private repositories)
5. Click **"Generate token"**
6. Copy the token (starts with `ghp_`)

⚠️ **Important**: Save the token somewhere safe - you can only see it once!

---

## 📋 Token Formats

Valid GitHub token formats:
- `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (Personal Access Token - classic)
- `github_pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (Fine-grained Personal Access Token)

---

## 🔧 Using the Token

### Option A: Interactive (Most Secure)
```bash
./deploy-to-railway.sh
# Script will prompt for token when needed
```

### Option B: Environment Variable
```bash
# Set token for current session
export GITHUB_TOKEN=ghp_your_token_here

# Then push normally
git push origin arc
```

### Option C: Save Token in Git Config (⚠️ Less Secure)
```bash
# Save token in remote URL
git remote set-url origin https://YOUR_TOKEN@github.com/lakshaychauhan-05/chatbot-calendarbooking.git

# Now regular push will work
git push origin arc
```

**Warning**: This stores your token in plain text in `.git/config`

To remove it later:
```bash
git remote set-url origin https://github.com/lakshaychauhan-05/chatbot-calendarbooking.git
```

### Option D: Use GitHub CLI (Recommended Alternative)
```bash
# Install GitHub CLI
brew install gh  # macOS
# or download from: https://cli.github.com/

# Login once
gh auth login

# Now regular git push works
git push origin arc
```

---

## ✅ Verify Token Works

Test your token:
```bash
# Replace with your token
curl -H "Authorization: token ghp_your_token_here" \
  https://api.github.com/user
```

Should return your GitHub user info.

---

## 🐛 Troubleshooting

### "Authentication failed"
- Check token is valid and hasn't expired
- Verify token has `repo` scope
- Make sure you copied the entire token

### "Permission denied"
- Token needs `repo` scope for private repositories
- For public repos, `public_repo` scope is enough

### "Repository not found"
- Check the repository URL is correct
- Verify you have access to the repository
- Token must have appropriate permissions

### Token in Error Messages
The scripts filter out tokens from error messages, but be careful when:
- Copying error messages
- Sharing logs
- Taking screenshots

---

## 🔒 Security Best Practices

1. **Never commit tokens to git**
   - Add to `.gitignore` if storing in files
   - Use environment variables or prompts

2. **Use minimal scope**
   - Only grant `repo` scope, nothing more
   - Use fine-grained tokens when possible

3. **Rotate tokens regularly**
   - GitHub recommends rotating every 90 days
   - Delete old tokens after creating new ones

4. **Use token expiration**
   - Set expiration when creating token
   - GitHub default: 30 days

5. **Delete tokens when done**
   - Go to: https://github.com/settings/tokens
   - Delete tokens you're not using

---

## 📊 Comparison of Methods

| Method | Security | Ease of Use | Best For |
|--------|----------|-------------|----------|
| **Interactive Prompt** | ✅✅✅ High | ✅✅ Good | One-time pushes |
| **Environment Variable** | ✅✅ Medium | ✅✅ Good | Temporary sessions |
| **Saved in Git Config** | ❌ Low | ✅✅✅ Easy | Personal machines only |
| **GitHub CLI** | ✅✅✅ High | ✅✅✅ Easy | Regular use (recommended) |
| **SSH Keys** | ✅✅✅ High | ✅✅✅ Easy | Regular use (recommended) |

---

## 🎯 Recommended Setup

**For long-term use**, choose one of:

1. **GitHub CLI** (Easiest)
   ```bash
   brew install gh
   gh auth login
   # Follow prompts
   ```

2. **SSH Keys** (Most secure)
   ```bash
   # Generate SSH key
   ssh-keygen -t ed25519 -C "your_email@example.com"

   # Copy public key
   cat ~/.ssh/id_ed25519.pub

   # Add to GitHub: https://github.com/settings/keys

   # Update remote URL
   git remote set-url origin git@github.com:lakshaychauhan-05/chatbot-calendarbooking.git
   ```

**For quick/one-time use**:
- Use `./deploy-to-railway.sh` and enter token when prompted

---

## 📞 Need Help?

- **GitHub Token Docs**: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
- **GitHub CLI**: https://cli.github.com/
- **SSH Keys**: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

---

## 🎉 Quick Start

**Right now, to push your changes:**

```bash
# Option 1: Use deployment script (handles everything)
./deploy-to-railway.sh

# Option 2: Just push
./push-with-token.sh

# Option 3: Manual
git push https://YOUR_TOKEN@github.com/lakshaychauhan-05/chatbot-calendarbooking.git arc
```

The scripts will prompt you for your token when needed!
