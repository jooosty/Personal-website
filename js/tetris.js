// inspiration from: https://codepen.io/Ryan-1957/pen/OJKLweb

// Tetris Game with Unlock System
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const difficultyInput = document.getElementById('difficulty');
const previewPanel = document.querySelector('.next-preview');
const previewList = document.getElementById('next-preview-list');
const difficultyWrapper = document.querySelector('.tetris-difficulty');
const mobileStartButton = document.getElementById('mobile-start');
const pauseToggleButton = document.getElementById('pause-toggle');
const unlockAllButton = document.getElementById('unlock-all');
const blockStyleButtons = document.querySelectorAll('.block-style-btn');
const tetrisAudio = document.getElementById('tetris-audio');
const lineClearAudio = document.getElementById('tetris-line-clear');
const unlockAudio = document.getElementById('unlock-audio');

// Set canvas size
const BLOCK_SIZE = 30;
const ROWS = 20;
const COLS = 10;
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

// Game state
let score = 0;
let externalUnlockScore = 0;
let gameOver = false;
let gameStarted = false;
let isPaused = false;
let dropCounter = 0;
let dropInterval = 1000;
let baseDropInterval = 1000;
let speedElapsed = 0;
const MIN_DROP_INTERVAL = 250;
const SPEEDUP_PER_SECOND = 2;
let lastTime = 0;

function isHandheldDevice() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    }
}




// Unlock thresholds
const UNLOCKS = [
    { score: 0, section: 'name' },
    { score: 50, section: 'age' },
    { score: 100, section: 'location' },
    { score: 200, section: 'hobbies-list' },
    { score: 400, section: 'course-list' },
    { score: 800, section: 'occupation-list' },
    { score: 1600, section: 'learning-goals' },
    { score: 3200, section: 'languages-list' }
];

// Set drop interval based on difficulty
function updateDropInterval() {
    switch (difficultyInput.value) {
        case '1': // Difficulty 1
            baseDropInterval = 1400;
            break;
        case '2': // Difficulty 2
            baseDropInterval = 1200;
            break;
        case '3': // Difficulty 3
            baseDropInterval = 1000;
            break;
        case '4': // Difficulty 4
            baseDropInterval = 800;
            break;
        case '5': // Difficulty 5
            baseDropInterval = 600;
            break;
    }
    dropInterval = getSpeedAdjustedInterval();
}

function getSpeedAdjustedInterval() {
    const adjustment = (speedElapsed / 1000) * SPEEDUP_PER_SECOND;
    const next = baseDropInterval - adjustment;
    return Math.max(MIN_DROP_INTERVAL, Math.floor(next));
}

function getDifficultyMultiplier() {
    const rawValue = difficultyInput ? parseInt(difficultyInput.value, 10) : 1;
    return Number.isNaN(rawValue) ? 1 : rawValue;
}

let unlockedSections = new Set();

// Set unlock badge text from UNLOCKS
function updateUnlockBadges() {
    const badges = document.querySelectorAll('.unlock-badge[data-section]');
    badges.forEach(badge => {
        const sectionId = badge.dataset.section;
        const unlock = UNLOCKS.find(item => item.section === sectionId);
        if (!unlock) return;
        badge.textContent = `Unlock at ${unlock.score * parseInt(difficultyInput.value)} pts`;
    });
}

updateUnlockBadges();

if (difficultyInput) {
    difficultyInput.addEventListener('input', () => {
        applyPreviewSettings();
        updateDropInterval();
        updateUnlockBadges();
        checkUnlocks();
    });
}

// Create the game board
const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// I is Long shape
// O is Square shape
// T is T shape
// S is S shape
// Z is Reverse S shape
// J is Left L shape
// L is Right L shape
// Tetromino shapes
const SHAPES = {
    I: [[1, 1, 1, 1]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    Z: [[1, 1, 0], [0, 1, 1]],
    J: [[1, 0, 0], [1, 1, 1]],
    L: [[0, 0, 1], [1, 1, 1]]
};

// Colors for each shape
const COLORS = {
    I: '#00f0f0',
    O: '#f0f000',
    T: '#a000f0',
    S: '#00f000',
    Z: '#f00000',
    J: '#0000f0',
    L: '#f0a000'
};

const WEIGHT = {
    I: 100,
    O: 100,
    T: 100,
    S: 100,
    Z: 100,
    J: 100,
    L: 100
};

const DROUGHT_BONUS = 15;

const pieceDrought = {
    I: 0,
    O: 0,
    T: 0,
    S: 0,
    Z: 0,
    J: 0,
    L: 0
};

// Current piece
let currentPiece = {
    shape: null,
    color: null,
    x: 0,
    y: 0,
    matrix: null
};

let nextQueue = [];
let previewCanvases = [];
let previewContexts = [];

let avatarImages = [];
let avatarImageIndex = 0;
let avatarCount = 0;
let useAvatarBlocks = true;

function getRandomAvatarImage() {
    if (!avatarImages.length) return null;
    const image = avatarImages[avatarImageIndex % avatarImages.length];
    avatarImageIndex += 1;
    return image || null;
}

function buildImageMatrix(matrix) {
    return matrix.map((row) => row.map((cell) => (cell ? getRandomAvatarImage() : null)));
}

function rotateMatrixClockwise(matrix) {
    if (!matrix || !matrix.length) return matrix;
    const rotated = [];
    for (let i = 0; i < matrix[0].length; i++) {
        const row = [];
        for (let j = matrix.length - 1; j >= 0; j--) {
            row.push(matrix[j][i]);
        }
        rotated.push(row);
    }
    return rotated;
}

function ensurePieceImages(piece) {
    if (!piece || !piece.matrix) return;
    if (!useAvatarBlocks || !avatarImages.length) return;

    const hasMatrix = Array.isArray(piece.imageMatrix);
    const matrixHasImages = hasMatrix && piece.imageMatrix.some((row) => row && row.some((img) => img));

    if (!hasMatrix || !matrixHasImages) {
        piece.imageMatrix = buildImageMatrix(piece.matrix);
        return;
    }

    piece.imageMatrix = piece.imageMatrix.map((row, r) =>
        row.map((img, c) => (piece.matrix[r] && piece.matrix[r][c] && !img ? getRandomAvatarImage() : img))
    );
}

function getPieceCellImage(piece, row, col) {
    if (!useAvatarBlocks) return null;
    if (piece && piece.imageMatrix && piece.imageMatrix[row]) {
        return piece.imageMatrix[row][col] || null;
    }
    return piece && piece.image ? piece.image : null;
}

function applyBlockStyle(style) {
    useAvatarBlocks = style === 'avatars';

    blockStyleButtons.forEach((button) => {
        const isActive = button.dataset.style === style;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    if (useAvatarBlocks) {
        if (useAvatarBlocks) {
            if (currentPiece && currentPiece.matrix) {
                currentPiece.imageMatrix = buildImageMatrix(currentPiece.matrix);
            }
            if (savedPiece && savedPiece.matrix) {
                savedPiece.imageMatrix = buildImageMatrix(savedPiece.matrix);
            }
            if (nextQueue.length) {
                nextQueue = nextQueue.map((piece) => {
                    if (!piece || !piece.matrix) return piece;
                    return { ...piece, imageMatrix: buildImageMatrix(piece.matrix) };
                });
            }
        }
    }

    updateNextPreview();
    if (!gameStarted) {
        drawBoard();
        displayInstructions();
    } else {
        draw();
    }
}

// Check and unlock sections based on score
function checkUnlocks() {
    const totalScore = score + externalUnlockScore;
    const multiplier = getDifficultyMultiplier();
    UNLOCKS.forEach(unlock => {
        if (totalScore >= unlock.score * multiplier && !unlockedSections.has(unlock.section)) {
            unlockSection(unlock.section);
        }
    });
}

// Unlock a section
function unlockSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        unlockedSections.add(sectionId);
        section.classList.remove('locked');
        section.classList.add('unlocked');
        
        // Display the data when unlocking
        if (typeof displaySectionData === 'function') {
            displaySectionData(sectionId);
        }
        
        // Update the unlock badge (keep it so it can be restored on reset)
        const badge = document.querySelector(`.unlock-badge[data-section="${sectionId}"]`);
        if (badge) {
            badge.textContent = 'Unlocked!';
            badge.style.background = 'rgba(0, 255, 0, 0.2)';
            badge.style.borderColor = '#00ff00';
            badge.style.color = '#00ff00';
        }
        
        // Play unlock sound effect (visual feedback)
        section.style.transform = 'scale(1.05)';
        setTimeout(() => {
            section.style.transform = 'scale(1)';
        }, 300);

        if (unlockAudio) {
            unlockAudio.currentTime = 0;
            unlockAudio.play().catch(() => {});
        }
    }
}

function resetUnlockBadges() {
    const badges = document.querySelectorAll('.unlock-badge[data-section]');
    badges.forEach((badge) => {
        badge.style.background = '';
        badge.style.borderColor = '';
        badge.style.color = '';
    });
    updateUnlockBadges();
}

// Update score and check unlocks
function updateScore(points) {
    score += points;
    scoreElement.textContent = score;
    checkUnlocks();
    if (typeof window.setSharedScore === 'function') {
        window.setSharedScore(score, 'tetris');
    }
}

function setExternalUnlockScore(value) {
    const numeric = Number(value);
    externalUnlockScore = Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : 0;
    checkUnlocks();
}

window.setExternalUnlockScore = setExternalUnlockScore;

function setTetrisScore(value) {
    const numeric = Number(value);
    score = Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : 0;
    scoreElement.textContent = score;
    checkUnlocks();
}

function getTetrisScore() {
    return score;
}

function setTetrisPaused(paused) {
    if (!gameStarted || gameOver) return;
    isPaused = Boolean(paused);
    canvas.classList.toggle('is-paused', isPaused);
    updatePauseButtonState();
    if (tetrisAudio) {
        if (isPaused) {
            tetrisAudio.pause();
        } else {
            tetrisAudio.play().catch(() => {});
        }
    }
    draw();
}

window.setTetrisScore = setTetrisScore;
window.getTetrisScore = getTetrisScore;
window.setTetrisPaused = setTetrisPaused;

if (typeof window.getSharedScore === 'function') {
    setTetrisScore(window.getSharedScore());
}

function unlockAllSections() {
    UNLOCKS.forEach((unlock) => {
        unlockSection(unlock.section);
    });
}

// Create a new piece
function createPiece() {
    const shapes = Object.keys(SHAPES);
    let totalWeight = 0;
    const weighted = shapes.map((shapeKey) => {
        const base = WEIGHT[shapeKey] || 100;
        const bonus = (pieceDrought[shapeKey] || 0) * DROUGHT_BONUS;
        const weight = base + bonus;
        totalWeight += weight;
        return { shapeKey, weight };
    });

    let roll = Math.random() * totalWeight;
    let randomShape = weighted[weighted.length - 1].shapeKey;

    for (let i = 0; i < weighted.length; i++) {
        roll -= weighted[i].weight;
        if (roll <= 0) {
            randomShape = weighted[i].shapeKey;
            break;
        }
    }
    // check if there is a piece with more then 10 drought, if so, override the random roll and pick the piece with the highest drought
    const droughtThreshold = 10;
    const maxDroughtShape = Object.keys(pieceDrought).reduce((maxShape, shapeKey) => {
        if ((pieceDrought[shapeKey] || 0) > (pieceDrought[maxShape] || 0)) {
            return shapeKey;
        }        return maxShape;
    }, shapes[0]);

    if ((pieceDrought[maxDroughtShape] || 0) > droughtThreshold) {
        randomShape = maxDroughtShape;
    }

    shapes.forEach((shapeKey) => {
        if (shapeKey === randomShape) {
            pieceDrought[shapeKey] = 0;
        } else {
            pieceDrought[shapeKey] = (pieceDrought[shapeKey] || 0) + 1;
        }
    });

    const shape = SHAPES[randomShape];
    
    return {
        shape: randomShape,
        color: COLORS[randomShape],
        imageMatrix: buildImageMatrix(shape),
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0,
        matrix: shape
    };
}

function getPreviewCountFromDifficulty() {
    const rawValue = difficultyInput ? parseInt(difficultyInput.value, 10) : 3;
    const value = Number.isNaN(rawValue) ? 3 : rawValue;
    const clamped = Math.min(5, Math.max(1, value));
    return Math.max(0, 5 - clamped);
}

function getPreviewDisplayCount() {
    const previewCount = getPreviewCountFromDifficulty();
    return previewCount === 0 ? 1 : previewCount;
}

function extractAvatarUrls(data) {
    const items = (data && data.data) ? data.data : [];
    const urls = [];

    items.forEach((item) => {
        if (!item || !item.avatar) return;
        const avatar = item.avatar;
        if (typeof avatar === 'string' && avatar.trim()) {
            urls.push(avatar.trim());
            return;
        }
        if (typeof avatar === 'object' && avatar.id) {
            urls.push(`https://fdnd.directus.app/assets/${avatar.id}`);
        }
    });

    return urls;
}

function loadAvatarImages(urls) {
    const unique = Array.from(new Set(urls)).filter(Boolean);
    if (!unique.length) {
        avatarImages = [];
        return Promise.resolve([]);
    }

    const loaders = unique.map((url) => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
    }));

    return Promise.all(loaders).then((images) => images.filter(Boolean));
}

function syncPreviewCanvases() {
    if (!previewList || !previewPanel) return;

    const count = getPreviewDisplayCount();

    while (previewCanvases.length < count) {
        const canvasEl = document.createElement('canvas');
        canvasEl.width = 120;
        canvasEl.height = 120;
        previewList.appendChild(canvasEl);
        previewCanvases.push(canvasEl);
        previewContexts.push(canvasEl.getContext('2d'));
    }

    while (previewCanvases.length > count) {
        const canvasEl = previewCanvases.pop();
        previewContexts.pop();
        if (canvasEl && canvasEl.parentNode) {
            canvasEl.parentNode.removeChild(canvasEl);
        }
    }

    previewPanel.style.display = 'flex';
}

function syncNextQueue() {
    const previewCount = getPreviewCountFromDifficulty();

    if (previewCount === 0) {
        nextQueue = [];
        return;
    }

    if (nextQueue.length > previewCount) {
        nextQueue = nextQueue.slice(0, previewCount);
    }

    while (nextQueue.length < previewCount) {
        nextQueue.push(createPiece());
    }
}

function applyPreviewSettings() {
    syncPreviewCanvases();
    syncNextQueue();
    updateNextPreview();
}

function updateMobileStartButton() {
    if (!mobileStartButton) return;
    const shouldShow = isHandheldDevice() && !gameStarted;
    mobileStartButton.hidden = !shouldShow;
}

function updateMobileControlsVisibility() {
    const controls = document.querySelector('.mobile-controls');
    if (!controls) return;
    const shouldShow = isHandheldDevice() && gameStarted;
    controls.style.display = shouldShow ? 'grid' : 'none';
}

function getNextPiece() {
    const previewCount = getPreviewCountFromDifficulty();

    if (previewCount === 0) {
        return createPiece();
    }

    while (nextQueue.length < previewCount) {
        nextQueue.push(createPiece());
    }

    const next = nextQueue.shift();
    nextQueue.push(createPiece());
    updateNextPreview();
    return next || createPiece();
}

function drawNextPreview(ctx, piece) {
    if (!ctx) return;

    const isLightMode = document.body.classList.contains('light-mode');
    const bgColor = isLightMode ? '#fff' : '#000';
    const gridColor = isLightMode ? '#ddd' : '#333';

    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!piece) {
        return;
    }

    ensurePieceImages(piece);

    const matrix = piece.matrix;
    const maxWidth = Math.max(4, matrix[0].length);
    const maxHeight = Math.max(4, matrix.length);
    const block = Math.floor(Math.min(canvas.width / maxWidth, canvas.height / maxHeight));
    const offsetX = Math.floor((canvas.width - matrix[0].length * block) / 2);
    const offsetY = Math.floor((canvas.height - matrix.length * block) / 2);

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    for (let y = 0; y < maxHeight; y++) {
        for (let x = 0; x < maxWidth; x++) {
            ctx.strokeRect(offsetX + x * block, offsetY + y * block, block, block);
        }
    }

    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col]) {
                const cellImage = getPieceCellImage(piece, row, col);
                if (cellImage) {
                    ctx.drawImage(cellImage, offsetX + col * block, offsetY + row * block, block, block);
                } else {
                    ctx.fillStyle = piece.color;
                    ctx.fillRect(offsetX + col * block, offsetY + row * block, block, block);
                }
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeRect(offsetX + col * block, offsetY + row * block, block, block);
            }
        }
    }
}

function updateNextPreview() {
    if (!previewContexts.length) return;

    const previewCount = getPreviewCountFromDifficulty();

    if (previewCount === 0) {
        previewContexts.forEach((ctx) => {
            drawNextPreview(ctx, null);
            const canvas = ctx.canvas;
            ctx.fillStyle = document.body.classList.contains('light-mode') ? '#1a1a1a' : '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No pieces shown', canvas.width / 2, canvas.height / 2);
        });
        return;
    }

    previewContexts.forEach((ctx, index) => {
        drawNextPreview(ctx, nextQueue[index]);
    });
}

// Draw a block
function drawBlock(x, y, cell) {
    let color = cell;
    let image = null;

    if (cell && typeof cell === 'object') {
        color = cell.color || '#666';
        image = cell.image || null;
    }

    if (image && useAvatarBlocks) {
        ctx.drawImage(image, x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    } else {
        ctx.fillStyle = color;
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(x * BLOCK_SIZE + 0.5, y * BLOCK_SIZE + 0.5, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(x * BLOCK_SIZE + 1.5, y * BLOCK_SIZE + 1.5, BLOCK_SIZE - 3, BLOCK_SIZE - 3);
}

// Draw the board
function drawBoard() {
    // Get theme-aware colors
    const isLightMode = document.body.classList.contains('light-mode');
    const bgColor = isLightMode ? '#fff' : '#000';
    const gridColor = isLightMode ? '#ddd' : '#333';
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(canvas.width, y * BLOCK_SIZE);
        ctx.stroke();
    }
    
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(x, y, board[y][x]);
            }
        }
    }
}

// Draw the current piece
function drawPiece() {
    const { matrix, x, y, color } = currentPiece;
    if (!matrix) return;
    ensurePieceImages(currentPiece);
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col]) {
                const image = getPieceCellImage(currentPiece, row, col);
                drawBlock(x + col, y + row, { color, image });
            }
        }
    }
}

function getGhostPieceY() {
    const ghost = {
        matrix: currentPiece.matrix,
        x: currentPiece.x,
        y: currentPiece.y
    };

    while (!collide(ghost)) {
        ghost.y++;
    }

    return ghost.y - 1;
}

function drawGhostPiece() {
    if (!currentPiece.matrix) return;

    const ghostY = getGhostPieceY();
    const { matrix, x, color } = currentPiece;
    ensurePieceImages(currentPiece);

    ctx.save();
    ctx.globalAlpha = 0.35;
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col]) {
                const image = getPieceCellImage(currentPiece, row, col);
                drawBlock(x + col, ghostY + row, { color, image });
            }
        }
    }
    ctx.restore();
}

// Check collision
function collide(piece = currentPiece) {
    const { matrix, x, y } = piece;
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] &&
                (y + row >= ROWS ||
                 x + col < 0 ||
                 x + col >= COLS ||
                 (board[y + row] && board[y + row][x + col]))) {
                return true;
            }
        }
    }
    return false;
}

// Merge piece to board
function merge() {
    const { matrix, x, y, color } = currentPiece;
    ensurePieceImages(currentPiece);
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col]) {
                if (y + row < 0) {
                    gameOver = true;
                    return;
                }
                const image = getPieceCellImage(currentPiece, row, col);
                board[y + row][x + col] = image ? { color, image } : color;
            }
        }
    }
}

// Clear completed lines
function clearLines() {
    let linesCleared = 0;
    
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            row++;
        }
    }
    
    if (linesCleared > 0) {
        const points = linesCleared * 100 * linesCleared;
        updateScore(points);
        if (lineClearAudio) {
            lineClearAudio.currentTime = 0;
            lineClearAudio.play().catch(() => {});
        }
    }
}

// Rotate piece
function rotate(matrix) {
    const rotated = [];
    for (let i = 0; i < matrix[0].length; i++) {
        const row = [];
        for (let j = matrix.length - 1; j >= 0; j--) {
            row.push(matrix[j][i]);
        }
        rotated.push(row);
    }
    return rotated;
}

// Move piece
function move(dir) {
    currentPiece.x += dir;
    if (collide()) {
        currentPiece.x -= dir;
    }
}

// Drop piece
function drop() {
    currentPiece.y++;
    if (collide()) {
        currentPiece.y--;
        merge();
        clearLines();
        thisTurnSaved = false;
        if (gameOver) {
            return;
        }
        
        currentPiece = getNextPiece();
        if (collide()) {
            gameOver = true;
        }
    }
    dropCounter = 0;
}

// Hard drop
function hardDrop() {
    while (!collide()) {
        currentPiece.y++;
    }
    currentPiece.y--;
    drop();
}

// Rotate piece
function rotatePiece() {
    const originalMatrix = currentPiece.matrix;
    const originalImageMatrix = currentPiece.imageMatrix ? currentPiece.imageMatrix.map((row) => row.slice()) : null;
    currentPiece.matrix = rotate(originalMatrix);
    if (currentPiece.imageMatrix) {
        currentPiece.imageMatrix = rotateMatrixClockwise(currentPiece.imageMatrix);
    }
    
    if (collide()) {
        currentPiece.x++;
        if (collide()) {
            currentPiece.x -= 2;
            if (collide()) {
                currentPiece.x++;
                currentPiece.matrix = originalMatrix;
                if (originalImageMatrix) {
                    currentPiece.imageMatrix = originalImageMatrix;
                }
            }
        }
    }
}

let savedPiece;
let thisTurnSaved = false;

// Save piece
function savePiece() {
    if (thisTurnSaved) {return};
    if (savedPiece) {
        const temp = savedPiece;
        savedPiece = currentPiece;
        currentPiece = temp;
        currentPiece.x = Math.floor(COLS / 2) - Math.floor(currentPiece.matrix[0].length / 2);
        currentPiece.y = 0;
    } else {
        savedPiece = currentPiece;
        currentPiece = getNextPiece();
    }
    drawSavedPiecePreview();
    thisTurnSaved = true;
}

// Draw saved piece preview
function drawSavedPiecePreview() {
    const savedPreviewCanvas = document.getElementById('saved-piece-preview');
    if (!savedPreviewCanvas) return;
    if (savedPreviewCanvas.width !== 120) {
        savedPreviewCanvas.width = 120;
    }
    if (savedPreviewCanvas.height !== 120) {
        savedPreviewCanvas.height = 120;
    }
    const savedPreviewCtx = savedPreviewCanvas.getContext('2d');
    if (savedPiece) {
        drawNextPreview(savedPreviewCtx, savedPiece);
    } else {
        const isLightMode = document.body.classList.contains('light-mode');
        const bgColor = isLightMode ? '#fff' : '#000';
        savedPreviewCtx.fillStyle = bgColor;
        savedPreviewCtx.fillRect(0, 0, savedPreviewCanvas.width, savedPreviewCanvas.height);
        savedPreviewCtx.fillStyle = isLightMode ? '#1a1a1a' : '#ffffff';
        savedPreviewCtx.font = 'bold 12px Arial';
        savedPreviewCtx.textAlign = 'center';
        savedPreviewCtx.fillText('No piece saved', savedPreviewCanvas.width / 2, savedPreviewCanvas.height / 2);
    }
}

// Game loop
function update(time = 0) {
    if (!gameStarted) {
        return;
    }
    
    if (!gameOver && !isPaused) {
        const deltaTime = lastTime ? time - lastTime : 0;
        lastTime = time;
        speedElapsed += deltaTime;
        dropInterval = getSpeedAdjustedInterval();
        dropCounter += deltaTime;
        
        if (dropCounter > dropInterval) {
            drop();
        }
    }
    
    draw();
    requestAnimationFrame(update);
}

// Draw everything
function draw() {
    drawBoard();
    if (!gameOver) {
        drawScoreOverlay();
    }
    if (gameOver) {
        drawGameOver();
    } else if (isPaused) {
        drawGhostPiece();
        drawPiece();
        drawPausedOverlay();
    } else {
        drawGhostPiece();
        drawPiece();
    }
}

function drawPausedOverlay() {
    const isLightMode = document.body.classList.contains('light-mode');
    const overlayColor = isLightMode ? 'rgba(255, 255, 255, 0.55)' : 'rgba(0, 0, 0, 0.55)';
    const textColor = isLightMode ? '#1a1a1a' : '#ffffff';

    ctx.save();
    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = textColor;
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    ctx.restore();
}

function drawScoreOverlay() {
    const isLightMode = document.body.classList.contains('light-mode');
    const textColor = isLightMode ? '#1a1a1a' : '#ffffff';
    const shadowColor = isLightMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';

    ctx.save();
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillStyle = shadowColor;
    ctx.fillText(`Score: ${score}`, canvas.width - 10 + 1, 10 + 1);
    ctx.fillStyle = textColor;
    ctx.fillText(`Score: ${score}`, canvas.width - 10, 10);
    ctx.restore();
}

// Draw game over screen
function drawGameOver() {
    // Get theme-aware colors
    const isLightMode = document.body.classList.contains('light-mode');
    const overlayColor = isLightMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)';
    const textColor = isLightMode ? '#1a1a1a' : '#ffffff';
    
    // Semi-transparent overlay
    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Game Over title
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 60);
    
    // Final score
    ctx.fillStyle = textColor;
    ctx.font = '24px Arial';
    ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2 - 10);
    
    // Unlocked sections
    ctx.font = '18px Arial';
    ctx.fillText('You unlocked ' + unlockedSections.size + ' out of ' + UNLOCKS.length + ' sections!', canvas.width / 2, canvas.height / 2 + 30);
    
    // Restart instruction
    ctx.font = '16px Arial';
    ctx.fillStyle = isLightMode ? '#00838f' : '#00ff00';
    ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 70);
}

// Reset game
function resetGame(options = {}) {
    const { keepScore = false } = options;
    board.forEach(row => row.fill(0));
    if (!keepScore) {
        score = 0;
    }
    scoreElement.textContent = score;
    gameOver = false;
    gameStarted = false;
    isPaused = false;
    dropCounter = 0;
    speedElapsed = 0;
    updateDropInterval();
    lastTime = 0;
    if (!keepScore) {
        unlockedSections.clear();
    }
    nextQueue = [];

    Object.keys(pieceDrought).forEach((key) => {
        pieceDrought[key] = 0;
    });

    canvas.classList.remove('is-paused');

    if (tetrisAudio) {
        tetrisAudio.pause();
        tetrisAudio.currentTime = 0;
    }

    if (difficultyWrapper) {
        difficultyWrapper.style.display = 'flex';
    }
    
    if (!keepScore) {
        // Re-lock all sections
        UNLOCKS.forEach(unlock => {
            const section = document.getElementById(unlock.section);
            if (section) {
                section.classList.add('locked');
                section.classList.remove('unlocked');
            }
        });

        resetUnlockBadges();
    }

    checkUnlocks();
    
    drawBoard();
    drawScoreOverlay();
    applyPreviewSettings();
    drawSavedPiecePreview();
    updateMobileStartButton();
    updateMobileControlsVisibility();
    updatePauseButtonState();
}

function togglePause() {
    if (!gameStarted || gameOver) return;
    isPaused = !isPaused;
    canvas.classList.toggle('is-paused', isPaused);
    updatePauseButtonState();
    if (tetrisAudio) {
        if (isPaused) {
            tetrisAudio.pause();
        } else {
            tetrisAudio.play().catch(() => {});
        }
    }
    draw();
}

function updatePauseButtonState() {
    if (!pauseToggleButton) return;
    pauseToggleButton.textContent = isPaused ? 'Resume' : 'Pause';
    pauseToggleButton.setAttribute('aria-label', isPaused ? 'Resume game' : 'Pause game');
}


// Start game
function startGame() {
    if (gameStarted) return;

    if (difficultyWrapper) {
        difficultyWrapper.style.display = 'none';
    }
    
    gameStarted = true;
    gameOver = false;
    isPaused = false;
    speedElapsed = 0;
    updateDropInterval();
    canvas.classList.remove('is-paused');
    currentPiece = getNextPiece();
    checkUnlocks(); // Check if score 0 unlocks anything
    updateNextPreview();
    updateMobileStartButton();
    updateMobileControlsVisibility();
    updatePauseButtonState();
    if (tetrisAudio) {
        tetrisAudio.loop = true;
        tetrisAudio.play().catch(() => {});
    }
    requestAnimationFrame(update);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (gameStarted && ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
        e.preventDefault();
    }

    if (e.key === 'Escape') {
        e.preventDefault();
        togglePause();
        return;
    }
    
    if (!gameStarted) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            startGame();
        }
        return;
    }

    if (isPaused) {
        return;
    }
    
    if (gameOver) {
        if (e.key === ' ') {
            e.preventDefault();
            resetGame({ keepScore: true });
            startGame();
        }
        return;
    }
    
    switch (e.key) {
        case 'ArrowLeft':
            move(-1);
            break;
        case 'ArrowRight':
            move(1);
            break;
        case 'ArrowDown':
            drop();
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case ' ':
            hardDrop();
            break;
    }

    if (e.key === 'c') {
        savePiece();
    }
    
    draw();
});

function handleControlAction(action) {
    if (!gameStarted) {
        startGame();
    }

    if (gameOver) {
        resetGame({ keepScore: true });
        startGame();
    }

    switch (action) {
        case 'left':
            move(-1);
            break;
        case 'right':
            move(1);
            break;
        case 'drop':
            hardDrop();
            break;
        case 'rotate':
            rotatePiece();
            break;
        default:
            return;
    }

    draw();
}

const controlButtons = document.querySelectorAll('.control-btn[data-action]');
controlButtons.forEach((button) => {
    button.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        const action = button.dataset.action;
        handleControlAction(action);
    }, { passive: false });
});

if (mobileStartButton) {
    mobileStartButton.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        if (gameOver) {
            resetGame({ keepScore: true });
        }
        startGame();
    }, { passive: false });
}

if (pauseToggleButton) {
    pauseToggleButton.addEventListener('click', () => {
        togglePause();
    });
}

if (unlockAllButton) {
    unlockAllButton.addEventListener('click', () => {
        unlockAllSections();
    });
}

blockStyleButtons.forEach((button) => {
    button.addEventListener('click', () => {
        applyBlockStyle(button.dataset.style || 'avatars');
    });
});

// Initialize
resetGame();
applyBlockStyle('avatars');

// Display instructions with theme awareness
function displayInstructions() {
    if (isHandheldDevice()) {
        return;
    }
    const isLightMode = document.body.classList.contains('light-mode');
    const textColor = isLightMode ? '#1a1a1a' : '#fff';
    
    ctx.fillStyle = textColor;
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Press SPACE or ENTER', canvas.width / 2, canvas.height / 2 - 15);
    ctx.fillText('to start playing and', canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText('unlock my info!', canvas.width / 2, canvas.height / 2 + 35);
    ctx.fillText('Use Arrow Keys to Move/Rotate', canvas.width / 2, canvas.height / 2 + 60);
    ctx.fillText('and SPACE to Hard Drop', canvas.width / 2, canvas.height / 2 + 85);
}

displayInstructions();
updateMobileStartButton();
updateMobileControlsVisibility();

// Redraw instructions when theme changes
if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                if (!gameStarted) {
                    drawBoard();
                    displayInstructions();
                }
                updateNextPreview();
                drawSavedPiecePreview();
            }
        });
    });
    
    observer.observe(document.body, { attributes: true });
}


// Get all avatar data from api
async function getAvatarData() {
    try {
        const response = await fetch(
            'https://fdnd.directus.app/items/person?fields=avatar&filter[squads][squad_id][tribe][name]=CMD%20Minor%20Web%20Dev&filter[squads][squad_id][cohort]=2526');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        window.avatarData = data;
        const avatarUrls = extractAvatarUrls(data);
        avatarCount = avatarUrls.length;
        const images = await loadAvatarImages(avatarUrls);
        avatarImages = images;
        avatarImageIndex = 0;
        if (currentPiece && currentPiece.matrix) {
            currentPiece.imageMatrix = buildImageMatrix(currentPiece.matrix);
        }
        if (savedPiece && savedPiece.matrix) {
            savedPiece.imageMatrix = buildImageMatrix(savedPiece.matrix);
        }
        if (nextQueue.length) {
            nextQueue = nextQueue.map((piece) => {
                if (!piece || !piece.matrix) return piece;
                return { ...piece, imageMatrix: buildImageMatrix(piece.matrix) };
            });
        }
        updateNextPreview();
        if (!gameStarted) {
            drawBoard();
            displayInstructions();
        } else {
            draw();
        }
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}

getAvatarData();
