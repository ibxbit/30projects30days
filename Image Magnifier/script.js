// Advanced Image Magnifier with all features
const magnifier = document.getElementById('magnifier');
const previewWindow = document.getElementById('previewWindow');
const zoomSlider = document.getElementById('zoomSlider');
const zoomValue = document.getElementById('zoomValue');
const sizeSlider = document.getElementById('sizeSlider');
const sizeValue = document.getElementById('sizeValue');
const shapeToggle = document.getElementById('shapeToggle');
const lensModeBtn = document.getElementById('lensModeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const images = document.querySelectorAll('.magnifiable');
const opacitySlider = document.getElementById('opacitySlider');
const opacityValue = document.getElementById('opacityValue');
const filterSelect = document.getElementById('filterSelect');
const lockBtn = document.getElementById('lockBtn');
const historyGallery = document.getElementById('historyGallery');

let zoom = parseFloat(zoomSlider.value);
let magSize = parseInt(sizeSlider.value);
let shape = shapeToggle.value;
let lensMode = false;
let activeImage = null;
let isTouching = false;
let touchTimeout = null;
let filter = 'none';
let magOpacity = 1;
let isLocked = false;
let lockPos = { x: 0, y: 0, img: null };
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let history = [];
let animatedBorder = true;

function setMagnifierStyle() {
    magnifier.style.width = magSize + 'px';
    magnifier.style.height = magSize + 'px';
    magnifier.className = 'magnifier visible ' + shape + (animatedBorder ? ' animated-border' : '');
    magnifier.style.setProperty('--mag-filter', filter);
    magnifier.style.setProperty('--mag-opacity', magOpacity);
}

function setPreviewStyle() {
    previewWindow.style.width = magSize + 'px';
    previewWindow.style.height = magSize + 'px';
}

function showMagnifier(img, x, y, pageX, pageY, options = {}) {
    activeImage = img;
    setMagnifierStyle();
    setPreviewStyle();
    // Calculate background size and position
    const rect = img.getBoundingClientRect();
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const displayW = img.width;
    const displayH = img.height;
    const relX = (x / displayW) * imgW;
    const relY = (y / displayH) * imgH;
    // Set background
    magnifier.style.backgroundImage = `url('${img.src}')`;
    magnifier.style.backgroundSize = `${displayW * zoom}px ${displayH * zoom}px`;
    const bgX = -x * zoom + magSize / 2;
    const bgY = -y * zoom + magSize / 2;
    magnifier.style.backgroundPosition = `${bgX}px ${bgY}px`;
    // Border color based on image
    getDominantColor(img).then(color => {
        magnifier.style.borderColor = color;
        previewWindow.style.borderColor = color;
    });
    // Crosshair
    if (!magnifier.querySelector('.crosshair')) {
        const cross = document.createElement('div');
        cross.className = 'crosshair';
        magnifier.appendChild(cross);
    }
    // Position
    if (lensMode) {
        // Lens mode: magnifier follows inside image
        magnifier.style.left = (rect.left + x - magSize / 2) + 'px';
        magnifier.style.top = (rect.top + y - magSize / 2) + 'px';
    } else {
        // Default: magnifier floats next to cursor
        let magX = pageX + 20;
        let magY = pageY - magSize / 2;
        if (magX + magSize > window.innerWidth) {
            magX = pageX - magSize - 20;
        }
        if (magY < 0) magY = 0;
        if (magY + magSize > window.innerHeight) magY = window.innerHeight - magSize;
        magnifier.style.left = magX + 'px';
        magnifier.style.top = magY + 'px';
    }
    magnifier.style.backgroundRepeat = 'no-repeat';
    magnifier.style.backgroundSize = `${displayW * zoom}px ${displayH * zoom}px`;
    magnifier.style.backgroundPosition = `${bgX}px ${bgY}px`;
    magnifier.setAttribute('aria-label', `Magnified area at (${Math.round(relX)}, ${Math.round(relY)})`);
    magnifier.classList.add('visible');
    // Preview window
    previewWindow.style.backgroundImage = `url('${img.src}')`;
    previewWindow.style.backgroundSize = `${displayW * zoom}px ${displayH * zoom}px`;
    previewWindow.style.backgroundPosition = `${bgX}px ${bgY}px`;
    previewWindow.classList.add('visible');
    magnifier.style.filter = filter;
    magnifier.style.opacity = magOpacity;
    // Color tooltip
    if (img.tagName === 'IMG' || img.tagName === 'VIDEO') {
        getPixelColor(img, x, y).then(color => {
            const tooltip = document.getElementById('colorTooltip');
            tooltip.textContent = color.hex + ' / ' + color.rgb;
            tooltip.style.background = color.hex;
            tooltip.style.color = color.isDark ? '#fff' : '#222';
        });
    }
}

function hideMagnifier() {
    magnifier.classList.remove('visible');
    previewWindow.classList.remove('visible');
    if (magnifier.querySelector('.crosshair')) {
        magnifier.removeChild(magnifier.querySelector('.crosshair'));
    }
}

// Get dominant color for border
function getDominantColor(img) {
    return new Promise(resolve => {
        const c = document.createElement('canvas');
        c.width = 1; c.height = 1;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, 1, 1);
        const d = ctx.getImageData(0, 0, 1, 1).data;
        resolve(`rgb(${d[0]},${d[1]},${d[2]})`);
    });
}

function getPixelColor(img, x, y) {
    return new Promise(resolve => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth || img.videoWidth || img.width;
        c.height = img.naturalHeight || img.videoHeight || img.height;
        const ctx = c.getContext('2d');
        if (img.tagName === 'VIDEO') {
            ctx.drawImage(img, 0, 0, c.width, c.height);
        } else {
            ctx.drawImage(img, 0, 0, c.width, c.height);
        }
        const px = ctx.getImageData(Math.round(x * (c.width / img.width)), Math.round(y * (c.height / img.height)), 1, 1).data;
        const hex = '#' + [px[0], px[1], px[2]].map(v => v.toString(16).padStart(2, '0')).join('');
        const rgb = `rgb(${px[0]},${px[1]},${px[2]})`;
        const isDark = (px[0]*0.299 + px[1]*0.587 + px[2]*0.114) < 128;
        resolve({ hex, rgb, isDark });
    });
}

// Mouse events for all images
images.forEach(img => {
    img.addEventListener('mousemove', e => {
        const rect = img.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        showMagnifier(img, x, y, e.pageX, e.pageY);
    });
    img.addEventListener('mouseenter', e => {
        magnifier.style.display = 'block';
        previewWindow.style.display = 'block';
    });
    img.addEventListener('mouseleave', e => {
        hideMagnifier();
        magnifier.style.display = 'none';
        previewWindow.style.display = 'none';
    });
    // Keyboard accessibility: focus/arrow keys
    img.addEventListener('focus', e => {
        const rect = img.getBoundingClientRect();
        showMagnifier(img, rect.width/2, rect.height/2, rect.left + rect.width/2, rect.top + rect.height/2);
    });
    img.addEventListener('blur', hideMagnifier);
    img.addEventListener('keydown', e => {
        if (!activeImage) return;
        const rect = img.getBoundingClientRect();
        let x = rect.width/2, y = rect.height/2;
        if (magnifier.classList.contains('visible')) {
            const style = window.getComputedStyle(magnifier);
            const bgPos = style.backgroundPosition.split(' ');
            x = -parseFloat(bgPos[0]) / zoom + magSize/2/zoom;
            y = -parseFloat(bgPos[1]) / zoom + magSize/2/zoom;
        }
        if (e.key === 'ArrowRight') x += 10;
        if (e.key === 'ArrowLeft') x -= 10;
        if (e.key === 'ArrowDown') y += 10;
        if (e.key === 'ArrowUp') y -= 10;
        showMagnifier(img, x, y, rect.left + x, rect.top + y);
    });
    // Touch support: long-press
    img.addEventListener('touchstart', e => {
        if (isTouching) return;
        isTouching = true;
        const touch = e.touches[0];
        const rect = img.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        touchTimeout = setTimeout(() => {
            showMagnifier(img, x, y, touch.pageX, touch.pageY);
            magnifier.style.display = 'block';
            previewWindow.style.display = 'block';
        }, 400);
    });
    img.addEventListener('touchmove', e => {
        if (!isTouching) return;
        clearTimeout(touchTimeout);
        const touch = e.touches[0];
        const rect = img.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        showMagnifier(img, x, y, touch.pageX, touch.pageY);
    });
    img.addEventListener('touchend', e => {
        isTouching = false;
        clearTimeout(touchTimeout);
        hideMagnifier();
        magnifier.style.display = 'none';
        previewWindow.style.display = 'none';
    });
});

// Controls
zoomSlider.addEventListener('input', e => {
    zoom = parseFloat(zoomSlider.value);
    zoomValue.textContent = zoom + 'x';
});
sizeSlider.addEventListener('input', e => {
    magSize = parseInt(sizeSlider.value);
    sizeValue.textContent = magSize + 'px';
});
shapeToggle.addEventListener('change', e => {
    shape = shapeToggle.value;
});
lensModeBtn.addEventListener('click', e => {
    lensMode = !lensMode;
    lensModeBtn.classList.toggle('active', lensMode);
    lensModeBtn.textContent = lensMode ? 'Lens Mode (On)' : 'Lens Mode';
});

// Download magnified area
function addToHistory() {
    if (!activeImage) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = magSize;
    tempCanvas.height = magSize;
    const tempCtx = tempCanvas.getContext('2d');
    // Calculate source area
    const rect = activeImage.getBoundingClientRect();
    const displayW = activeImage.width;
    const displayH = activeImage.height;
    const imgW = activeImage.naturalWidth || activeImage.videoWidth || activeImage.width;
    const imgH = activeImage.naturalHeight || activeImage.videoHeight || activeImage.height;
    // Get last mouse position from backgroundPosition
    const style = window.getComputedStyle(magnifier);
    const bgPos = style.backgroundPosition.split(' ');
    const x = -parseFloat(bgPos[0]) / zoom + magSize/2/zoom;
    const y = -parseFloat(bgPos[1]) / zoom + magSize/2/zoom;
    const srcX = (x / displayW) * imgW - (magSize/2) / zoom * (imgW/displayW);
    const srcY = (y / displayH) * imgH - (magSize/2) / zoom * (imgH/displayH);
    const srcW = (magSize / zoom) * (imgW/displayW);
    const srcH = (magSize / zoom) * (imgH/displayH);
    tempCtx.drawImage(activeImage, srcX, srcY, srcW, srcH, 0, 0, magSize, magSize);
    const img = document.createElement('img');
    img.src = tempCanvas.toDataURL();
    img.title = 'Click to preview';
    img.onclick = () => {
        previewWindow.style.backgroundImage = `url('${img.src}')`;
        previewWindow.classList.add('visible');
    };
    historyGallery.appendChild(img);
    history.push(img.src);
}

// Opacity control
opacitySlider.addEventListener('input', e => {
    magOpacity = parseFloat(opacitySlider.value);
    opacityValue.textContent = magOpacity.toFixed(2);
});

// Filter control
filterSelect.addEventListener('change', e => {
    filter = filterSelect.value;
});

// Animated border toggle (pulse/rainbow)
setInterval(() => {
    if (animatedBorder && magnifier.classList.contains('visible')) {
        magnifier.classList.toggle('animated-border');
    }
}, 2000);

// Lock/move logic
lockBtn.addEventListener('click', () => {
    isLocked = !isLocked;
    lockBtn.classList.toggle('active', isLocked);
    lockBtn.textContent = isLocked ? 'Unlock Magnifier' : 'Lock Magnifier';
    if (isLocked && activeImage) {
        // Lock at current position
        const rect = activeImage.getBoundingClientRect();
        lockPos = {
            x: parseFloat(magnifier.style.left) - rect.left,
            y: parseFloat(magnifier.style.top) - rect.top,
            img: activeImage
        };
        magnifier.classList.add('locked-cursor');
    } else {
        magnifier.classList.remove('locked-cursor');
    }
});

magnifier.addEventListener('mousedown', e => {
    if (!isLocked) return;
    isDragging = true;
    dragOffset.x = e.clientX - parseFloat(magnifier.style.left);
    dragOffset.y = e.clientY - parseFloat(magnifier.style.top);
    document.body.style.cursor = 'grabbing';
});
document.addEventListener('mousemove', e => {
    if (isDragging && isLocked && lockPos.img) {
        magnifier.style.left = (e.clientX - dragOffset.x) + 'px';
        magnifier.style.top = (e.clientY - dragOffset.y) + 'px';
    }
});
document.addEventListener('mouseup', e => {
    isDragging = false;
    document.body.style.cursor = '';
});

// Magnifier history
function addToHistory() {
    if (!activeImage) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = magSize;
    tempCanvas.height = magSize;
    const tempCtx = tempCanvas.getContext('2d');
    // Calculate source area
    const rect = activeImage.getBoundingClientRect();
    const displayW = activeImage.width;
    const displayH = activeImage.height;
    const imgW = activeImage.naturalWidth || activeImage.videoWidth || activeImage.width;
    const imgH = activeImage.naturalHeight || activeImage.videoHeight || activeImage.height;
    // Get last mouse position from backgroundPosition
    const style = window.getComputedStyle(magnifier);
    const bgPos = style.backgroundPosition.split(' ');
    const x = -parseFloat(bgPos[0]) / zoom + magSize/2/zoom;
    const y = -parseFloat(bgPos[1]) / zoom + magSize/2/zoom;
    const srcX = (x / displayW) * imgW - (magSize/2) / zoom * (imgW/displayW);
    const srcY = (y / displayH) * imgH - (magSize/2) / zoom * (imgH/displayH);
    const srcW = (magSize / zoom) * (imgW/displayW);
    const srcH = (magSize / zoom) * (imgH/displayH);
    tempCtx.drawImage(activeImage, srcX, srcY, srcW, srcH, 0, 0, magSize, magSize);
    const img = document.createElement('img');
    img.src = tempCanvas.toDataURL();
    img.title = 'Click to preview';
    img.onclick = () => {
        previewWindow.style.backgroundImage = `url('${img.src}')`;
        previewWindow.classList.add('visible');
    };
    historyGallery.appendChild(img);
    history.push(img.src);
}

// Add to history on download
if (downloadBtn) {
    downloadBtn.addEventListener('click', addToHistory);
}

// Accessibility: ESC to hide magnifier
window.addEventListener('keydown', e => {
    if (e.key === 'Escape') hideMagnifier();
}); 