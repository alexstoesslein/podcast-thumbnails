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
        ctx.textBaseline = 'middle';

        const line2 = (state.textLine2 || '').toUpperCase();
        const line1 = state.singleLine ? '' : (state.textLine1 || '').toUpperCase();

        const textWidth = ctx.measureText(line2).width;
        const barPadding = state.bar.padding || 40;
        const barWidth = textWidth + barPadding * 2;

        const textYPct = state.text.y || 50;
        const barCenterY = H * (textYPct / 100);

        if (state.barImage && line2) {
            const barImg = state.barImage;
            const barH = fontSize * 1.5;
            const barX = (W - barWidth) / 2;
            const barY = barCenterY - barH / 2;
            ctx.drawImage(barImg, barX, barY, barWidth, barH);
        }

        if (line2) {
            ctx.fillStyle = config.barTextColor || '#000';
            ctx.fillText(line2, W / 2, barCenterY);
        }

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
