/**
 * Computes the greatest common divisor (GCD) of two numbers.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function calculateGcd(a, b) {
    let x = Math.abs(Math.round(a));
    let y = Math.abs(Math.round(b));
    while (y) {
        const temp = y;
        y = x % y;
        x = temp;
    }
    return x || 1;
}

/**
 * Calculates and formats the aspect ratio.
 * @param {number} width
 * @param {number} height
 * @returns {string}
 */
function calculateAspectRatio(width, height) {
    if (!width || !height) {
        return "-";
    }

    const ratio = width / height;
    const decimal = ratio.toFixed(2);

    const standardRatios = [
        { label: "16:9", value: 16 / 9 },
        { label: "16:10", value: 16 / 10 },
        { label: "4:3", value: 4 / 3 },
        { label: "21:9", value: 21 / 9 },
        { label: "32:9", value: 32 / 9 },
        { label: "3:2", value: 3 / 2 },
        { label: "1:1", value: 1 / 1 },
        { label: "9:16", value: 9 / 16 },
        { label: "10:16", value: 10 / 16 },
        { label: "3:4", value: 3 / 4 },
    ];

    const matched = standardRatios.find(
        (item) => Math.abs(item.value - ratio) < 0.025,
    );
    if (matched) {
        return `${matched.label} (~${decimal}:1)`;
    }

    const gcd = calculateGcd(width, height);
    const wRatio = Math.round(width / gcd);
    const hRatio = Math.round(height / gcd);

    if (wRatio <= 50 && hRatio <= 50) {
        return `${wRatio}:${hRatio} (${decimal}:1)`;
    }

    return `${decimal}:1`;
}

/**
 * Returns a descriptive category for the current viewport width.
 * @param {number} width
 * @returns {string}
 */
function getBreakpointCategory(width) {
    if (width < 640) return "Mobile (< 640px)";
    if (width < 768) return "Mobile / Phablet (640 - 767px)";
    if (width < 1024) return "Tablet (768 - 1023px)";
    if (width < 1280) return "Laptop / Desktop (1024 - 1279px)";
    if (width < 1536) return "Desktop (1280 - 1535px)";
    if (width < 2560) return "Large Screen (1536 - 2559px)";
    return "Ultra-Wide / 4K+ (≥ 2560px)";
}

/**
 * Determines screen orientation as readable text.
 * @returns {string}
 */
function getOrientationText() {
    if (window.screen.orientation && window.screen.orientation.type) {
        const type = window.screen.orientation.type;
        if (type.startsWith("landscape")) {
            return "Landscape";
        }
        if (type.startsWith("portrait")) {
            return "Portrait";
        }
    }

    return window.innerWidth >= window.innerHeight ? "Landscape" : "Portrait";
}

/**
 * Updates all metrics displayed in the user interface.
 */
function updateMetrics() {
    const vpWidth = window.innerWidth;
    const vpHeight = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const availWidth = window.screen.availWidth;
    const availHeight = window.screen.availHeight;
    const colorDepth = window.screen.colorDepth;

    // Viewport
    const vpDimensionsEl = document.getElementById("viewport-dimensions");
    const vpAspectRatioEl = document.getElementById("viewport-aspect-ratio");
    const vpBreakpointEl = document.getElementById("viewport-breakpoint");
    const vpWidthEl = document.getElementById("vp-width");
    const vpHeightEl = document.getElementById("vp-height");
    const vpRatioEl = document.getElementById("vp-ratio");
    const vpTotalPixelsEl = document.getElementById("vp-total-pixels");

    const vpRatioText = calculateAspectRatio(vpWidth, vpHeight);
    const vpTotalPixels = vpWidth * vpHeight;

    if (vpDimensionsEl) vpDimensionsEl.textContent = `${vpWidth} × ${vpHeight}`;
    if (vpAspectRatioEl) vpAspectRatioEl.textContent = vpRatioText;
    if (vpBreakpointEl) vpBreakpointEl.textContent = getBreakpointCategory(vpWidth);
    if (vpWidthEl) vpWidthEl.textContent = String(vpWidth);
    if (vpHeightEl) vpHeightEl.textContent = String(vpHeight);
    if (vpRatioEl) vpRatioEl.textContent = vpRatioText;
    if (vpTotalPixelsEl) {
        vpTotalPixelsEl.textContent = `${vpTotalPixels.toLocaleString("en-US")} px²`;
    }

    // Physical screen
    const screenDimensionsEl = document.getElementById("screen-dimensions");
    const screenPhysicalEl = document.getElementById("screen-physical");
    const screenRatioEl = document.getElementById("screen-ratio");
    const screenColorDepthEl = document.getElementById("screen-color-depth");

    const physicalWidth = Math.round(screenWidth * dpr);
    const physicalHeight = Math.round(screenHeight * dpr);

    if (screenDimensionsEl) {
        screenDimensionsEl.textContent = `${screenWidth} × ${screenHeight} px`;
    }
    if (screenPhysicalEl) {
        screenPhysicalEl.textContent = `${physicalWidth} × ${physicalHeight} px`;
    }
    if (screenRatioEl) {
        screenRatioEl.textContent = calculateAspectRatio(screenWidth, screenHeight);
    }
    if (screenColorDepthEl) {
        screenColorDepthEl.textContent = `${colorDepth}-bit`;
    }

    // Available space & scaling
    const availWidthEl = document.getElementById("avail-width");
    const availHeightEl = document.getElementById("avail-height");
    const screenOrientationEl = document.getElementById("screen-orientation");
    const dprEl = document.getElementById("device-pixel-ratio");

    if (availWidthEl) availWidthEl.textContent = String(availWidth);
    if (availHeightEl) availHeightEl.textContent = String(availHeight);
    if (screenOrientationEl) screenOrientationEl.textContent = getOrientationText();
    if (dprEl) {
        const dprFormatted = dpr.toFixed(2);
        const dprLabel = dpr >= 1.5 ? "(HiDPI / Retina)" : "(Standard)";
        dprEl.textContent = `${dprFormatted}x ${dprLabel}`;
    }
}

/**
 * Listens for changes to the device pixel ratio (e.g., dragging window between monitors).
 */
function registerDprListener() {
    const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    mediaQuery.addEventListener(
        "change",
        () => {
            updateMetrics();
            registerDprListener();
        },
        { once: true },
    );
}

// Event listeners and initial call
window.addEventListener("resize", updateMetrics);
window.addEventListener("orientationchange", updateMetrics);

if (window.screen.orientation && typeof window.screen.orientation.addEventListener === "function") {
    window.screen.orientation.addEventListener("change", updateMetrics);
}

registerDprListener();
updateMetrics();
