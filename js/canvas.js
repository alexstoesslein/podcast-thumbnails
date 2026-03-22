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

        // Bar center is controlled by text.y — line1 sits directly above it
        const barCenterY = H * ((state.text.y || 58) / 100);

        // --- Bar + Line 2 ---
        let barTop = barCenterY;
        if (line2) {
            const m2 = ctx.measureText(line2);
            const ascent2 = m2.actualBoundingBoxAscent;
            const descent2 = m2.actualBoundingBoxDescent;
            const textH2 = ascent2 + descent2;
            const barH = textH2 + fontSize * 0.65;
            const barPadding = state.bar.padding || 40;
            const barWidth = m2.width + barPadding * 2;
            barTop = barCenterY - barH / 2;
            const textBaselineY = barCenterY + (ascent2 - descent2) / 2;

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

            ctx.fillStyle = config.barTextColor || '#000';
            ctx.fillText(line2, W / 2, textBaselineY);
        }

        // --- Line 1: always directly above bar, fixed gap ---
        if (line1) {
            const LINE_GAP = 8;
            const m1 = ctx.measureText(line1);
            const descent1 = m1.actualBoundingBoxDescent;
            const line1Y = barTop - LINE_GAP - descent1;

            ctx.lineWidth = fontSize * 0.10;
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#000000';
            ctx.strokeText(line1, W / 2, line1Y);
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
