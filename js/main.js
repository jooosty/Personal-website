const apiUrl = "https://fdnd.directus.app/items/person?filter[id]=297";

// Store fetched data privately
const apiData = {};

// Shared score state across games.
const sharedScoreState = { value: 0 };

function normalizeSharedScore(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : 0;
}

function applySharedScore(source) {
    if (source !== 'tetris' && typeof window.setTetrisScore === 'function') {
        window.setTetrisScore(sharedScoreState.value);
    }
    if (source !== 'minesweeper' && typeof window.setMinesweeperScore === 'function') {
        window.setMinesweeperScore(sharedScoreState.value);
    }
    if (source !== '2048' && typeof window.set2048Score === 'function') {
        window.set2048Score(sharedScoreState.value);
    }
    if (typeof window.setExternalUnlockScore === 'function') {
        window.setExternalUnlockScore(sharedScoreState.value);
    }
}

window.setSharedScore = function setSharedScore(value, source) {
    sharedScoreState.value = normalizeSharedScore(value);
    applySharedScore(source);
};

window.getSharedScore = function getSharedScore() {
    return sharedScoreState.value;
};

// Lorem Ipsum text for generating placeholders
const loremWords = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi'];

// Generate Lorem Ipsum text of specific length
function generateLoremIpsum(length) {
    let text = '';
    let wordIndex = 0;
    while (text.length < length) {
        if (text.length > 0) text += ' ';
        text += loremWords[wordIndex % loremWords.length];
        wordIndex++;
    }
    return text.substring(0, length);
}

// Set placeholder for a single text element
function setPlaceholder(elementId, dataValue) {
    if (!elementId || !dataValue) return;
    const element = document.getElementById(elementId);
    if (element) {
        const placeholder = generateLoremIpsum(String(dataValue).length);
        element.textContent = placeholder;
    }
}

// Set placeholders for list items
function setPlaceholdersList(listId, dataArray) {
    if (!listId || !Array.isArray(dataArray)) return;
    const ul = document.getElementById(listId);
    if (!ul) return;
    
    ul.innerHTML = '';
    dataArray.forEach(item => {
        const li = document.createElement('li');
        const placeholder = generateLoremIpsum(String(item).length);
        li.textContent = placeholder;
        ul.appendChild(li);
    });
}

async function loadAPI() {
    try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Network response was not ok");
        const payload = await res.json();
        const person = Array.isArray(payload.data) ? payload.data[0] : null;
        if (!person) throw new Error("No person data found");

        let customData = {};
        if (typeof person.custom === "string" && person.custom.trim()) {
            try {
                customData = JSON.parse(person.custom);
            } catch (parseErr) {
                console.error("Failed to parse custom data:", parseErr);
            }
        }

        apiData.name = person.name || "";
        apiData.age = customData.age ?? "";
        apiData.location = customData.location || "";
        apiData.hobbies = Array.isArray(customData.hobbies) ? customData.hobbies : [];
        apiData.occupation = Array.isArray(customData.occupation) ? customData.occupation : [];
        apiData.learningGoals = Array.isArray(customData.learning_goals) ? customData.learning_goals : [];
        apiData.course = Array.isArray(customData.courses) ? customData.courses : [];
        apiData.languages = Array.isArray(customData.languages) ? customData.languages : [];

        setPlaceholder('name', apiData.name);
        setPlaceholder('age', apiData.age);
        setPlaceholder('location', apiData.location);
        setPlaceholdersList('hobbies-list', apiData.hobbies);
        setPlaceholdersList('occupation-list', apiData.occupation);
        setPlaceholdersList('learning-goals', apiData.learningGoals);
        setPlaceholdersList('course-list', apiData.course);
        setPlaceholdersList('languages-list', apiData.languages);

        const sections = [
            { section: 'name', elementId: 'name' },
            { section: 'age', elementId: 'age' },
            { section: 'location', elementId: 'location' },
            { section: 'hobbies-list', elementId: 'hobbies-list' },
            { section: 'course-list', elementId: 'course-list' },
            { section: 'occupation-list', elementId: 'occupation-list' },
            { section: 'learning-goals', elementId: 'learning-goals' },
            { section: 'languages-list', elementId: 'languages-list' }
        ];

        sections.forEach(({ section, elementId }) => {
            const element = document.getElementById(elementId);
            if (!element || element.classList.contains('locked')) return;
            displaySectionData(section);
        });
    } catch (err) {
        console.error("Failed to load API data:", err);
    }
}

// Display data in DOM when section unlocks
function displaySectionData(sectionId) {
    if (sectionId === 'name') {
        document.getElementById("name").textContent = apiData.name || "Failed to load.";
    } else if (sectionId === 'age') {
        document.getElementById("age").textContent = apiData.age || "Failed to load.";
    } else if (sectionId === 'location') {
        document.getElementById("location").textContent = apiData.location || "Failed to load.";
    } else if (sectionId === 'hobbies-list') {
        const ul = document.getElementById("hobbies-list");
        ul.innerHTML = "";
        if (apiData.hobbies && apiData.hobbies.length > 0) {
            apiData.hobbies.forEach(h => {
                const li = document.createElement("li");
                li.textContent = h;
                ul.appendChild(li);
            });
        } else {
            ul.textContent = "No hobbies found.";
        }
    } else if (sectionId === 'occupation-list') {
        const ul = document.getElementById("occupation-list");
        ul.innerHTML = "";
        if (apiData.occupation && apiData.occupation.length > 0) {
            apiData.occupation.forEach(o => {
                const li = document.createElement("li");
                li.textContent = o;
                ul.appendChild(li);
            });
        } else {
            ul.textContent = "No occupation found.";
        }
    } else if (sectionId === 'course-list') {
        const ul = document.getElementById("course-list");
        ul.innerHTML = "";
        if (apiData.course && apiData.course.length > 0) {
            apiData.course.forEach(c => {
                const li = document.createElement("li");
                li.textContent = c;
                ul.appendChild(li);
            });
        } else {
            ul.textContent = "No course found.";
        }
    } else if (sectionId === 'learning-goals') {
        const ul = document.getElementById("learning-goals");
        ul.innerHTML = "";
        if (apiData.learningGoals && apiData.learningGoals.length > 0) {
            apiData.learningGoals.forEach(g => {
                const li = document.createElement("li");
                li.textContent = g;
                ul.appendChild(li);
            });
        } else {
            ul.textContent = "No learning goals found.";
        }
    } else if (sectionId === 'languages-list') {
        const ul = document.getElementById("languages-list");
        ul.innerHTML = "";
        if (apiData.languages && apiData.languages.length > 0) {
            apiData.languages.forEach(l => {
                const li = document.createElement("li");
                li.textContent = l;
                ul.appendChild(li);
            });
        } else {
            ul.textContent = "No languages found.";
        }
    }
}

// Load on page ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        loadAPI();
    });
} else {
    loadAPI();
}

// Theme Toggle Functionality
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const body = document.body;

// Check for saved theme preference or default to system preference
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

// Toggle theme on button click
themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    
    // Update icon and save preference
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

const rollSequence = ['r', 'o', 'l', 'l'];
let rollIndex = 0;
let rollTimeoutId = null;
const konamiSequence = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
let konamiIndex = 0;
let konamiTimeoutId = null;
const tetrisSequence = ['t', 'e', 't', 'r', 'i', 's'];
let tetrisIndex = 0;
let tetrisTimeoutId = null;
const scanSequence = ['s', 'c', 'a', 'n'];
let scanIndex = 0;
let scanTimeoutId = null;
let zHoldTimer = null;
let zTriggered = false;
let scrollLockTimeoutId = null;

function setScrollLock(durationMs) {
    document.body.classList.add('no-scroll');
    if (scrollLockTimeoutId) {
        clearTimeout(scrollLockTimeoutId);
    }
    scrollLockTimeoutId = setTimeout(() => {
        document.body.classList.remove('no-scroll');
    }, durationMs);
}

function triggerBarrelRoll() {
    setScrollLock(1300);
    document.body.classList.remove('barrel-roll');
    void document.body.offsetWidth;
    document.body.classList.add('barrel-roll');
    setTimeout(() => {
        document.body.classList.remove('barrel-roll');
    }, 1300);
}

function handleRollSequence(key) {
    if (key === rollSequence[rollIndex]) {
        rollIndex += 1;
        if (rollIndex === rollSequence.length) {
            triggerBarrelRoll();
            rollIndex = 0;
        }
    } else {
        rollIndex = key === rollSequence[0] ? 1 : 0;
    }

    if (rollTimeoutId) {
        clearTimeout(rollTimeoutId);
    }

    rollTimeoutId = setTimeout(() => {
        rollIndex = 0;
    }, 1200);
}

function triggerMeteorShower() {
    setScrollLock(5000);
    const layer = document.createElement('div');
    layer.className = 'meteor-layer';

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 1000; i += 1) {
        const meteor = document.createElement('span');
        meteor.className = 'meteor';
        const startX = Math.random() * 110 - 10;
        const delay = (Math.random() * 1.5).toFixed(2);
        const duration = (1.2 + Math.random() * 1.8).toFixed(2);
        const size = (2 + Math.random() * 4).toFixed(1);
        meteor.style.setProperty('--x', `${startX}vw`);
        meteor.style.setProperty('--delay', `${delay}s`);
        meteor.style.setProperty('--duration', `${duration}s`);
        meteor.style.setProperty('--size', `${size}px`);
        fragment.appendChild(meteor);
    }

    layer.appendChild(fragment);
    document.body.appendChild(layer);

    setTimeout(() => {
        layer.remove();
    }, 5000);
}

function triggerTetrisConfetti() {
    setScrollLock(4500);
    const layer = document.createElement('div');
    layer.className = 'tetris-confetti-layer';

    const colors = ['#00f0f0', '#f0f000', '#a000f0', '#00f000', '#f00000', '#0000f0', '#f0a000'];
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 1000; i += 1) {
        const confetti = document.createElement('span');
        confetti.className = 'tetris-confetti';
        const x = Math.random() * 100;
        const delay = (Math.random() * 0.8).toFixed(2);
        const duration = (2.5 + Math.random() * 2).toFixed(2);
        const size = 10 + Math.floor(Math.random() * 10);
        const rotate = Math.floor(Math.random() * 360);
        confetti.style.setProperty('--x', `${x}vw`);
        confetti.style.setProperty('--delay', `${delay}s`);
        confetti.style.setProperty('--duration', `${duration}s`);
        confetti.style.setProperty('--size', `${size}px`);
        confetti.style.setProperty('--rotate', `${rotate}deg`);
        confetti.style.background = colors[i % colors.length];
        fragment.appendChild(confetti);
    }

    layer.appendChild(fragment);
    document.body.appendChild(layer);

    setTimeout(() => {
        layer.remove();
    }, 4500);
}

function triggerScanlineSweep() {
    setScrollLock(18000);
    const layer = document.createElement('div');
    layer.className = 'scanline-layer';
    const line = document.createElement('div');
    line.className = 'scanline';
    layer.appendChild(line);
    document.body.appendChild(layer);

    setTimeout(() => {
        layer.remove();
    }, 18200);
}

function triggerSlowmoPulse() {
    if (document.body.classList.contains('slowmo-pulse')) return;
    document.body.classList.remove('slowmo-pulse');
    void document.body.offsetWidth;
    document.body.classList.add('slowmo-pulse');
    setTimeout(() => {
        document.body.classList.remove('slowmo-pulse');
    }, 1900);
}

function handleKonamiSequence(key) {
    if (key === konamiSequence[konamiIndex]) {
        konamiIndex += 1;
        if (konamiIndex === konamiSequence.length) {
            triggerMeteorShower();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = key === konamiSequence[0] ? 1 : 0;
    }

    if (konamiTimeoutId) {
        clearTimeout(konamiTimeoutId);
    }

    konamiTimeoutId = setTimeout(() => {
        konamiIndex = 0;
    }, 1500);
}

function handleTetrisSequence(key) {
    if (key === tetrisSequence[tetrisIndex]) {
        tetrisIndex += 1;
        if (tetrisIndex === tetrisSequence.length) {
            triggerTetrisConfetti();
            tetrisIndex = 0;
        }
    } else {
        tetrisIndex = key === tetrisSequence[0] ? 1 : 0;
    }

    if (tetrisTimeoutId) {
        clearTimeout(tetrisTimeoutId);
    }

    tetrisTimeoutId = setTimeout(() => {
        tetrisIndex = 0;
    }, 1200);
}

function handleScanSequence(key) {
    if (key === scanSequence[scanIndex]) {
        scanIndex += 1;
        if (scanIndex === scanSequence.length) {
            triggerScanlineSweep();
            scanIndex = 0;
        }
    } else {
        scanIndex = key === scanSequence[0] ? 1 : 0;
    }

    if (scanTimeoutId) {
        clearTimeout(scanTimeoutId);
    }

    scanTimeoutId = setTimeout(() => {
        scanIndex = 0;
    }, 1200);
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyZ' && !zHoldTimer && !zTriggered) {
        zHoldTimer = setTimeout(() => {
            triggerSlowmoPulse();
            zTriggered = true;
        }, 2000);
    }

    if (e.key && e.key.length === 1) {
        handleRollSequence(e.key.toLowerCase());
        handleTetrisSequence(e.key.toLowerCase());
        handleScanSequence(e.key.toLowerCase());
    }

    if (e.key) {
        handleKonamiSequence(e.key.toLowerCase());
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyZ') {
        if (zHoldTimer) {
            clearTimeout(zHoldTimer);
            zHoldTimer = null;
        }
        zTriggered = false;
    }
});

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
    "DONT TOUCH ME",
    "LEAVE ME ALONE",
    "GO AWAY",
    "STOP IT",
    "BACK OFF",
    "NOT NOW",
    "I'M BUSY",
    "NOPE"
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