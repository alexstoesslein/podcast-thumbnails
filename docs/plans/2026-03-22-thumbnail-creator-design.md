# Podcast Thumbnail Creator - Design

## Overview

Static single-page app (HTML + CSS + vanilla JS) hosted on GitHub Pages. Uses Canvas API for rendering and PNG export. No server, no build tools, no framework.

## Output Format

Instagram Story: 1080x1920px, exported as PNG.

## Podcast Templates

Two initial templates, extendable via config:

- **Hotel Matze**: B&W background (uploaded pre-processed), yellow bar PNG behind text, white text above bar, logo at bottom.
- **50 über 50**: Color background, white pill-shape PNG behind text, red text, logo at bottom.

### Text Modes

- **1 line**: Only text inside the bar.
- **2 lines**: Upper line without bar + lower line inside bar.

## Architecture

```
podcast-thumbnails/
├── index.html
├── css/style.css
├── js/
│   ├── app.js          # UI logic, event handling
│   ├── canvas.js       # Canvas rendering pipeline
│   └── config.js       # Podcast template definitions
├── assets/
│   ├── fonts/          # WOFF2 fonts
│   ├── hotel-matze/
│   │   ├── logo.png
│   │   └── bar.png
│   └── 50-ueber-50/
│       ├── logo.png
│       └── bar.png
└── README.md
```

## Config Format (config.js)

Each podcast is an object:

```js
{
  id: "hotel-matze",
  name: "Hotel Matze",
  logo: "assets/hotel-matze/logo.png",
  bar: "assets/hotel-matze/bar.png",
  font: "OswaldBold",
  textColor: "#FFFFFF",
  barTextColor: "#000000",
  defaults: {
    logo: { x: 50, y: 85, scale: 100 },
    text: { x: 50, y: 55, fontSize: 72 },
    bar:  { x: 50, y: 65, scaleX: 100, scaleY: 100 }
  }
}
```

New podcast = new config object + assets in folder.

## UI Layout

**Left**: Preview canvas (scaled to fit screen, internally 1080x1920).

**Right**: Controls panel with sections:

1. **Podcast selector** — dropdown or buttons
2. **Image upload** — drag & drop zone or file picker
3. **Text input**
   - Checkbox: "Nur 1 Zeile" (toggles upper line visibility)
   - Input: Upper line (no bar behind it)
   - Input: Lower line (inside bar)
4. **Position controls** (sliders + number inputs):
   - Background image: X offset, Y offset, zoom/scale
   - Text block: Y position, font size
   - Logo: Y position, size
5. **Export button** — downloads PNG at 1080x1920

## Canvas Rendering Pipeline

Layer order (bottom to top):

1. Background image (cover-fit, positionable via offset + zoom)
2. Bar PNG (horizontally centered, width scaled to text length + padding)
3. Upper text line (if active) — centered above bar
4. Lower text line — centered inside bar
5. Logo PNG

Bar scaling: PNG stretched horizontally to match text width + configurable padding.

## Export

`canvas.toBlob('image/png')` → trigger download. Filename derived from the entered text (spaces replaced with underscores, lowercased, e.g. "RAUS AUS DEM LOCH" → `raus_aus_dem_loch.png`). No server needed.
