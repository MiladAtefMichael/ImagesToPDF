# MILO Converter — Image to PDF

Convert any images to a single PDF document, right in your browser. No uploads, no servers, no privacy concerns.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (opens on http://localhost:5173)
npm run dev

# Open in VS Code
code .
```

## Open in VS Code

```bash
cd /path/to/app
code .
```

Then press **F5** (or run the *Launch MILO Converter* debug config) to open Chrome with the dev server.

## Features

- **Drag-and-drop** upload — drop images anywhere on the page
- **Reorder** images by dragging cards or using ↑/↓ arrow buttons
- **One-click PDF** generation — all processing in the browser
- **Google AdSense** banner — replace `ADSENSE_CLIENT` and `ADSENSE_SLOT` in `src/components/AdBanner.tsx`

## Google AdSense Setup

1. Open `src/components/AdBanner.tsx`
2. Replace `ca-pub-XXXXXXXXXXXXXXXX` with your publisher ID
3. Replace `XXXXXXXXXX` with your ad slot ID
4. Deploy — AdSense serves ads automatically once approved

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS
- Framer Motion
- jsPDF (client-side PDF generation)
- Three.js / React Three Fiber (3D background)
