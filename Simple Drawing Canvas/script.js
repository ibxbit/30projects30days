// Advanced Canvas Drawing Application
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const opacity = document.getElementById('opacity');
const opacityValue = document.getElementById('opacityValue');
const clearCanvas = document.getElementById('clearCanvas');
const saveCanvas = document.getElementById('saveCanvas');
const themeToggle = document.querySelector('.toggle-theme');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// Tool buttons
const toolButtons = {
    pencil: document.getElementById('pencilTool'),
    marker: document.getElementById('markerTool'),
    spray: document.getElementById('sprayTool'),
    eraser: document.getElementById('eraserTool'),
    rect: document.getElementById('rectTool'),
    circle: document.getElementById('circleTool'),
    line: document.getElementById('lineTool'),
    fill: document.getElementById('fillTool'),
    text: document.getElementById('textTool'),
    select: document.getElementById('selectTool')
};

// Zoom controls
const zoomOutBtn = document.getElementById('zoomOut');
const zoomInBtn = document.getElementById('zoomIn');
const resetZoomBtn = document.getElementById('resetZoom');
const zoomLevel = document.getElementById('zoomLevel');

// Undo/Redo
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');

// Layers
const layersList = document.getElementById('layersList');
const addLayer = document.getElementById('addLayer');

// Statistics
const drawingTime = document.getElementById('drawingTime');
const strokeCount = document.getElementById('strokeCount');
const canvasSize = document.getElementById('canvasSize');

// Drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentTool = 'pencil';
let currentZoom = 1;
let startTime = Date.now();
let strokeCounter = 0;

// Undo/Redo system
let undoStack = [];
let redoStack = [];
let maxUndoSteps = 50;

// Layers system
let layers = [createLayer('Background', true)];
let currentLayer = 0;

function createLayer(name, visible = true) {
    const layerCanvas = document.createElement('canvas');
    layerCanvas.width = canvas.width;
    layerCanvas.height = canvas.height;
    const layerCtx = layerCanvas.getContext('2d');
    // Fill background for the first layer
    if (name === 'Background') {
        layerCtx.fillStyle = '#ffffff';
        layerCtx.fillRect(0, 0, layerCanvas.width, layerCanvas.height);
    }
    return {
        name,
        visible,
        canvas: layerCanvas,
        ctx: layerCtx
    };
}

function renderLayersList() {
    layersList.innerHTML = '';
    layers.forEach((layer, idx) => {
        const div = document.createElement('div');
        div.className = 'layer-item' + (idx === currentLayer ? ' active' : '');
        div.dataset.layer = idx;
        // Layer name
        const nameSpan = document.createElement('span');
        nameSpan.className = 'layer-name';
        nameSpan.textContent = layer.name;
        nameSpan.onclick = () => selectLayer(idx);
        div.appendChild(nameSpan);
        // Visibility toggle
        const visBtn = document.createElement('button');
        visBtn.className = 'layer-visibility';
        visBtn.title = 'Toggle visibility';
        visBtn.textContent = layer.visible ? '👁️' : '🚫';
        visBtn.onclick = (e) => { e.stopPropagation(); toggleLayerVisibility(idx); };
        div.appendChild(visBtn);
        // Move up
        if (idx > 0) {
            const upBtn = document.createElement('button');
            upBtn.className = 'layer-move';
            upBtn.title = 'Move up';
            upBtn.textContent = '⬆️';
            upBtn.onclick = (e) => { e.stopPropagation(); moveLayer(idx, -1); };
            div.appendChild(upBtn);
        }
        // Move down
        if (idx < layers.length - 1) {
            const downBtn = document.createElement('button');
            downBtn.className = 'layer-move';
            downBtn.title = 'Move down';
            downBtn.textContent = '⬇️';
            downBtn.onclick = (e) => { e.stopPropagation(); moveLayer(idx, 1); };
            div.appendChild(downBtn);
        }
        // Delete (not for background)
        if (idx !== 0) {
            const delBtn = document.createElement('button');
            delBtn.className = 'layer-delete';
            delBtn.title = 'Delete layer';
            delBtn.textContent = '🗑️';
            delBtn.onclick = (e) => { e.stopPropagation(); deleteLayer(idx); };
            div.appendChild(delBtn);
        }
        div.onclick = () => selectLayer(idx);
        layersList.appendChild(div);
    });
}

function selectLayer(idx) {
    currentLayer = idx;
    renderLayersList();
    redrawAllLayers();
}

function addNewLayer() {
    layers.push(createLayer('Layer ' + layers.length));
    currentLayer = layers.length - 1;
    renderLayersList();
    redrawAllLayers();
}

function deleteLayer(idx) {
    if (layers.length <= 1 || idx === 0) return;
    layers.splice(idx, 1);
    if (currentLayer >= layers.length) currentLayer = layers.length - 1;
    renderLayersList();
    redrawAllLayers();
}

function moveLayer(idx, dir) {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= layers.length) return;
    const [layer] = layers.splice(idx, 1);
    layers.splice(newIdx, 0, layer);
    if (currentLayer === idx) currentLayer = newIdx;
    renderLayersList();
    redrawAllLayers();
}

function toggleLayerVisibility(idx) {
    layers[idx].visible = !layers[idx].visible;
    renderLayersList();
    redrawAllLayers();
}

function redrawAllLayers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    layers.forEach((layer) => {
        if (layer.visible) ctx.drawImage(layer.canvas, 0, 0);
    });
}

// Initialize canvas
function initCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = brushSize.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = opacity.value / 100;
    
    updateStatistics();
}

// Save state for undo
function saveState() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.push(imageData);
    if (undoStack.length > maxUndoSteps) {
        undoStack.shift();
    }
    redoStack = [];
    updateUndoRedoButtons();
}

// Undo
function undo() {
    if (undoStack.length > 0) {
        const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        redoStack.push(currentState);
        
        const previousState = undoStack.pop();
        ctx.putImageData(previousState, 0, 0);
        updateUndoRedoButtons();
    }
}

// Redo
function redo() {
    if (redoStack.length > 0) {
        const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        undoStack.push(currentState);
        
        const nextState = redoStack.pop();
        ctx.putImageData(nextState, 0, 0);
        updateUndoRedoButtons();
    }
}

function updateUndoRedoButtons() {
    undoBtn.disabled = undoStack.length === 0;
    redoBtn.disabled = redoStack.length === 0;
}

// Get mouse position relative to canvas
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    // Use pageX/pageY to account for scroll, and round to integer for pixel-perfect drawing
    return {
        x: Math.round((e.clientX - rect.left) * (canvas.width / rect.width)),
        y: Math.round((e.clientY - rect.top) * (canvas.height / rect.height))
    };
}

// Get touch position relative to canvas
function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: Math.round((e.touches[0].clientX - rect.left) * (canvas.width / rect.width)),
        y: Math.round((e.touches[0].clientY - rect.top) * (canvas.height / rect.height))
    };
}

// Start drawing
function startDrawing(e) {
    isDrawing = true;
    const pos = e.type.includes('touch') ? getTouchPos(e) : getMousePos(e);
    [lastX, lastY] = [pos.x, pos.y];
    
    if (currentTool === 'fill') {
        floodFill(pos.x, pos.y);
        isDrawing = false;
    }
}

// Draw
function draw(e) {
    if (!isDrawing) return;
    
    e.preventDefault();
    const pos = e.type.includes('touch') ? getTouchPos(e) : getMousePos(e);
    
    switch (currentTool) {
        case 'pencil':
        case 'marker':
        case 'eraser':
            drawLine(lastX, lastY, pos.x, pos.y);
            break;
        case 'spray':
            sprayPaint(pos.x, pos.y);
            break;
    }
    
    [lastX, lastY] = [pos.x, pos.y];
    strokeCounter++;
    updateStatistics();
}

// Draw line
function drawLine(x1, y1, x2, y2) {
    const layer = layers[currentLayer];
    layer.ctx.strokeStyle = ctx.strokeStyle;
    layer.ctx.lineWidth = ctx.lineWidth;
    layer.ctx.globalAlpha = ctx.globalAlpha;
    layer.ctx.lineCap = ctx.lineCap;
    layer.ctx.lineJoin = ctx.lineJoin;
    layer.ctx.beginPath();
    layer.ctx.moveTo(x1, y1);
    layer.ctx.lineTo(x2, y2);
    layer.ctx.stroke();
    redrawAllLayers();
}

// Spray paint effect
function sprayPaint(x, y) {
    const layer = layers[currentLayer];
    layer.ctx.fillStyle = ctx.strokeStyle;
    layer.ctx.globalAlpha = ctx.globalAlpha;
    const particles = 20;
    for (let i = 0; i < particles; i++) {
        const offsetX = (Math.random() - 0.5) * ctx.lineWidth;
        const offsetY = (Math.random() - 0.5) * ctx.lineWidth;
        layer.ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
    }
    redrawAllLayers();
}

// Flood fill
function floodFill(x, y) {
    // Only fill on the active layer
    const layer = layers[currentLayer];
    const imageData = layer.ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const startPos = (y * canvas.width + x) * 4;
    const startR = pixels[startPos];
    const startG = pixels[startPos + 1];
    const startB = pixels[startPos + 2];
    const fillColor = hexToRgb(colorPicker.value);
    const stack = [[x, y]];
    while (stack.length) {
        const [cx, cy] = stack.pop();
        const pos = (cy * canvas.width + cx) * 4;
        if (cx < 0 || cx >= canvas.width || cy < 0 || cy >= canvas.height) continue;
        if (pixels[pos] !== startR || pixels[pos + 1] !== startG || pixels[pos + 2] !== startB) continue;
        pixels[pos] = fillColor.r;
        pixels[pos + 1] = fillColor.g;
        pixels[pos + 2] = fillColor.b;
        stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
    layer.ctx.putImageData(imageData, 0, 0);
    redrawAllLayers();
}

// Convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Stop drawing
function stopDrawing() {
    if (isDrawing) {
        saveState();
        isDrawing = false;
    }
}

// Update brush size display
function updateBrushSize() {
    const size = brushSize.value;
    brushSizeValue.textContent = size + 'px';
    ctx.lineWidth = size;
}

// Update opacity
function updateOpacity() {
    const op = opacity.value;
    opacityValue.textContent = op + '%';
    ctx.globalAlpha = op / 100;
}

// Update color
function updateColor() {
    ctx.strokeStyle = colorPicker.value;
    ctx.fillStyle = colorPicker.value;
}

// Set tool
function setTool(tool) {
    currentTool = tool;
    
    // Update tool buttons
    Object.values(toolButtons).forEach(btn => btn.classList.remove('active'));
    toolButtons[tool].classList.add('active');
    
    // Update cursor
    switch (tool) {
        case 'eraser':
            canvas.style.cursor = 'crosshair';
            ctx.strokeStyle = document.body.classList.contains('dark') ? '#2a2d32' : '#ffffff';
            break;
        case 'fill':
            canvas.style.cursor = 'pointer';
            break;
        case 'text':
            canvas.style.cursor = 'text';
            break;
        default:
            canvas.style.cursor = 'crosshair';
            ctx.strokeStyle = colorPicker.value;
    }
}

// Zoom functions
function zoomInFunc() {
    if (currentZoom < 5) {
        currentZoom *= 1.2;
        updateZoom();
    }
}

function zoomOutFunc() {
    if (currentZoom > 0.1) {
        currentZoom /= 1.2;
        updateZoom();
    }
}

function resetZoomFunc() {
    currentZoom = 1;
    updateZoom();
}

function updateZoom() {
    canvas.style.transform = `scale(${currentZoom})`;
    zoomLevel.textContent = Math.round(currentZoom * 100) + '%';
}

// Clear canvas
function clear() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset any transforms
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff'; // Always fill with white
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    // Do not call saveState() here
    layers = [createLayer('Background', true)];
    currentLayer = 0;
    renderLayersList();
    redrawAllLayers();
}

// Save drawing
function save() {
    // Merge all visible layers
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext('2d');
    layers.forEach(layer => {
        if (layer.visible) exportCtx.drawImage(layer.canvas, 0, 0);
    });
    const link = document.createElement('a');
    link.download = 'drawing-' + new Date().toISOString().slice(0, 10) + '.png';
    link.href = exportCanvas.toDataURL();
    link.click();
}

// Update statistics
function updateStatistics() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    drawingTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    strokeCount.textContent = strokeCounter;
    canvasSize.textContent = `${canvas.width}×${canvas.height}`;
}

// Fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        fullscreenBtn.textContent = '⛶';
    } else {
        document.exitFullscreen();
        fullscreenBtn.textContent = '⛶';
    }
}

// Dark mode logic
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const savedTheme = localStorage.getItem('theme');
const sunSVG = `<svg class="theme-icon" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="10" stroke="#7f7fd5" stroke-width="2" fill="#fff"/><path d="M14 4v2M14 22v2M4 14h2M22 14h2M7.8 7.8l1.4 1.4M18.8 18.8l1.4 1.4M7.8 20.2l1.4-1.4M18.8 9.2l1.4-1.4" stroke="#7f7fd5" stroke-width="2" stroke-linecap="round"/></svg>`;
const moonSVG = `<svg class="theme-icon" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 18.5A10 10 0 0 1 9.5 7c0-1.1.2-2.1.5-3A10 10 0 1 0 21 18.5z" stroke="#7f7fd5" stroke-width="2" fill="#fff"/></svg>`;

function setTheme(dark) {
    if (dark) {
        document.body.classList.add('dark');
        themeToggle.innerHTML = sunSVG;
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark');
        themeToggle.innerHTML = moonSVG;
        localStorage.setItem('theme', 'light');
    }
}

// Initialize theme
if (savedTheme === 'dark' || (!savedTheme && prefersDark.matches)) {
    setTheme(true);
} else {
    setTheme(false);
}

// Event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch events for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(e);
});
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e);
});
canvas.addEventListener('touchend', stopDrawing);

// Tool events
Object.entries(toolButtons).forEach(([tool, button]) => {
    button.addEventListener('click', () => setTool(tool));
});

// Control events
colorPicker.addEventListener('input', updateColor);
brushSize.addEventListener('input', updateBrushSize);
opacity.addEventListener('input', updateOpacity);
clearCanvas.addEventListener('click', clear);
saveCanvas.addEventListener('click', save);
themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark');
    setTheme(!isDark);
});

// Zoom events
zoomInBtn.addEventListener('click', zoomInFunc);
zoomOutBtn.addEventListener('click', zoomOutFunc);
resetZoomBtn.addEventListener('click', resetZoomFunc);

// Undo/Redo events
undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

// Fullscreen events
fullscreenBtn.addEventListener('click', toggleFullscreen);

// System theme change
prefersDark.addEventListener('change', (e) => {
    setTheme(e.matches);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 's':
                e.preventDefault();
                save();
                break;
            case 'z':
                e.preventDefault();
                if (e.shiftKey) redo();
                else undo();
                break;
            case 'y':
                e.preventDefault();
                redo();
                break;
        }
    } else {
        switch(e.key.toLowerCase()) {
            case 'p':
                setTool('pencil');
                break;
            case 'm':
                setTool('marker');
                break;
            case 's':
                setTool('spray');
                break;
            case 'e':
                setTool('eraser');
                break;
            case 'r':
                setTool('rect');
                break;
            case 'c':
                setTool('circle');
                break;
            case 'l':
                setTool('line');
                break;
            case 'f':
                setTool('fill');
                break;
            case 't':
                setTool('text');
                break;
            case 'v':
                setTool('select');
                break;
        }
    }
});

// Initialize
initCanvas();
updateBrushSize();
updateOpacity();
updateStatistics();
updateUndoRedoButtons();
renderLayersList();
redrawAllLayers(); 