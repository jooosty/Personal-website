const apiUrl = "https://fdnd.directus.app/items/person?filter[id]=297";

// Store fetched data privately
const apiData = {};

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

// Check for saved theme preference or default to dark mode
const currentTheme = localStorage.getItem('theme') || 'dark';
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
    } else {
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    }
});

const rollSequence = ['r', 'o', 'l', 'l'];
let rollIndex = 0;
let rollTimeoutId = null;
const konamiSequence = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
let konamiIndex = 0;
let konamiTimeoutId = null;

function triggerBarrelRoll() {
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

function triggerExplosion() {
    if (document.body.classList.contains('exploding')) return;

    document.body.classList.add('exploding');
    const layer = document.createElement('div');
    layer.className = 'explosion-layer';

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 1000; i += 1) {
        const particle = document.createElement('span');
        particle.className = 'explosion-particle';
        const angle = Math.random() * Math.PI * 2;
        const distance = 200 + Math.random() * 520;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const r = Math.floor(Math.random() * 360);
        const s = (0.7 + Math.random() * 1.6).toFixed(2);
        particle.style.setProperty('--x', `${x}px`);
        particle.style.setProperty('--y', `${y}px`);
        particle.style.setProperty('--r', `${r}deg`);
        particle.style.setProperty('--s', s);
        fragment.appendChild(particle);
    }

    layer.appendChild(fragment);
    document.body.appendChild(layer);

    setTimeout(() => {
        document.body.classList.remove('exploding');
        layer.remove();
    }, 10100);
}

function handleKonamiSequence(key) {
    if (key === konamiSequence[konamiIndex]) {
        konamiIndex += 1;
        if (konamiIndex === konamiSequence.length) {
            triggerExplosion();
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

document.addEventListener('keydown', (e) => {
    if (e.key && e.key.length === 1) {
        handleRollSequence(e.key.toLowerCase());
    }

    if (e.key) {
        handleKonamiSequence(e.key.toLowerCase());
    }
});