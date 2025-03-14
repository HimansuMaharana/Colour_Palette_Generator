document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const modeSelect = document.getElementById('mode');
    const generateButton = document.getElementById('generate');
    const paletteDiv = document.querySelector('.palette');
    const color1Input = document.getElementById('color1');
    const color2Input = document.getElementById('color2');
    const contrastRatioDisplay = document.getElementById('contrast-ratio');
    const contrastLevelDisplay = document.getElementById('contrast-level');
    const downloadPNGButton = document.getElementById('downloadPNG');

    // Function to generate a random hex color
    function generateRandomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    // Function to generate color palette based on selected mode
    function generatePalette(mode) {
        paletteDiv.innerHTML = ''; // Clear previous palette
        const baseColor = generateRandomColor(); // Generate a random base color
        const baseHue = hexToHsl(baseColor).h; // Convert base color to HSL
        let colors = [baseColor]; // Start palette with base color

        // Generate triadic or pentadic color scheme
        if (mode === 'triadic') {
            colors.push(hslToHex({ h: (baseHue + 120) % 360, s: 100, l: 50 }));
            colors.push(hslToHex({ h: (baseHue + 240) % 360, s: 100, l: 50 }));
        } else if (mode === 'pentadic') {
            colors.push(hslToHex({ h: (baseHue + 72) % 360, s: 100, l: 50 }));
            colors.push(hslToHex({ h: (baseHue + 144) % 360, s: 100, l: 50 }));
            colors.push(hslToHex({ h: (baseHue + 216) % 360, s: 100, l: 50 }));
            colors.push(hslToHex({ h: (baseHue + 288) % 360, s: 100, l: 50 }));
        }

        // Create color boxes for each generated color and add event listeners for copying
        colors.forEach(color => {
            const colorBox = document.createElement('div');
            colorBox.classList.add('color-box');
            colorBox.style.backgroundColor = color;
            colorBox.textContent = color;
            colorBox.addEventListener('click', () => {
                navigator.clipboard.writeText(color); // Copy color to clipboard
                alert(`Color ${color} copied to clipboard!`); // Show alert
            });
            paletteDiv.appendChild(colorBox); // Append color box to palette
        });
    }

    // Convert hex color to RGB object
    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }

    // Convert RGB object to luminance value
    function rgbToLuminance(rgb) {
        const a = [rgb.r, rgb.g, rgb.b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    // Calculate contrast ratio between two colors
    function calculateContrastRatio(color1, color2) {
        const luminance1 = rgbToLuminance(hexToRgb(color1));
        const luminance2 = rgbToLuminance(hexToRgb(color2));
        const brighter = Math.max(luminance1, luminance2);
        const darker = Math.min(luminance1, luminance2);
        return (brighter + 0.05) / (darker + 0.05);
    }

    // Update the contrast ratio and level
    function updateContrast() {
        const color1 = color1Input.value;
        const color2 = color2Input.value;
        const ratio = calculateContrastRatio(color1, color2);
        contrastRatioDisplay.textContent = `Contrast Ratio: ${ratio.toFixed(2)}`; // Show contrast ratio
        let level = '-';
        if (ratio >= 7.0) level = 'AAA'; // WCAG AAA level
        else if (ratio >= 4.5) level = 'AA'; // WCAG AA level
        contrastLevelDisplay.textContent = `Level: ${level}`; // Show contrast level
    }

    // Convert hex color to HSL object
    function hexToHsl(hex) {
        let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) h = s = 0;
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    // Convert HSL object to hex color
    function hslToHex(hsl) {
        let h = hsl.h, s = hsl.s / 100, l = hsl.l / 100;
        const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
        let r, g, b;
        if (0 <= h && h < 60) { r = c; g = x; b = 0; }
        else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
        else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
        else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
        else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
        else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
        r = Math.round((r + m) * 255).toString(16);
        g = Math.round((g + m) * 255).toString(16);
        b = Math.round((b + m) * 255).toString(16);
        return "#" + r.padStart(2, '0') + g.padStart(2, '0') + b.padStart(2, '0');
    }

    // Event listeners
    generateButton.addEventListener('click', () => {
        generatePalette(modeSelect.value); // Generate palette on button click
    });

    color1Input.addEventListener('input', updateContrast); // Update contrast on color1 input
    color2Input.addEventListener('input', updateContrast); // Update contrast on color2 input

    // Download palette as PNG
    downloadPNGButton.addEventListener('click', () => {
        html2canvas(document.querySelector('.palette')).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'palette.png';
            link.click();
        });
    });

    // Set default values and initialize palette
    color1Input.value = '#000000'; // Default color1 (black)
    color2Input.value = '#ffffff'; // Default color2 (white)
    updateContrast(); // Initial contrast update

    // Initialize with a random palette
    generatePalette(modeSelect.value); // Generate initial palette
    updateContrast(); // Update contrast initially
});
