document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('thumbnail-canvas');
    ThumbnailRenderer.init(canvas);

    const state = {
        config: PODCAST_CONFIGS[0],
        bgImage: null,
        barImage: null,
        logoImage: null,
        overlayImage: null,
        showOverlay: true,
        textLine1: '',
        textLine2: '',
        singleLine: false,
        bg: { x: 0, y: 0, zoom: 100 },
        text: { y: 50, fontSize: 80 },
        bar: { padding: 40 }
    };

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

        setSliderValue('bg-x', defaults.bg.x);
        setSliderValue('bg-y', defaults.bg.y);
        setSliderValue('bg-zoom', defaults.bg.zoom);
        setSliderValue('text-y', defaults.text.y);
        setSliderValue('text-size', defaults.text.fontSize);

        if (state.config.barSrc) {
            try { state.barImage = await loadImage(state.config.barSrc); }
            catch (e) { state.barImage = null; }
        } else {
            state.barImage = null;
        }
        try { state.logoImage = await loadImage(state.config.logoSrc); }
        catch (e) { state.logoImage = null; }

        await ThumbnailRenderer.ensureFontsLoaded();
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
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
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
                uploadZone.classList.add('has-image');
                render();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // --- Auto-Position ---
    const FACE_MODEL_URL = 'models';
    let faceModelLoaded = false;

    document.getElementById('auto-position-btn').addEventListener('click', async () => {
        if (!state.bgImage) { alert('Bitte zuerst ein Hintergrundbild laden.'); return; }
        const btn = document.getElementById('auto-position-btn');
        btn.textContent = 'Lade Modell…';
        btn.disabled = true;
        try {
            if (!faceModelLoaded) {
                await faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODEL_URL);
                faceModelLoaded = true;
            }
            btn.textContent = 'Erkenne Gesicht…';
            const detections = await faceapi.detectAllFaces(state.bgImage, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 }));
            if (detections.length === 0) { alert('Kein Gesicht erkannt.'); return; }

            const face = detections[0].box;
            const { x: fx, y: fy, width: fw, height: fh } = face;
            const faceCX = fx + fw / 2;
            const faceCY = fy + fh / 2;

            const W = ThumbnailRenderer.W, H = ThumbnailRenderer.H;
            const imgW = state.bgImage.width, imgH = state.bgImage.height;
            const imgRatio = imgW / imgH;
            const canvasRatio = W / H;

            // Overlay frame (must match canvas.js values)
            const rx = Math.round(W * 0.14);
            const ry = Math.round(H * 0.05);
            const rw = Math.round(W * 0.72);
            const rh = Math.round(H * 0.50);
            const frameCX = rx + rw / 2;
            const frameCY = ry + rh / 2;

            // Size face to 75% of frame height
            const targetFaceH = rh * 0.75;
            const scalePixel = targetFaceH / fh;

            // Calculate zoom
            let zoom;
            if (imgRatio > canvasRatio) {
                zoom = (scalePixel * imgH / H) * 100;
            } else {
                zoom = (scalePixel * imgW / W) * 100;
            }

            // Calculate drawH/drawW at this zoom
            let drawH, drawW;
            if (imgRatio > canvasRatio) {
                drawH = H * zoom / 100;
                drawW = drawH * imgRatio;
            } else {
                drawW = W * zoom / 100;
                drawH = drawW / imgRatio;
            }

            // Offset to center face on frame
            const bgX = Math.round(frameCX - (W - drawW) / 2 - faceCX * (drawW / imgW));
            const bgY = Math.round(frameCY - (H - drawH) / 2 - faceCY * (drawH / imgH));

            state.bg.zoom = Math.round(zoom);
            state.bg.x = bgX;
            state.bg.y = bgY;
            setSliderValue('bg-zoom', state.bg.zoom);
            setSliderValue('bg-x', state.bg.x);
            setSliderValue('bg-y', state.bg.y);
            render();
        } catch (e) {
            alert('Fehler: ' + e.message);
        } finally {
            btn.textContent = 'Kopf auto-positionieren';
            btn.disabled = false;
        }
    });

    // --- Overlay ---
    const overlayZone = document.getElementById('overlay-zone');
    const overlayUpload = document.getElementById('overlay-upload');
    overlayZone.addEventListener('click', () => overlayUpload.click());
    overlayZone.addEventListener('dragover', (e) => { e.preventDefault(); overlayZone.classList.add('dragover'); });
    overlayZone.addEventListener('dragleave', () => overlayZone.classList.remove('dragover'));
    overlayZone.addEventListener('drop', (e) => {
        e.preventDefault();
        overlayZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleOverlayFile(e.dataTransfer.files[0]);
    });
    overlayUpload.addEventListener('change', (e) => {
        if (e.target.files.length) handleOverlayFile(e.target.files[0]);
    });
    function handleOverlayFile(file) {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                state.overlayImage = img;
                overlayZone.querySelector('p').textContent = file.name;
                render();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    document.getElementById('overlay-toggle').addEventListener('change', (e) => {
        state.showOverlay = e.target.checked;
        render();
    });

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
        slider.addEventListener('input', () => {
            const val = parseFloat(slider.value);
            num.value = val;
            stateObj[stateKey] = val;
            render();
        });
        num.addEventListener('input', () => {
            const val = parseFloat(num.value);
            slider.value = val;
            stateObj[stateKey] = val;
            render();
        });
    }

    wireSlider('bg-x', state.bg, 'x');
    wireSlider('bg-y', state.bg, 'y');
    wireSlider('bg-zoom', state.bg, 'zoom');
    wireSlider('text-y', state.text, 'y');
    wireSlider('text-size', state.text, 'fontSize');
    // --- Export ---
    document.getElementById('export-btn').addEventListener('click', () => {
        const allText = [state.textLine1, state.textLine2].filter(Boolean).join(' ');
        const filename = allText
            ? allText.toLowerCase().replace(/[^a-z0-9äöüß]+/g, '_').replace(/^_|_$/g, '') + '.png'
            : 'thumbnail.png';

        // Temporarily hide overlay for export
        const wasShowing = state.showOverlay;
        state.showOverlay = false;
        ThumbnailRenderer.render(state);

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            // Restore overlay
            state.showOverlay = wasShowing;
            ThumbnailRenderer.render(state);
        }, 'image/png');
    });

    // --- Initial Load ---
    loadPodcast(PODCAST_CONFIGS[0].id);
});
