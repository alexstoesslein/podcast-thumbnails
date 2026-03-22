# Podcast Thumbnail Creator - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static client-side web app that generates Instagram Story thumbnails (1080x1920) for podcast episodes, with configurable templates per podcast.

**Architecture:** Single HTML page with vanilla JS. Canvas API renders the thumbnail in real-time as the user adjusts controls. Config-driven podcast templates allow adding new podcasts by editing one JS file and dropping assets into a folder.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Canvas API. No build tools, no frameworks. Hosted on GitHub Pages.

---

### Task 1: Project Scaffold + Git Init

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/config.js`
- Create: `js/canvas.js`
- Create: `js/app.js`
- Create: `assets/fonts/.gitkeep`
- Create: `assets/hotel-matze/.gitkeep`
- Create: `assets/50-ueber-50/.gitkeep`

**Step 1: Initialize git repo**

```bash
cd /Users/goodguys/Desktop/podcast-thumbnails
git init
```

**Step 2: Create index.html with basic structure**

```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Podcast Thumbnail Creator</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="app">
        <div class="preview-panel">
            <canvas id="thumbnail-canvas" width="1080" height="1920"></canvas>
        </div>
        <div class="controls-panel">
            <!-- Controls will be added in subsequent tasks -->
        </div>
    </div>
    <script src="js/config.js"></script>
    <script src="js/canvas.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

**Step 3: Create minimal CSS**

```css
/* css/style.css */
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #1a1a1a;
    color: #e0e0e0;
    min-height: 100vh;
}

.app {
    display: flex;
    height: 100vh;
}

.preview-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: #111;
}

.preview-panel canvas {
    max-height: 90vh;
    max-width: 100%;
    border: 1px solid #333;
}

.controls-panel {
    width: 360px;
    padding: 20px;
    overflow-y: auto;
    border-left: 1px solid #333;
}
```

**Step 4: Create empty JS files with module structure**

`js/config.js`:
```js
const PODCAST_CONFIGS = [];
```

`js/canvas.js`:
```js
const ThumbnailRenderer = {
    canvas: null,
    ctx: null,
    init(canvasEl) {
        this.canvas = canvasEl;
        this.ctx = canvasEl.getContext('2d');
    },
    render(state) {
        // will be implemented in Task 3
    }
};
```

`js/app.js`:
```js
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('thumbnail-canvas');
    ThumbnailRenderer.init(canvas);
});
```

**Step 5: Create .gitkeep files for asset directories**

```bash
touch assets/fonts/.gitkeep assets/hotel-matze/.gitkeep assets/50-ueber-50/.gitkeep
```

**Step 6: Open in browser and verify blank canvas appears**

Open `index.html` in browser. Should see dark background with an empty canvas rectangle on the left and an empty controls panel on the right.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: project scaffold with HTML, CSS, JS structure"
```

---

### Task 2: Podcast Config System

**Files:**
- Modify: `js/config.js`

**Step 1: Define the config structure with two podcast templates**

```js
const PODCAST_CONFIGS = [
    {
        id: 'hotel-matze',
        name: 'Hotel Matze',
        logo: 'assets/hotel-matze/logo.png',
        bar: 'assets/hotel-matze/bar.png',
        font: 'HotelMatzeFont',
        textColor: '#FFFFFF',
        barTextColor: '#000000',
        defaults: {
            bg: { x: 0, y: 0, zoom: 100 },
            text: { y: 50, fontSize: 80 },
            bar: { padding: 40 },
            logo: { y: 88, scale: 100 }
        }
    },
    {
        id: '50-ueber-50',
        name: '50 über 50',
        logo: 'assets/50-ueber-50/logo.png',
        bar: 'assets/50-ueber-50/bar.png',
        font: '50ueber50Font',
        textColor: '#E30613',
        barTextColor: '#E30613',
        defaults: {
            bg: { x: 0, y: 0, zoom: 100 },
            text: { y: 50, fontSize: 70 },
            bar: { padding: 50 },
            logo: { y: 88, scale: 100 }
        }
    }
];

function getConfig(podcastId) {
    return PODCAST_CONFIGS.find(c => c.id === podcastId) || PODCAST_CONFIGS[0];
}
```

**Step 2: Verify config loads**

Add to `app.js` temporarily:
```js
console.log('Configs loaded:', PODCAST_CONFIGS.length, PODCAST_CONFIGS.map(c => c.name));
```

Open browser console, verify output shows both podcast names.

**Step 3: Remove debug log and commit**

```bash
git add js/config.js
git commit -m "feat: podcast config system with Hotel Matze and 50 über 50 templates"
```

---

### Task 3: Canvas Rendering Pipeline

**Files:**
- Modify: `js/canvas.js`

**Step 1: Implement the full rendering pipeline**

The `state` object that `render()` receives will have this shape:

```js
// State shape (built by app.js from UI controls):
// {
//   config: { ...podcast config },
//   bgImage: Image | null,
//   barImage: Image | null,
//   logoImage: Image | null,
//   textLine1: '',       // upper line (no bar)
//   textLine2: '',       // lower line (in bar)
//   singleLine: false,   // if true, only textLine2 is shown
//   bg: { x, y, zoom },
//   text: { y, fontSize },
//   bar: { padding },
//   logo: { y, scale }
// }
```

```js
const ThumbnailRenderer = {
    W: 1080,
    H: 1920,
    canvas: null,
    ctx: null,

    init(canvasEl) {
        this.canvas = canvasEl;
        this.ctx = canvasEl.getContext('2d');
    },

    render(state) {
        const ctx = this.ctx;
        const W = this.W;
        const H = this.H;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);

        this._drawBackground(ctx, state, W, H);
        this._drawBarAndText(ctx, state, W, H);
        this._drawLogo(ctx, state, W, H);
    },

    _drawBackground(ctx, state, W, H) {
        if (!state.bgImage) return;
        const img = state.bgImage;
        const zoom = (state.bg.zoom || 100) / 100;

        // Cover-fit: scale image to cover canvas, then apply zoom and offset
        const imgRatio = img.width / img.height;
        const canvasRatio = W / H;
        let drawW, drawH;
        if (imgRatio > canvasRatio) {
            drawH = H * zoom;
            drawW = drawH * imgRatio;
        } else {
            drawW = W * zoom;
            drawH = drawW / imgRatio;
        }

        const offsetX = (W - drawW) / 2 + (state.bg.x || 0);
        const offsetY = (H - drawH) / 2 + (state.bg.y || 0);
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    },

    _drawBarAndText(ctx, state, W, H) {
        const config = state.config;
        const fontSize = state.text.fontSize || 72;
        const fontFamily = config.font || 'sans-serif';
        ctx.font = `bold ${fontSize}px ${fontFamily}, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const line2 = (state.textLine2 || '').toUpperCase();
        const line1 = state.singleLine ? '' : (state.textLine1 || '').toUpperCase();

        // Measure text for bar width
        const textWidth = ctx.measureText(line2).width;
        const barPadding = state.bar.padding || 40;
        const barWidth = textWidth + barPadding * 2;

        // Y position (percentage of canvas height)
        const textYPct = state.text.y || 50;
        const barCenterY = H * (textYPct / 100);

        // Draw bar PNG behind lower text
        if (state.barImage && line2) {
            const barImg = state.barImage;
            const barH = fontSize * 1.5;
            const barX = (W - barWidth) / 2;
            const barY = barCenterY - barH / 2;
            ctx.drawImage(barImg, barX, barY, barWidth, barH);
        }

        // Draw lower text (inside bar)
        if (line2) {
            ctx.fillStyle = config.barTextColor || '#000';
            ctx.fillText(line2, W / 2, barCenterY);
        }

        // Draw upper text (above bar)
        if (line1) {
            const lineSpacing = fontSize * 1.4;
            ctx.fillStyle = config.textColor || '#FFF';
            ctx.fillText(line1, W / 2, barCenterY - lineSpacing);
        }
    },

    _drawLogo(ctx, state, W, H) {
        if (!state.logoImage) return;
        const logo = state.logoImage;
        const scale = (state.logo.scale || 100) / 100;
        const logoW = logo.width * scale;
        const logoH = logo.height * scale;
        const yPct = state.logo.y || 88;
        const logoX = (W - logoW) / 2;
        const logoY = H * (yPct / 100) - logoH / 2;
        ctx.drawImage(logo, logoX, logoY, logoW, logoH);
    }
};
```

**Step 2: Test with a colored rectangle as fake background**

In `app.js`, create a test render:
```js
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('thumbnail-canvas');
    ThumbnailRenderer.init(canvas);

    // Test render with no images
    ThumbnailRenderer.render({
        config: PODCAST_CONFIGS[0],
        bgImage: null, barImage: null, logoImage: null,
        textLine1: 'RAUS AUS', textLine2: 'DEM LOCH',
        singleLine: false,
        bg: { x: 0, y: 0, zoom: 100 },
        text: { y: 50, fontSize: 80 },
        bar: { padding: 40 },
        logo: { y: 88, scale: 100 }
    });
});
```

Open in browser. Should see white text "RAUS AUS" and "DEM LOCH" on black background. No bar or logo since no images loaded.

**Step 3: Commit**

```bash
git add js/canvas.js js/app.js
git commit -m "feat: canvas rendering pipeline with background, bar, text, and logo layers"
```

---

### Task 4: Controls Panel UI

**Files:**
- Modify: `index.html` (controls panel markup)
- Modify: `css/style.css` (control styling)

**Step 1: Add controls HTML inside `.controls-panel`**

```html
<div class="controls-panel">
    <h2>Thumbnail Creator</h2>

    <!-- Podcast Selector -->
    <section class="control-section">
        <label>Podcast</label>
        <select id="podcast-select"></select>
    </section>

    <!-- Image Upload -->
    <section class="control-section">
        <label>Hintergrundbild</label>
        <div class="upload-zone" id="upload-zone">
            <p>Bild hierher ziehen oder klicken</p>
            <input type="file" id="bg-upload" accept="image/*" hidden>
        </div>
    </section>

    <!-- Text Input -->
    <section class="control-section">
        <label>
            <input type="checkbox" id="single-line"> Nur 1 Zeile
        </label>
        <div id="line1-group">
            <label>Obere Zeile</label>
            <input type="text" id="text-line1" placeholder="RAUS AUS">
        </div>
        <div>
            <label>Zeile im Balken</label>
            <input type="text" id="text-line2" placeholder="DEM LOCH">
        </div>
    </section>

    <!-- Background Position -->
    <section class="control-section">
        <label>Hintergrund</label>
        <div class="slider-row">
            <span>X</span>
            <input type="range" id="bg-x" min="-500" max="500" value="0">
            <input type="number" id="bg-x-num" value="0">
        </div>
        <div class="slider-row">
            <span>Y</span>
            <input type="range" id="bg-y" min="-500" max="500" value="0">
            <input type="number" id="bg-y-num" value="0">
        </div>
        <div class="slider-row">
            <span>Zoom</span>
            <input type="range" id="bg-zoom" min="50" max="200" value="100">
            <input type="number" id="bg-zoom-num" value="100">
        </div>
    </section>

    <!-- Text Position -->
    <section class="control-section">
        <label>Text</label>
        <div class="slider-row">
            <span>Y-Pos</span>
            <input type="range" id="text-y" min="10" max="90" value="50">
            <input type="number" id="text-y-num" value="50">
        </div>
        <div class="slider-row">
            <span>Groesse</span>
            <input type="range" id="text-size" min="30" max="150" value="80">
            <input type="number" id="text-size-num" value="80">
        </div>
    </section>

    <!-- Logo Position -->
    <section class="control-section">
        <label>Logo</label>
        <div class="slider-row">
            <span>Y-Pos</span>
            <input type="range" id="logo-y" min="50" max="98" value="88">
            <input type="number" id="logo-y-num" value="88">
        </div>
        <div class="slider-row">
            <span>Groesse</span>
            <input type="range" id="logo-scale" min="20" max="200" value="100">
            <input type="number" id="logo-scale-num" value="100">
        </div>
    </section>

    <!-- Export -->
    <section class="control-section">
        <button id="export-btn" class="export-btn">PNG exportieren</button>
    </section>
</div>
```

**Step 2: Add control styles to CSS**

```css
/* Add to css/style.css */

.controls-panel h2 {
    margin-bottom: 20px;
    font-size: 20px;
}

.control-section {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #333;
}

.control-section > label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #aaa;
}

select, input[type="text"] {
    width: 100%;
    padding: 8px 10px;
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: 4px;
    color: #e0e0e0;
    font-size: 14px;
    margin-bottom: 8px;
}

.upload-zone {
    border: 2px dashed #555;
    border-radius: 8px;
    padding: 30px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s;
}

.upload-zone:hover, .upload-zone.dragover {
    border-color: #888;
}

.upload-zone p {
    color: #888;
    font-size: 14px;
}

.slider-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
}

.slider-row span {
    width: 50px;
    font-size: 12px;
    color: #888;
}

.slider-row input[type="range"] {
    flex: 1;
}

.slider-row input[type="number"] {
    width: 60px;
    padding: 4px 6px;
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: 4px;
    color: #e0e0e0;
    font-size: 12px;
    text-align: center;
}

input[type="checkbox"] {
    margin-right: 6px;
}

.export-btn {
    width: 100%;
    padding: 12px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.export-btn:hover {
    background: #1d4ed8;
}
```

**Step 3: Open in browser, verify controls panel renders**

Should see the full controls panel on the right with all sections.

**Step 4: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: controls panel UI with all inputs, sliders, and export button"
```

---

### Task 5: App Logic - Wire Controls to Canvas

**Files:**
- Modify: `js/app.js`

**Step 1: Implement full app.js with state management and event wiring**

```js
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('thumbnail-canvas');
    ThumbnailRenderer.init(canvas);

    // App state
    const state = {
        config: PODCAST_CONFIGS[0],
        bgImage: null,
        barImage: null,
        logoImage: null,
        textLine1: '',
        textLine2: '',
        singleLine: false,
        bg: { x: 0, y: 0, zoom: 100 },
        text: { y: 50, fontSize: 80 },
        bar: { padding: 40 },
        logo: { y: 88, scale: 100 }
    };

    // --- Helpers ---
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    function render() {
        ThumbnailRenderer.render(state);
    }

    function syncSlider(sliderId, numId) {
        const slider = document.getElementById(sliderId);
        const num = document.getElementById(numId);
        slider.addEventListener('input', () => { num.value = slider.value; });
        num.addEventListener('input', () => { slider.value = num.value; });
    }

    // --- Podcast Selector ---
    const podcastSelect = document.getElementById('podcast-select');
    PODCAST_CONFIGS.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        podcastSelect.appendChild(opt);
    });

    async function loadPodcast(configId) {
        state.config = getConfig(configId);
        const defaults = state.config.defaults;
        Object.assign(state.bg, defaults.bg);
        Object.assign(state.text, defaults.text);
        Object.assign(state.bar, defaults.bar);
        Object.assign(state.logo, defaults.logo);

        // Update slider values to match defaults
        setSliderValue('bg-x', defaults.bg.x);
        setSliderValue('bg-y', defaults.bg.y);
        setSliderValue('bg-zoom', defaults.bg.zoom);
        setSliderValue('text-y', defaults.text.y);
        setSliderValue('text-size', defaults.text.fontSize);
        setSliderValue('logo-y', defaults.logo.y);
        setSliderValue('logo-scale', defaults.logo.scale);

        // Load bar and logo images
        try {
            state.barImage = await loadImage(state.config.bar);
        } catch (e) {
            state.barImage = null;
        }
        try {
            state.logoImage = await loadImage(state.config.logo);
        } catch (e) {
            state.logoImage = null;
        }
        render();
    }

    function setSliderValue(baseId, value) {
        const slider = document.getElementById(baseId);
        const num = document.getElementById(baseId + '-num');
        if (slider) slider.value = value;
        if (num) num.value = value;
    }

    podcastSelect.addEventListener('change', (e) => loadPodcast(e.target.value));

    // --- Image Upload ---
    const uploadZone = document.getElementById('upload-zone');
    const bgUpload = document.getElementById('bg-upload');

    uploadZone.addEventListener('click', () => bgUpload.click());
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    bgUpload.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                state.bgImage = img;
                uploadZone.querySelector('p').textContent = file.name;
                render();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // --- Text Inputs ---
    document.getElementById('text-line1').addEventListener('input', (e) => {
        state.textLine1 = e.target.value;
        render();
    });
    document.getElementById('text-line2').addEventListener('input', (e) => {
        state.textLine2 = e.target.value;
        render();
    });
    document.getElementById('single-line').addEventListener('change', (e) => {
        state.singleLine = e.target.checked;
        document.getElementById('line1-group').style.display = e.target.checked ? 'none' : 'block';
        render();
    });

    // --- Slider Wiring ---
    function wireSlider(sliderId, stateObj, stateKey) {
        const slider = document.getElementById(sliderId);
        const num = document.getElementById(sliderId + '-num');
        const handler = () => {
            const val = parseFloat(slider.value);
            num.value = val;
            stateObj[stateKey] = val;
            render();
        };
        const numHandler = () => {
            const val = parseFloat(num.value);
            slider.value = val;
            stateObj[stateKey] = val;
            render();
        };
        slider.addEventListener('input', handler);
        num.addEventListener('input', numHandler);
    }

    wireSlider('bg-x', state.bg, 'x');
    wireSlider('bg-y', state.bg, 'y');
    wireSlider('bg-zoom', state.bg, 'zoom');
    wireSlider('text-y', state.text, 'y');
    wireSlider('text-size', state.text, 'fontSize');
    wireSlider('logo-y', state.logo, 'y');
    wireSlider('logo-scale', state.logo, 'scale');

    // --- Export ---
    document.getElementById('export-btn').addEventListener('click', () => {
        const allText = [state.textLine1, state.textLine2].filter(Boolean).join(' ');
        const filename = allText
            ? allText.toLowerCase().replace(/[^a-z0-9äöüß]+/g, '_').replace(/^_|_$/g, '') + '.png'
            : 'thumbnail.png';

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    });

    // --- Initial Load ---
    loadPodcast(PODCAST_CONFIGS[0].id);
});
```

**Step 2: Test in browser**

1. Select a podcast from dropdown
2. Type text in both lines - canvas should update in real-time
3. Toggle "Nur 1 Zeile" - upper line should hide
4. Move sliders - canvas should update
5. Upload an image - should appear as background
6. Click export - should download a PNG named after the text

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: wire all controls to canvas with live preview and PNG export"
```

---

### Task 6: Font Loading

**Files:**
- Modify: `css/style.css` (add @font-face declarations)
- Modify: `js/canvas.js` (ensure fonts are loaded before rendering)

**Step 1: Add @font-face rules**

The user needs to provide the actual font files. Add placeholder @font-face rules:

```css
/* Add at top of css/style.css */
@font-face {
    font-family: 'HotelMatzeFont';
    src: url('../assets/fonts/hotel-matze-font.woff2') format('woff2');
    font-weight: bold;
    font-style: normal;
}

@font-face {
    font-family: '50ueber50Font';
    src: url('../assets/fonts/50-ueber-50-font.woff2') format('woff2');
    font-weight: bold;
    font-style: normal;
}
```

**Step 2: Add font preload in canvas.js**

Add a method to ensure fonts are loaded:

```js
// Add to ThumbnailRenderer object, before render():
async ensureFontsLoaded() {
    if (document.fonts) {
        await document.fonts.ready;
    }
},
```

Call it in `app.js` during `loadPodcast()`:

```js
await ThumbnailRenderer.ensureFontsLoaded();
```

**Step 3: Commit**

```bash
git add css/style.css js/canvas.js js/app.js
git commit -m "feat: font loading support with @font-face declarations"
```

---

### Task 7: Final Polish + README

**Files:**
- Create: `README.md`
- Modify: `css/style.css` (responsive tweaks, upload zone feedback)

**Step 1: Write README**

```markdown
# Podcast Thumbnail Creator

Static web app for creating Instagram Story thumbnails (1080x1920) for podcast episodes.

## Usage

1. Open `index.html` in a browser (or visit the GitHub Pages URL)
2. Select a podcast template
3. Upload a background screenshot
4. Enter text (1 or 2 lines)
5. Adjust positions with sliders
6. Click "PNG exportieren"

## Adding a New Podcast

1. Add assets to `assets/<podcast-id>/` (logo.png, bar.png)
2. Add a config object to `js/config.js`
3. Add font files to `assets/fonts/` and @font-face rule to `css/style.css`

## Hosting

Deploy to GitHub Pages: push to `main`, enable Pages in repo settings for root `/`.
```

**Step 2: Add upload zone visual feedback**

```css
.upload-zone.has-image {
    border-color: #2563eb;
    border-style: solid;
}

.upload-zone.has-image p {
    color: #2563eb;
}
```

Add `has-image` class in `app.js` `handleFile()` after setting bgImage:
```js
uploadZone.classList.add('has-image');
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: README and upload zone visual feedback"
```

---

## Asset Checklist (User Action Required)

Before the app is fully functional, the user needs to provide:

- [ ] `assets/hotel-matze/logo.png` — Hotel Matze logo
- [ ] `assets/hotel-matze/bar.png` — Yellow highlight bar
- [ ] `assets/50-ueber-50/logo.png` — 50 über 50 logo
- [ ] `assets/50-ueber-50/bar.png` — White pill bar
- [ ] `assets/fonts/hotel-matze-font.woff2` — Font for Hotel Matze
- [ ] `assets/fonts/50-ueber-50-font.woff2` — Font for 50 über 50
- [ ] Update font-family names in `config.js` and `style.css` to match actual font names
