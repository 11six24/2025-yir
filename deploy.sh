#!/bin/bash

echo "🚀 Ambassador Year in Review - Deployment Script"
echo "================================================"
echo ""

# Navigate to the React app directory
cd ambassador-yir/ambassador-yir

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🏗️  Building production bundle..."
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "📤 Choose deployment method:"
echo "  1. Upload dist/ folder manually to Cloudflare Pages Dashboard"
echo "     → https://dash.cloudflare.com → Pages → Create Project → Direct Upload"
echo ""
echo "  2. Deploy with Wrangler CLI:"
echo "     → Run: wrangler pages deploy dist --project-name=ambassador-yir-2025"
echo ""
echo "📊 Build output location: ambassador-yir/ambassador-yir/dist/"
echo ""
echo "🔗 After deployment, update generate-links.js with your domain"
echo "   Then run: node generate-links.js"
echo ""
