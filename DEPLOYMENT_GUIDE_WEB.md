# Web Deployment Guide

## 🚀 Quick Deployment

### Method 1: Using the Deploy Button (Recommended)

1. **Open the application** in your browser (localhost:8081 or deployed site)
2. **Navigate to Settings** from the sidebar
3. **Click the "🚀 Deploy to Web" button**
4. **Follow the instructions** displayed in the deployment log
5. **Open PowerShell** in the project directory
6. **Run the command**: `.\deploy-web.ps1`

### Method 2: Using PowerShell Script Directly

```powershell
# Navigate to project directory
cd "E:\prashant\APP_PILOT PROJECT"

# Run deployment script
.\deploy-web.ps1
```

### Method 3: Manual Git Commands

```powershell
git add .
git commit -m "Deploy: Your commit message"
git push origin main
```

## 📋 What Happens During Deployment

1. **Stage Changes**: All modified files are staged for commit
2. **Commit**: Changes are committed with timestamp
3. **Push to GitHub**: Code is pushed to the main branch
4. **GitHub Actions Trigger**: Automatic build workflow starts
5. **Build Process**: 
   - Installs dependencies
   - Builds web application using Expo
   - Optimizes for production
6. **Deploy to GitHub Pages**: Built files are deployed
7. **Live Update**: Site updates at https://prashantakashe.github.io/pilotappra/

## ⏱️ Timeline

- **Push to GitHub**: Immediate
- **Build Process**: 1-2 minutes
- **Deployment**: 30-60 seconds
- **Total Time**: 2-3 minutes

## 🔍 Monitoring Deployment

### GitHub Actions Dashboard
- **URL**: https://github.com/prashantakashe/pilotappra/actions
- **Status**: Green checkmark ✅ = Success, Red X ❌ = Failed

### Live Website
- **URL**: https://prashantakashe.github.io/pilotappra/
- **Clear Cache**: Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

## 🛠️ Troubleshooting

### Deployment Failed?

1. **Check GitHub Actions logs**:
   - Go to https://github.com/prashantakashe/pilotappra/actions
   - Click on the failed workflow
   - Review error messages

2. **Common Issues**:
   - **Build Error**: Check for syntax errors in your code
   - **Push Failed**: Ensure you have internet connection
   - **Authentication**: Verify GitHub credentials

3. **Manual Fix**:
   ```powershell
   # Pull latest changes
   git pull origin main
   
   # Stage and commit
   git add .
   git commit -m "Fix: Description of fix"
   
   # Push again
   git push origin main
   ```

### Changes Not Showing?

1. **Clear browser cache**: `Ctrl+Shift+R`
2. **Wait 2-3 minutes**: Deployment takes time
3. **Check GitHub Actions**: Ensure deployment succeeded
4. **Verify commit**: Check if your changes were committed

## 📁 Files Involved

- **`deploy-web.ps1`**: PowerShell deployment script
- **`.github/workflows/deploy.yml`**: GitHub Actions workflow
- **`src/screens/SettingsScreen.tsx`**: Deploy button UI
- **`dist/`**: Built web files (auto-generated)

## 🔐 Requirements

- Git installed and configured
- GitHub account with push access
- PowerShell (Windows) or Terminal (Mac/Linux)
- Internet connection

## 💡 Tips

1. **Test locally first**: Run `npx expo start` and test on localhost
2. **Commit frequently**: Smaller commits are easier to debug
3. **Descriptive messages**: Use clear commit messages
4. **Monitor actions**: Always check if deployment succeeded
5. **Clear cache**: Force refresh after deployment

## 🎯 Best Practices

1. **Before deploying**:
   - Test all changes locally
   - Check for console errors
   - Verify functionality works

2. **During deployment**:
   - Use the deploy button for convenience
   - Review changes before confirming
   - Monitor GitHub Actions

3. **After deployment**:
   - Verify changes on live site
   - Test critical features
   - Check mobile responsiveness

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review GitHub Actions logs
3. Test locally to isolate the issue
4. Check git status: `git status`
5. View recent commits: `git log --oneline -5`

---

**Last Updated**: December 5, 2025
**Version**: 1.0
