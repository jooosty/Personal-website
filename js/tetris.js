// Tetris Game
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Set canvas size
const BLOCK_SIZE = 20;
const ROWS = 22;
const COLS = 10;
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

// Game state
let score = 0;
let gameOver = false;
let gameStarted = false;
let dropCounter = 0;
let dropInterval = 1000; // milliseconds
let lastTime = 0;

// Create the game board
const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// Tetromino shapes
// I = straight, 
// O = square, 
// T = T-shape, 
// S = S-shape right, 
// Z = S-shape left,
// J = L-shape left,
// L = L-shape right
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
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// Draw the board
function drawBoard() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
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
                    // Game over
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
            row++; // Check same row again
        }
    }
    
    if (linesCleared > 0) {
        score += linesCleared * 100 * linesCleared; // More points for multiple lines
        scoreElement.textContent = score;
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
            alert('Game Over! Score: ' + score);
            resetGame();
            return;
        }
        
        currentPiece = createPiece();
        if (collide()) {
            gameOver = true;
            alert('Game Over! Score: ' + score);
            resetGame();
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
        // Try wall kicks
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
    if (!gameStarted || gameOver) {
        return;
    }
    
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    
    if (dropCounter > dropInterval) {
        drop();
    }
    
    draw();
    requestAnimationFrame(update);
}

// Draw everything
function draw() {
    drawBoard();
    drawPiece();
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
    drawBoard();
}

// Start game
function startGame() {
    if (gameStarted) return;
    
    gameStarted = true;
    gameOver = false;
    currentPiece = createPiece();
    requestAnimationFrame(update);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    // Prevent default behavior for arrow keys and space when game is active
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
    
    if (gameOver) return;

    if (gameStarted) {
        if (e.key === 'r') {
            resetGame();
            startGame();
            return;
        }
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
ctx.font = '14px Arial';
ctx.textAlign = 'center';
ctx.fillText('Press SPACE or ENTER', canvas.width / 2, canvas.height / 2 - 10);
ctx.fillText('to start', canvas.width / 2, canvas.height / 2 + 10);