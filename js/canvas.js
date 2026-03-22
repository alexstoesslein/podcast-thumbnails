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

        const metrics = ctx.measureText(line2);
        const textWidth = metrics.width;
        const barPadding = state.bar.padding || 40;
        const barWidth = textWidth + barPadding * 2;

        // Use actual glyph bounds for precise vertical centering of uppercase text
        const ascent = metrics.actualBoundingBoxAscent;
        const descent = metrics.actualBoundingBoxDescent;
        const textH = ascent + descent;

        const textYPct = state.text.y || 50;
        const barCenterY = H * (textYPct / 100);

        // Text baseline position so glyphs are visually centered at barCenterY
        const textBaselineY = barCenterY + textH / 2 - descent;

        // Draw bar — fixed height, width adapts to text
        if (line2) {
            if (config.barType === 'image' && state.barImage) {
                const barH = textH + fontSize * 0.65;
                const barX = (W - barWidth) / 2;
                const barY = barCenterY - barH / 2;
                ctx.drawImage(state.barImage, barX, barY, barWidth, barH);
            } else if (config.barType === 'roundedRect') {
                const barH = textH + fontSize * 0.6;
                const r = config.barRadius || 20;
                const barX = (W - barWidth) / 2;
                const barY = barCenterY - barH / 2;
                ctx.fillStyle = config.barColor || '#FFF';
                ctx.beginPath();
                ctx.roundRect(barX, barY, barWidth, barH, r);
                ctx.fill();
            }
        }

        // Draw bar text — precisely centered, no shadow
        if (line2) {
            ctx.fillStyle = config.barTextColor || '#000';
            ctx.fillText(line2, W / 2, textBaselineY);
        }

        // Draw upper line — position above bar, with text stroke
        if (line1) {
            const barH = line2 ? (textH + fontSize * 0.65) : 0;
            const lineGap = fontSize * 0.04;
            const line1Y = barCenterY - barH / 2 - lineGap;
            ctx.textBaseline = 'alphabetic';
            // Stroke outline
            ctx.lineWidth = fontSize * 0.12;
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#000000';
            ctx.strokeText(line1, W / 2, line1Y);
            // Fill
            ctx.fillStyle = config.textColor || '#FFF';
            ctx.fillText(line1, W / 2, line1Y);
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
