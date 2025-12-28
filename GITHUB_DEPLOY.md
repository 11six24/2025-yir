# Deploy to Cloudflare Pages via GitHub

## Quick Setup (5 minutes)

### Step 1: Initialize Git & Push to GitHub

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Ambassador Year in Review 2025"

# Create a new repository on GitHub
# Go to: https://github.com/new
# Repository name: ambassador-yir-2025
# Visibility: Private (recommended - contains ambassador data)
# Do NOT initialize with README

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ambassador-yir-2025.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2: Connect Cloudflare Pages to GitHub

1. **Go to Cloudflare Dashboard**
   - Visit https://dash.cloudflare.com
   - Navigate to "Pages" in the sidebar
   - Click "Create a project"

2. **Connect to Git**
   - Select "Connect to Git"
   - Choose "GitHub"
   - Authorize Cloudflare to access your GitHub account
   - Select your repository: `ambassador-yir-2025`

3. **Configure Build Settings**
   ```
   Framework preset: React (Vite)
   Build command: cd ambassador-yir && npm install && npm run build
   Build output directory: ambassador-yir/dist
   Root directory: /
   ```

4. **Environment Variables** (Optional)
   - None needed for this project

5. **Deploy**
   - Click "Save and Deploy"
   - Wait 2-3 minutes for first deployment
   - You'll get a URL like: `ambassador-yir-2025.pages.dev`

### Step 3: Configure Custom Domain (Optional)

1. In Cloudflare Pages project settings
2. Click "Custom domains"
3. Add your domain (e.g., `review.11six24.com`)
4. Cloudflare will auto-configure DNS

### Step 4: Generate Ambassador Links

After deployment:

```bash
# Update generate-links.js with your domain
# Change: const baseUrl = 'https://ambassador-yir-2025.pages.dev';

node generate-links.js
```

This creates `ambassador-links.csv` with personalized links for all ambassadors.

## Automatic Deployments

Every time you push to the `main` branch, Cloudflare Pages will automatically:
1. Pull the latest code
2. Run the build
3. Deploy the new version

## Build Configuration for Cloudflare Pages

If you need to manually configure, here are the exact settings:

| Setting | Value |
|---------|-------|
| **Framework** | React (Vite) |
| **Build command** | `cd ambassador-yir && npm install && npm run build` |
| **Build output directory** | `ambassador-yir/dist` |
| **Root directory** | `/` |
| **Node version** | 18 or higher |
| **Environment variables** | None required |

## Alternative: Deploy from Nested Directory

If you want Cloudflare to build from the React app directly:

1. Move `ambassador-yir/` contents to root
2. Update build settings:
   ```
   Build command: npm install && npm run build
   Build output directory: dist
   ```

## Troubleshooting

**Build fails?**
- Check that build command includes `cd ambassador-yir`
- Verify Node version is 18+ in Cloudflare settings
- Check build logs for specific errors

**Data not loading?**
- Ensure `ambassador-data.json` and `email-lookup.json` are in `public/` folder
- Check browser console for 404 errors

**UUIDs return 404?**
- Cloudflare Pages automatically handles client-side routing for React apps
- Make sure `_redirects` file exists (optional, Vite handles this)

## Making Updates

To update the site:

```bash
# Make your changes
# Then commit and push

git add .
git commit -m "Update: description of changes"
git push origin main

# Cloudflare will auto-deploy in ~2 minutes
```

## Security Notes

- The repository is set to **Private** to protect ambassador data
- UUIDs provide security through obscurity
- No authentication required (by design)
- Ambassador data is served as static JSON

## Performance

Cloudflare Pages provides:
- Global CDN distribution
- Automatic HTTPS
- Edge caching
- Sub-100ms response times worldwide
- Unlimited bandwidth

Your site will load fast anywhere in the world! 🚀
