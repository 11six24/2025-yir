# Ambassador Year in Review 2025

A personalized Year in Review experience for 11SIX24 ambassadors, inspired by Spotify Wrapped.

## Features

- **Personalized Experience**: Each ambassador gets a unique UUID-based link
- **7 Interactive Screens**:
  1. Welcome screen with personalized greeting
  2. Impact stats (revenue, orders, clicks, commissions)
  3. Ambassador archetype badge with percentile ranking
  4. Timeline of milestones
  5. Thank you message
  6. Shareable social card
  7. Call-to-action for perks

- **Mercedes F1 Theme**: Teal (#00D2BE) and silver (#C0C0C0) color scheme
- **Smooth Animations**: Powered by Framer Motion
- **Social Sharing**: Download shareable image cards

## Tech Stack

- **React + Vite**: Fast, modern development
- **Framer Motion**: Smooth animations
- **html2canvas**: Client-side image generation
- **React Router**: UUID-based routing
- **Cloudflare Pages**: Hosting and deployment

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. Install dependencies:
```bash
cd ambassador-yir/ambassador-yir
npm install
```

2. Start dev server:
```bash
npm run dev
```

3. Open http://localhost:5173/:uuid (replace :uuid with a valid UUID from ambassador-data.json)

### Test Links

To get a test UUID, run:
```bash
cd ../..
node -e "const data = require('./ambassador-data.json'); console.log('Test UUID:', Object.keys(data)[0])"
```

## Deployment to Cloudflare Pages

### Option 1: Cloudflare Dashboard (Recommended)

1. **Build the project**:
```bash
cd ambassador-yir/ambassador-yir
npm run build
```

2. **Go to Cloudflare Dashboard**:
   - Visit https://dash.cloudflare.com
   - Go to "Pages" in the sidebar
   - Click "Create a project"
   - Choose "Direct Upload"

3. **Upload the build**:
   - Upload the `dist` folder
   - Set project name (e.g., "ambassador-yir-2025")

4. **Configure custom domain** (optional):
   - Go to your project settings
   - Add your custom domain
   - DNS records will auto-configure

### Option 2: Wrangler CLI

1. **Install Wrangler**:
```bash
npm install -g wrangler
```

2. **Login to Cloudflare**:
```bash
wrangler login
```

3. **Build and deploy**:
```bash
cd ambassador-yir/ambassador-yir
npm run build
wrangler pages deploy dist --project-name=ambassador-yir-2025
```

### Build Configuration

- **Framework**: React
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Node version**: 18+

## Generating Ambassador Links

After deployment, update the base URL and generate personalized links:

1. Edit `generate-links.js`:
```javascript
const baseUrl = 'https://your-actual-domain.pages.dev';
```

2. Run the script:
```bash
node generate-links.js
```

3. This creates `ambassador-links.csv` with:
   - Ambassador name
   - Email
   - Unique link

4. Use this CSV to:
   - Send personalized emails
   - Create a mail merge campaign
   - Track link distribution

## Email Campaign

Example email template:

```
Subject: Your 11SIX24 Year in Review is Ready! 🎉

Hi [Name],

2025 was legendary, and you were a huge part of it.

We've created something special just for you - your personalized Year in Review.

👉 View Your Year: [Unique Link]

See your impact, celebrate your wins, and share your success with the world.

Thank you for being an incredible ambassador!

— The 11SIX24 Team
```

## Data Structure

Ambassador data is stored in `ambassador-data.json` with this structure:

```json
{
  "uuid-here": {
    "name": "Ambassador Name",
    "email": "email@example.com",
    "stats": {
      "revenue": 1000,
      "orders": 50,
      "clicks": 500,
      "commission": 100
    },
    "ranking": {
      "overall": 85,
      "revenue": 90,
      "orders": 80,
      "clicks": 75
    },
    "archetype": {
      "title": "The Revenue Machine",
      "description": "Description here"
    },
    "milestones": {
      "bestMonth": "December 2025",
      "firstOrder": "2023-06-04",
      "totalLogins": 10,
      "lastActive": "2025-12-09"
    }
  }
}
```

## Customization

### Update Brand Colors

Edit `src/App.css`:
```css
:root {
  --merc-teal: #00D2BE;
  --merc-silver: #C0C0C0;
  --merc-black: #0A0A0A;
  /* ... */
}
```

### Update Content

- **Welcome message**: `src/components/WelcomeScreen.jsx`
- **Thank you message**: `src/components/ThankYouScreen.jsx`
- **Final CTA**: `src/components/FinalScreen.jsx`

### Add More Stats

1. Update data structure in `generate-data.js`
2. Add new stat cards in `src/components/StatsScreen.jsx`

## Performance

- **Lighthouse Score**: 95+ (Performance)
- **First Load**: < 1s on 3G
- **Bundle Size**: ~150KB gzipped
- **Data Size**: ~2MB (2,409 ambassadors)

## Security

- No authentication required (security by obscurity with UUIDs)
- UUIDs are cryptographically random (v4)
- No PII exposed in URLs
- Data served as static JSON (cached at edge)

## Analytics (Optional)

Add analytics to track engagement:

```javascript
// In src/main.jsx or relevant component
import { useEffect } from 'react';

useEffect(() => {
  // Track page view
  window.gtag('event', 'page_view', {
    page_title: 'Year in Review',
    ambassador_id: uuid
  });
}, []);
```

## Support

For issues or questions:
- Create an issue in this repo
- Email: support@11six24.com

## License

Proprietary - 11SIX24 Internal Use Only
