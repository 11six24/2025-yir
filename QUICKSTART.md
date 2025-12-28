# Quick Start Guide

## 🎯 What You Have

A fully functional Year in Review site with:
- ✅ 2,409 ambassador profiles with unique UUIDs
- ✅ Mercedes F1 themed design (teal + silver)
- ✅ 7 interactive screens with smooth animations
- ✅ Social sharing with downloadable images
- ✅ Ready for Cloudflare Pages deployment

## 🚀 Test Locally (Right Now)

**Your dev server is running!**

Open this URL in your browser:
```
http://localhost:5173/54537609-4b5d-44b9-8aeb-c755f0ed07c8
```

This is YOUR Year in Review (David Groechel).

### Try Other Ambassadors

Get a random UUID:
```bash
node -e "const data = require('./ambassador-data.json'); const uuids = Object.keys(data); const random = uuids[Math.floor(Math.random() * uuids.length)]; console.log('http://localhost:5173/' + random);"
```

## 📤 Deploy to Cloudflare (5 Minutes)

### Option 1: Dashboard Upload (Easiest)

1. **Build the project**:
```bash
./deploy.sh
```

2. **Go to Cloudflare Dashboard**:
   - Visit https://dash.cloudflare.com
   - Click "Pages" → "Create a project" → "Upload assets"

3. **Upload**:
   - Drag the `ambassador-yir/ambassador-yir/dist` folder
   - Project name: `ambassador-yir-2025`
   - Click "Deploy"

4. **Done!** You'll get a URL like: `ambassador-yir-2025.pages.dev`

### Option 2: Wrangler CLI (Fastest)

```bash
# Install Wrangler (one-time)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build and deploy
./deploy.sh
cd ambassador-yir/ambassador-yir
wrangler pages deploy dist --project-name=ambassador-yir-2025
```

## 📧 Send Links to Ambassadors

1. **Update domain** in `generate-links.js`:
```javascript
const baseUrl = 'https://ambassador-yir-2025.pages.dev';
```

2. **Generate CSV**:
```bash
node generate-links.js
```

3. **Use the CSV** (`ambassador-links.csv`):
   - Import to your email tool (Mailchimp, SendGrid, etc.)
   - Each ambassador gets their unique link
   - Suggested subject: "Your 11SIX24 Year in Review is Ready! 🎉"

## 🎨 Customize Content

### Update Thank You Message
Edit: `ambassador-yir/ambassador-yir/src/components/ThankYouScreen.jsx`

### Change Colors
Edit: `ambassador-yir/ambassador-yir/src/App.css`
```css
:root {
  --merc-teal: #00D2BE;    /* Change this */
  --merc-silver: #C0C0C0;  /* Change this */
}
```

### Update Final CTA Link
Edit: `ambassador-yir/ambassador-yir/src/components/FinalScreen.jsx`
```jsx
<a href="https://11six24.com" ...>  {/* Change URL */}
```

## 📊 Key Files

| File | Purpose |
|------|---------|
| `ambassador-data.json` | All ambassador data (2,409 profiles) |
| `email-lookup.json` | Email → UUID mapping |
| `ambassador-links.csv` | Generated personalized links |
| `ambassador-yir/ambassador-yir/dist/` | Production build (after `npm run build`) |

## 🔥 Pro Tips

1. **Custom Domain**: In Cloudflare Pages settings, add your domain (e.g., `review.11six24.com`)

2. **Analytics**: Add Google Analytics or Cloudflare Analytics to track:
   - How many ambassadors view their page
   - Share button clicks
   - Time spent on each screen

3. **A/B Testing**: Create multiple versions by changing archetype titles or thank you messages

4. **Social Proof**: Share top ambassador screenshots on your IG/FB to drive excitement

## ❓ Troubleshooting

**Dev server not showing data?**
- Check the UUID in the URL is valid
- Open browser console (F12) for errors

**Build fails?**
- Run `npm install` in `ambassador-yir/ambassador-yir/`
- Check Node version: `node -v` (should be 18+)

**UUIDs not working on deployment?**
- Make sure `ambassador-data.json` is in the `public/` folder
- Check Cloudflare Pages build output includes JSON files

## 📞 Need Help?

Check `README.md` for full documentation or create an issue.

**Estimated Time to Launch**: 15-30 minutes total! 🚀
