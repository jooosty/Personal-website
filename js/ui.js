// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const body = document.body;

const storedTheme = localStorage.getItem('theme');
const themeLock = localStorage.getItem('theme-lock');
const prefersLightQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
const prefersLight = prefersLightQuery ? prefersLightQuery.matches : false;
const systemTheme = prefersLight ? 'light' : 'dark';
const currentTheme = themeLock === 'on' && storedTheme ? storedTheme : systemTheme;

if (currentTheme === 'light') {
    body.classList.add('light-mode');
    themeIcon.textContent = '☀️';
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-mode');

        if (body.classList.contains('light-mode')) {
            themeIcon.textContent = '☀️';
            localStorage.setItem('theme', 'light');
            localStorage.setItem('theme-lock', 'on');
        } else {
            themeIcon.textContent = '🌙';
            localStorage.setItem('theme', 'dark');
            localStorage.setItem('theme-lock', 'on');
        }
    });
}

if (prefersLightQuery) {
    prefersLightQuery.addEventListener('change', (event) => {
        if (localStorage.getItem('theme-lock') === 'on') return;
        const nextTheme = event.matches ? 'light' : 'dark';
        if (nextTheme === 'light') {
            body.classList.add('light-mode');
            themeIcon.textContent = '☀️';
        } else {
            body.classList.remove('light-mode');
            themeIcon.textContent = '🌙';
        }
    });
}

function initGameToggle() {
    const tetrisSection = document.getElementById('tetris-section');
    const minesweeperSection = document.getElementById('minesweeper-section');
    const game2048Section = document.getElementById('game-2048-section');
    const toggleButton = document.getElementById('different-game');

    if (!tetrisSection || !minesweeperSection || !game2048Section || !toggleButton) return;

    const games = [
        { key: 'tetris', label: 'tetris', element: tetrisSection },
        { key: 'minesweeper', label: 'minesweeper', element: minesweeperSection },
        { key: '2048', label: '2048', element: game2048Section }
    ];

    let activeIndex = 0;

    function updateToggleUI() {
        const nextIndex = (activeIndex + 1) % games.length;
        const nextGame = games[nextIndex];
        toggleButton.textContent = `play ${nextGame.label}`;
        toggleButton.setAttribute('aria-label', `Play ${nextGame.label}`);
    }

    function applyVisibility() {
        games.forEach((game, index) => {
            game.element.classList.toggle('is-hidden', index !== activeIndex);
        });

        if (typeof window.setTetrisPaused === 'function') {
            window.setTetrisPaused(games[activeIndex].key !== 'tetris');
        }

        updateToggleUI();
    }

    toggleButton.addEventListener('click', () => {
        activeIndex = (activeIndex + 1) % games.length;
        applyVisibility();
    });

    activeIndex = 0;
    applyVisibility();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGameToggle);
} else {
    initGameToggle();
}

const textBubbleTexts = [
    'DONT TOUCH ME',
    'LEAVE ME ALONE',
    'GO AWAY',
    'STOP IT',
    'BACK OFF',
    'NOT NOW',
    "I'M BUSY",
    'NOPE'
];

function initCarDrive() {
    const layer = document.querySelector('.car-layer');
    if (!layer) return;

    function spawnCar() {
        const car = document.createElement('div');
        car.className = 'car-sprite';
        const isReverse = Math.random() < 0.5;
        if (isReverse) {
            car.classList.add('is-reverse');
        }

        const carImage = document.createElement('img');
        carImage.src = 'media/images/lykan_hypersport_0.png';
        carImage.alt = '';
        carImage.className = 'car-image';
        if (isReverse) {
            carImage.classList.add('is-reverse');
        }
        car.appendChild(carImage);

        car.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (car.dataset.paused === 'true') return;

            car.dataset.paused = 'true';
            car.style.animationPlayState = 'paused';

            const bubble = document.createElement('span');
            bubble.className = 'car-bubble';
            bubble.textContent = textBubbleTexts[Math.floor(Math.random() * textBubbleTexts.length)];
            car.appendChild(bubble);

            setTimeout(() => {
                bubble.remove();
                car.style.animationPlayState = 'running';
                car.dataset.paused = 'false';
            }, 3000);
        });

        layer.appendChild(car);
        car.addEventListener('animationend', () => {
            car.remove();
        });
    }

    function scheduleNext() {
        const delay = 5000 + Math.random() * 10000;
        setTimeout(() => {
            spawnCar();
            scheduleNext();
        }, delay);
    }

    scheduleNext();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarDrive);
} else {
    initCarDrive();
}
