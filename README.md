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
