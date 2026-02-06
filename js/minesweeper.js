class Minesweeper {
    constructor(rows = 8, cols = 8, mines = 10) {
        this.rows = rows;
        this.cols = cols;
        this.mineCount = mines;
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.initializeBoard();
    }

    initializeBoard() {
        // Create empty board
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
        this.revealed = Array(this.rows).fill(null).map(() => Array(this.cols).fill(false));
        this.flagged = Array(this.rows).fill(null).map(() => Array(this.cols).fill(false));

        // Place mines randomly
        let placed = 0;
        while (placed < this.mineCount) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            if (this.board[row][col] !== 'M') {
                this.board[row][col] = 'M';
                placed++;
            }
        }

        // Calculate numbers
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c] !== 'M') {
                    this.board[r][c] = this.countAdjacentMines(r, c);
                }
            }
        }
    }

    countAdjacentMines(row, col) {
        let count = 0;
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === 'M') {
                    count++;
                }
            }
        }
        return count;
    }

    reveal(row, col) {
        if (this.revealed[row][col] || this.flagged[row][col]) return false;
        
        this.revealed[row][col] = true;
        
        if (this.board[row][col] === 'M') return 'gameOver';
        
        if (this.board[row][col] === 0) {
            for (let r = row - 1; r <= row + 1; r++) {
                for (let c = col - 1; c <= col + 1; c++) {
                    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols && !this.revealed[r][c]) {
                        this.reveal(r, c);
                    }
                }
            }
        }
        return true;
    }

    toggleFlag(row, col) {
        if (!this.revealed[row][col]) {
            this.flagged[row][col] = !this.flagged[row][col];
        }
    }

    isWon() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c] !== 'M' && !this.revealed[r][c]) return false;
            }
        }
        return true;
    }
}

const MINESWEEPER_SIZES = [5, 7, 9, 11, 13];
const MINESWEEPER_DIFFICULTY_PERCENTS = [0.01, 0.12, 0.16, 0.20, 0.24];
const MINESWEEPER_CELL_SIZE = 32;
const MINESWEEPER_NUMBER_POINTS = [5, 10, 15, 25, 40, 60, 80, 100, 120];
const MINESWEEPER_DIFFICULTY_MULTIPLIERS = [1, 1.1, 1.2, 1.3, 1.4];

function initMinesweeper() {
    const boardEl = document.getElementById('minesweeper-board');
    const minesLeftEl = document.getElementById('mines-left');
    const scoreEl = document.getElementById('minesweeper-score');
    const resetButton = document.getElementById('minesweeper-reset');
    const infoEl = document.querySelector('.minesweeper-info');
    const sizeInput = document.getElementById('minesweeper-size');
    const difficultyInput = document.getElementById('minesweeper-difficulty');
    const sizeValueEl = document.getElementById('minesweeper-size-value');
    const difficultyValueEl = document.getElementById('minesweeper-difficulty-value');

    if (!boardEl || !minesLeftEl) return;

    let game = null;
    let isGameOver = false;
    let statusEl = null;
    let score = 0;
    let scored = [];

    if (infoEl) {
        statusEl = infoEl.querySelector('.minesweeper-status');
        if (!statusEl) {
            statusEl = document.createElement('p');
            statusEl.className = 'minesweeper-status';
            infoEl.appendChild(statusEl);
        }
    }

    boardEl.setAttribute('role', 'grid');

    function getCellSizeValue() {
        if (!boardEl) return MINESWEEPER_CELL_SIZE;
        const raw = getComputedStyle(boardEl).getPropertyValue('--ms-cell');
        const parsed = Number.parseFloat(raw);
        return Number.isNaN(parsed) ? MINESWEEPER_CELL_SIZE : parsed;
    }

    function getSliderIndex(inputEl) {
        const raw = inputEl ? Number.parseInt(inputEl.value, 10) : 3;
        if (Number.isNaN(raw)) return 2;
        return Math.min(5, Math.max(1, raw)) - 1;
    }

    function getCurrentSettings() {
        const sizeIndex = getSliderIndex(sizeInput);
        const difficultyIndex = getSliderIndex(difficultyInput);
        const size = MINESWEEPER_SIZES[sizeIndex] || 9;
        const percent = MINESWEEPER_DIFFICULTY_PERCENTS[difficultyIndex] || 0.15;
        const multiplier = MINESWEEPER_DIFFICULTY_MULTIPLIERS[difficultyIndex] || 1;
        const cells = size * size;
        const mines = Math.max(1, Math.min(cells - 1, Math.round(cells * percent)));
        return { size, percent, mines, multiplier };
    }

    function updateControlLabels() {
        if (!sizeValueEl || !difficultyValueEl) return;
        const { size, percent } = getCurrentSettings();
        sizeValueEl.textContent = `${size}x${size}`;
        difficultyValueEl.textContent = `${Math.round(percent * 100)}%`;
    }

    function createGameFromSettings(options = {}) {
        const { keepScore = false } = options;
        const { size, mines } = getCurrentSettings();
        game = new Minesweeper(size, size, mines);
        isGameOver = false;
        const cellSize = getCellSizeValue();
        boardEl.style.gridTemplateColumns = `repeat(${game.cols}, ${cellSize}px)`;
        scored = Array.from({ length: game.rows }, () => Array(game.cols).fill(false));
        if (!keepScore) {
            score = 0;
        }
        updateScore();
        setStatus('', '');
        renderBoard();
    }

    function countFlags() {
        return game.flagged.flat().filter(Boolean).length;
    }

    function updateMinesLeft() {
        const minesLeft = Math.max(0, game.mineCount - countFlags());
        minesLeftEl.textContent = minesLeft;
    }

    function updateScore() {
        if (!scoreEl) return;
        scoreEl.textContent = String(score);
        if (typeof window.setExternalUnlockScore === 'function') {
            window.setExternalUnlockScore(score);
        }
    }

    function setMinesweeperScore(value) {
        const numeric = Number(value);
        score = Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : 0;
        updateScore();
    }

    function getMinesweeperScore() {
        return score;
    }

    function setStatus(message, state) {
        if (!statusEl) return;
        statusEl.textContent = message || '';
        statusEl.dataset.state = state || '';
    }

    function revealAllMines() {
        for (let r = 0; r < game.rows; r++) {
            for (let c = 0; c < game.cols; c++) {
                if (game.board[r][c] === 'M') {
                    game.revealed[r][c] = true;
                }
            }
        }
    }

    function renderBoard() {
        const fragment = document.createDocumentFragment();

        for (let r = 0; r < game.rows; r++) {
            for (let c = 0; c < game.cols; c++) {
                const cell = document.createElement('button');
                cell.type = 'button';
                cell.className = 'minesweeper-cell';
                cell.dataset.row = String(r);
                cell.dataset.col = String(c);

                if (game.flagged[r][c]) {
                    cell.classList.add('is-flagged');
                    cell.textContent = '🚩';
                }

                if (game.revealed[r][c]) {
                    cell.classList.add('is-revealed');
                    const value = game.board[r][c];
                    if (value === 'M') {
                        cell.classList.add('is-mine');
                        cell.textContent = '💣';
                    } else if (value > 0) {
                        cell.textContent = String(value);
                        cell.classList.add(`minesweeper-n${value}`);
                    }
                }

                fragment.appendChild(cell);
            }
        }

        boardEl.innerHTML = '';
        boardEl.appendChild(fragment);
        updateMinesLeft();
        updateScore();
    }

    function applyRevealScore() {
        const { multiplier } = getCurrentSettings();
        let delta = 0;

        for (let r = 0; r < game.rows; r++) {
            for (let c = 0; c < game.cols; c++) {
                if (!game.revealed[r][c] || scored[r][c]) continue;
                const value = game.board[r][c];
                if (value === 'M') continue;
                scored[r][c] = true;
                delta += MINESWEEPER_NUMBER_POINTS[value] || 0;
            }
        }

        if (delta > 0) {
            score = Math.max(0, Math.round(score + delta * multiplier));
        }
    }

    function handleReveal(cell) {
        if (isGameOver) return;
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);
        const result = game.reveal(row, col);

        applyRevealScore();

        if (result === 'gameOver') {
            isGameOver = true;
            revealAllMines();
            setStatus('Game Over', 'lose');
            const { multiplier } = getCurrentSettings();
            score = Math.max(0, Math.round(score - 50 * multiplier));
        } else if (game.isWon()) {
            isGameOver = true;
            revealAllMines();
            setStatus('You Win!', 'win');
            const { multiplier } = getCurrentSettings();
            const winBonus = Math.round((game.rows * game.cols + game.mineCount * 10) * multiplier);
            score = Math.max(0, score + winBonus);
        } else {
            setStatus('', '');
        }

        renderBoard();
    }

    function handleFlag(cell) {
        if (isGameOver) return;
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);
        game.toggleFlag(row, col);
        renderBoard();
    }

    boardEl.addEventListener('click', (event) => {
        const cell = event.target.closest('.minesweeper-cell');
        if (!cell || !boardEl.contains(cell)) return;
        handleReveal(cell);
    });

    boardEl.addEventListener('contextmenu', (event) => {
        const cell = event.target.closest('.minesweeper-cell');
        if (!cell || !boardEl.contains(cell)) return;
        event.preventDefault();
        handleFlag(cell);
    });

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            createGameFromSettings({ keepScore: true });
        });
    }

    if (sizeInput) {
        sizeInput.addEventListener('input', () => {
            updateControlLabels();
            createGameFromSettings({ keepScore: true });
        });
    }

    if (difficultyInput) {
        difficultyInput.addEventListener('input', () => {
            updateControlLabels();
            createGameFromSettings({ keepScore: true });
        });
    }

    updateControlLabels();
    createGameFromSettings({ keepScore: true });

    window.addEventListener('resize', () => {
        if (!game) return;
        const cellSize = getCellSizeValue();
        boardEl.style.gridTemplateColumns = `repeat(${game.cols}, ${cellSize}px)`;
    });

    window.setMinesweeperScore = setMinesweeperScore;
    window.getMinesweeperScore = getMinesweeperScore;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMinesweeper);
} else {
    initMinesweeper();
}