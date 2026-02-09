class Game2048 {
    constructor() {
        this.grid = Array(4).fill(null).map(() => Array(4).fill(0));
        this.score = 0;
        this.addNewTile();
        this.addNewTile();
    }

    addNewTile() {
        const empty = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) empty.push({x: i, y: j});
            }
        }
        if (empty.length > 0) {
            const {x, y} = empty[Math.floor(Math.random() * empty.length)];
            this.grid[x][y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    move(direction) {
        const moved = this.slideAndMerge(direction);
        if (moved) this.addNewTile();
        return moved;
    }

    slideAndMerge(direction) {
        let changed = false;
        const grid = this.grid.map(row => [...row]);

        if (direction === 'left' || direction === 'right') {
            for (let i = 0; i < 4; i++) {
                if (direction === 'right') grid[i].reverse();
                const merged = this.mergeLine(grid[i]);
                if (JSON.stringify(merged) !== JSON.stringify(grid[i])) changed = true;
                grid[i] = merged;
                if (direction === 'right') grid[i].reverse();
            }
        } else {
            for (let j = 0; j < 4; j++) {
                let col = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]];
                if (direction === 'down') col.reverse();
                const merged = this.mergeLine(col);
                if (JSON.stringify(merged) !== JSON.stringify(col)) changed = true;
                col = merged;
                if (direction === 'down') col.reverse();
                for (let i = 0; i < 4; i++) grid[i][j] = col[i];
            }
        }
        this.grid = grid;
        return changed;
    }

    mergeLine(line) {
        let arr = line.filter(val => val);
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                this.score += arr[i];
                arr.splice(i + 1, 1);
            }
        }
        while (arr.length < 4) arr.push(0);
        return arr;
    }

    isGameOver() {
        if (this.grid.some(row => row.includes(0))) return false;
        const prevGrid = this.grid.map(row => [...row]);
        const prevScore = this.score;
        for (let direction of ['left', 'right', 'up', 'down']) {
            this.slideAndMerge(direction);
            if (JSON.stringify(this.grid) !== JSON.stringify(prevGrid)) {
                this.grid = prevGrid;
                this.score = prevScore;
                return false;
            }
            this.grid = prevGrid.map(row => [...row]);
            this.score = prevScore;
        }
        return true;
    }

    getGrid() {
        return this.grid;
    }

    getScore() {
        return this.score;
    }

    reset(keepScore = false) {
        this.grid = Array(4).fill(null).map(() => Array(4).fill(0));
        if (!keepScore) {
            this.score = 0;
        }
        this.addNewTile();
        this.addNewTile();
    }
}

function init2048() {
    const board = document.getElementById('game-2048');
    const scoreEl = document.getElementById('score-2048');
    const resetBtn = document.getElementById('reset-2048');
    const controls = document.querySelector('.game-controls');
    const section = document.getElementById('game-2048-section');

    if (!board || !scoreEl || !resetBtn) return;

    const game = new Game2048();
    const cells = [];
    const statusEl = document.createElement('p');
    statusEl.className = 'game-2048-status';
    statusEl.textContent = '';
    scoreEl.closest('.game-info')?.appendChild(statusEl);
    let suppressSharedSync = false;

    function set2048Score(value) {
        const numeric = Number(value);
        game.score = Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : 0;
        suppressSharedSync = true;
        render();
        suppressSharedSync = false;
    }

    function get2048Score() {
        return game.getScore();
    }

    function buildGrid() {
        board.innerHTML = '';
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'tile';
            cell.dataset.value = '0';
            fragment.appendChild(cell);
            cells.push(cell);
        }
        board.appendChild(fragment);
    }

    function render() {
        const grid = game.getGrid();
        let index = 0;
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const value = grid[row][col];
                const cell = cells[index];
                cell.dataset.value = String(value);
                cell.textContent = value ? String(value) : '';
                index += 1;
            }
        }
        scoreEl.textContent = String(game.getScore());
        statusEl.textContent = game.isGameOver() ? 'Game over' : '';
        if (!suppressSharedSync && typeof window.setSharedScore === 'function') {
            window.setSharedScore(game.getScore(), '2048');
        } else if (!suppressSharedSync && typeof window.setExternalUnlockScore === 'function') {
            window.setExternalUnlockScore(game.getScore());
        }
    }

    let slideTimer = null;

    function is2048Active() {
        return !section || !section.classList.contains('is-hidden');
    }

    function triggerSlide(direction) {
        let slideX = 0;
        let slideY = 0;
        const distance = 10;

        if (direction === 'left') slideX = -distance;
        if (direction === 'right') slideX = distance;
        if (direction === 'up') slideY = -distance;
        if (direction === 'down') slideY = distance;

        board.style.setProperty('--slide-x', `${slideX}px`);
        board.style.setProperty('--slide-y', `${slideY}px`);
        board.classList.remove('is-sliding');
        void board.offsetWidth;
        board.classList.add('is-sliding');

        if (slideTimer) {
            clearTimeout(slideTimer);
        }
        slideTimer = setTimeout(() => {
            board.classList.remove('is-sliding');
        }, 160);
    }

    function handleMove(direction) {
        if (!is2048Active()) return;
        const moved = game.move(direction);
        if (moved) {
            triggerSlide(direction);
            render();
        }
    }

    buildGrid();
    render();

    document.addEventListener('keydown', (e) => {
        if (!is2048Active()) return;
        const keys = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
        const direction = keys[e.key];
        if (!direction) return;
        e.preventDefault();
        handleMove(direction);
    });

    controls?.addEventListener('click', (event) => {
        if (!is2048Active()) return;
        const target = event.target.closest('[data-action]');
        if (!target) return;
        const direction = target.dataset.action;
        handleMove(direction);
    });

    resetBtn.addEventListener('click', () => {
        const keepScore = game.isGameOver();
        game.reset(keepScore);
        statusEl.textContent = '';
        render();
    });

    window.set2048Score = set2048Score;
    window.get2048Score = get2048Score;

    if (typeof window.getSharedScore === 'function') {
        set2048Score(window.getSharedScore());
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init2048);
} else {
    init2048();
}