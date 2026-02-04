// inspiration from: https://codepen.io/Ryan-1957/pen/OJKLweb

// Tetris Game with Unlock System
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Set canvas size
const BLOCK_SIZE = 30;
const ROWS = 20;
const COLS = 10;
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

// Game state
let score = 0;
let gameOver = false;
let gameStarted = false;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

// Unlock thresholds
const UNLOCKS = [
    { score: 0, section: 'name' },
    { score: 100, section: 'age' },
    { score: 200, section: 'location' },
    { score: 400, section: 'hobbies-list' },
    { score: 800, section: 'course-list' },
    { score: 1600, section: 'occupation-list' },
    { score: 3200, section: 'learning-goals' }
];

let unlockedSections = new Set();

// Set unlock badge text from UNLOCKS
function updateUnlockBadges() {
    const badges = document.querySelectorAll('.unlock-badge[data-section]');
    badges.forEach(badge => {
        const sectionId = badge.dataset.section;
        const unlock = UNLOCKS.find(item => item.section === sectionId);
        if (!unlock) return;
        badge.textContent = `Unlock at ${unlock.score} pts`;
    });
}

updateUnlockBadges();

// Create the game board
const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

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

// Current piece
let currentPiece = {
    shape: null,
    color: null,
    x: 0,
    y: 0,
    matrix: null
};

// Check and unlock sections based on score
function checkUnlocks() {
    UNLOCKS.forEach(unlock => {
        if (score >= unlock.score && !unlockedSections.has(unlock.section)) {
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
        
        // Remove the unlock badge
        const badge = document.querySelector(`.unlock-badge[data-section="${sectionId}"]`);
        if (badge) {
            badge.textContent = 'Unlocked!';
            badge.style.background = 'rgba(0, 255, 0, 0.2)';
            badge.style.borderColor = '#00ff00';
            badge.style.color = '#00ff00';
            setTimeout(() => {
                if (badge) badge.remove();
            }, 2000);
        }
        
        // Play unlock sound effect (visual feedback)
        section.style.transform = 'scale(1.05)';
        setTimeout(() => {
            section.style.transform = 'scale(1)';
        }, 300);
    }
}

// Update score and check unlocks
function updateScore(points) {
    score += points;
    scoreElement.textContent = score;
    checkUnlocks();
}

// Create a new piece
function createPiece() {
    const shapes = Object.keys(SHAPES);
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    const shape = SHAPES[randomShape];
    
    return {
        shape: randomShape,
        color: COLORS[randomShape],
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0,
        matrix: shape
    };
}

// Draw a block
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// Draw the board
function drawBoard() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#333';
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
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col]) {
                drawBlock(x + col, y + row, color);
            }
        }
    }
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
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col]) {
                if (y + row < 0) {
                    gameOver = true;
                    return;
                }
                board[y + row][x + col] = color;
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
        
        if (gameOver) {
            return;
        }
        
        currentPiece = createPiece();
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
    currentPiece.matrix = rotate(originalMatrix);
    
    if (collide()) {
        currentPiece.x++;
        if (collide()) {
            currentPiece.x -= 2;
            if (collide()) {
                currentPiece.x++;
                currentPiece.matrix = originalMatrix;
            }
        }
    }
}

// Game loop
function update(time = 0) {
    if (!gameStarted) {
        return;
    }
    
    if (!gameOver) {
        const deltaTime = time - lastTime;
        lastTime = time;
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
    if (gameOver) {
        drawGameOver();
    } else {
        drawPiece();
    }
}

// Draw game over screen
function drawGameOver() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Game Over title
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 60);
    
    // Final score
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2 - 10);
    
    // Unlocked sections
    ctx.font = '18px Arial';
    ctx.fillText('You unlocked ' + unlockedSections.size + ' out of ' + UNLOCKS.length + ' sections!', canvas.width / 2, canvas.height / 2 + 30);
    
    // Restart instruction
    ctx.font = '16px Arial';
    ctx.fillStyle = '#00ff00';
    ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 70);
}

// Reset game
function resetGame() {
    board.forEach(row => row.fill(0));
    score = 0;
    scoreElement.textContent = score;
    gameOver = false;
    gameStarted = false;
    dropCounter = 0;
    lastTime = 0;
    unlockedSections.clear();
    
    // Re-lock all sections
    UNLOCKS.forEach(unlock => {
        const section = document.getElementById(unlock.section);
        if (section) {
            section.classList.add('locked');
            section.classList.remove('unlocked');
        }
    });
    
    drawBoard();
}

// Start game
function startGame() {
    if (gameStarted) return;
    
    gameStarted = true;
    gameOver = false;
    currentPiece = createPiece();
    checkUnlocks(); // Check if score 0 unlocks anything
    requestAnimationFrame(update);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (gameStarted && ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    if (!gameStarted) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            startGame();
        }
        return;
    }
    
    if (gameOver) {
        if (e.key === ' ') {
            e.preventDefault();
            resetGame();
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
    
    draw();
});

// Initialize
resetGame();

// Display instructions
ctx.fillStyle = '#fff';
ctx.font = '18px Arial';
ctx.textAlign = 'center';
ctx.fillText('Press SPACE or ENTER', canvas.width / 2, canvas.height / 2 - 15);
ctx.fillText('to start playing and', canvas.width / 2, canvas.height / 2 + 10);
ctx.fillText('unlock my info!', canvas.width / 2, canvas.height / 2 + 35);
ctx.fillText('Use Arrow Keys to Move/Rotate', canvas.width / 2, canvas.height / 2 + 60);
ctx.fillText('and SPACE to Hard Drop', canvas.width / 2, canvas.height / 2 + 85);