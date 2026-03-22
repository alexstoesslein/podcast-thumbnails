const ThumbnailRenderer = {
    W: 1080,
    H: 1920,
    canvas: null,
    ctx: null,

    init(canvasEl) {
        this.canvas = canvasEl;
        this.ctx = canvasEl.getContext('2d');
    },

    async ensureFontsLoaded() {
        if (document.fonts) {
            await document.fonts.ready;
        }
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
        ctx.textBaseline = 'alphabetic';

        const line2 = (state.textLine2 || '').toUpperCase();
        const line1 = state.singleLine ? '' : (state.textLine1 || '').toUpperCase();

        // Measure line1 and line2 separately
        const m1 = ctx.measureText(line1 || line2 || 'A');
        const m2 = ctx.measureText(line2 || 'A');
        const ascent1 = m1.actualBoundingBoxAscent;
        const descent1 = m1.actualBoundingBoxDescent;
        const ascent2 = m2.actualBoundingBoxAscent;
        const descent2 = m2.actualBoundingBoxDescent;
        const textH2 = ascent2 + descent2;

        // text.y always controls line1 baseline (or bar center if single line)
        const textYPct = state.text.y || 50;
        const line1BaselineY = H * (textYPct / 100);

        // Bar sits directly below line1 with tiny gap
        const lineGap = fontSize * 0.04;
        const barH = textH2 + fontSize * 0.65;
        const barTop = line1 ? line1BaselineY + descent1 + lineGap : line1BaselineY - barH / 2;
        const barCenterY = barTop + barH / 2;
        const textBaselineY = barCenterY + (ascent2 - descent2) / 2;

        // Draw bar
        const barPadding = state.bar.padding || 40;
        const barWidth = m2.width + barPadding * 2;

        if (line2) {
            if (config.barType === 'image' && state.barImage) {
                const barX = (W - barWidth) / 2;
                ctx.drawImage(state.barImage, barX, barTop, barWidth, barH);
            } else if (config.barType === 'roundedRect') {
                const r = config.barRadius || 20;
                const barX = (W - barWidth) / 2;
                ctx.fillStyle = config.barColor || '#FFF';
                ctx.beginPath();
                ctx.roundRect(barX, barTop, barWidth, barH, r);
                ctx.fill();
            }
        }

        // Draw bar text (line2) — centered in bar, no stroke
        if (line2) {
            ctx.fillStyle = config.barTextColor || '#000';
            ctx.fillText(line2, W / 2, textBaselineY);
        }

        // Draw line1 — at fixed text.y position, with stroke
        if (line1) {
            ctx.lineWidth = fontSize * 0.12;
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#000000';
            ctx.strokeText(line1, W / 2, line1BaselineY);
            ctx.fillStyle = config.textColor || '#FFF';
            ctx.fillText(line1, W / 2, line1BaselineY);
        }
    },

    _drawLogo(ctx, state, W, H) {
        if (!state.logoImage) return;
        const logo = state.logoImage;
        const logoConfig = state.config.logoPos || { y: 90, scale: 30 };
        const scale = (logoConfig.scale || 30) / 100;
        const logoW = logo.width * scale;
        const logoH = logo.height * scale;
        const yPct = logoConfig.y || 90;
        const logoX = (W - logoW) / 2;
        const logoY = H * (yPct / 100) - logoH / 2;
        ctx.drawImage(logo, logoX, logoY, logoW, logoH);
    }
};
