const apiUrl = "https://fdnd.directus.app/items/person?filter[id]=297";
const peopleApiUrl = "https://fdnd.directus.app/items/person?filter[squads][squad_id][tribe][name]=CMD%20Minor%20Web%20Dev&filter[squads][squad_id][cohort]=2526";

// Store fetched data privately
const apiData = {};

// Shared score state across games.
const sharedScoreState = { tetris: 0, minesweeper: 0, '2048': 0, total: 0 };
const totalScoreEl = document.getElementById('total-score');
const LEADERBOARD_STORAGE_KEY = 'leaderboard-scores-v1';
const LEADERBOARD_GAMES = ['tetris', 'minesweeper', '2048'];

function normalizeSharedScore(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : 0;
}

function updateSharedTotal() {
    sharedScoreState.total =
        sharedScoreState.tetris +
        sharedScoreState.minesweeper +
        sharedScoreState['2048'];
    if (totalScoreEl) {
        totalScoreEl.textContent = String(sharedScoreState.total);
    }
    if (typeof window.setExternalUnlockScore === 'function') {
        window.setExternalUnlockScore(sharedScoreState.total);
    }
}

window.setSharedScore = function setSharedScore(value, source) {
    if (!source || !(source in sharedScoreState)) return;
    sharedScoreState[source] = normalizeSharedScore(value);
    updateSharedTotal();
};

window.getSharedScore = function getSharedScore(source) {
    if (source && source in sharedScoreState) {
        return sharedScoreState[source];
    }
    return sharedScoreState.total;
};

window.getTotalScore = function getTotalScore() {
    return sharedScoreState.total;
};

updateSharedTotal();

function normalizeLeaderboardEntry(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    return Math.max(0, Math.floor(numeric));
}

function loadLeaderboard() {
    let stored = null;
    try {
        stored = JSON.parse(localStorage.getItem(LEADERBOARD_STORAGE_KEY));
    } catch (error) {
        stored = null;
    }

    const leaderboard = {};
    LEADERBOARD_GAMES.forEach((game) => {
        const entries = Array.isArray(stored?.[game]) ? stored[game] : [];
        const cleaned = entries
            .map(normalizeLeaderboardEntry)
            .filter((value) => Number.isFinite(value));
        cleaned.sort((a, b) => b - a);
        leaderboard[game] = cleaned.slice(0, 10);
    });

    return leaderboard;
}

let leaderboardState = loadLeaderboard();

function saveLeaderboard() {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(leaderboardState));
}

function renderLeaderboard() {
    LEADERBOARD_GAMES.forEach((game) => {
        const list = document.getElementById(`leaderboard-${game}`);
        if (!list) return;
        list.innerHTML = '';
        const scores = leaderboardState[game] || [];
        if (!scores.length) {
            const item = document.createElement('li');
            item.textContent = 'No scores yet';
            list.appendChild(item);
            return;
        }
        scores.forEach((score) => {
            const item = document.createElement('li');
            item.textContent = String(score);
            list.appendChild(item);
        });
    });
}

function recordLeaderboardScore(game, value) {
    if (!LEADERBOARD_GAMES.includes(game)) return;
    const score = normalizeLeaderboardEntry(value);
    if (!Number.isFinite(score) || score <= 0) return;
    const current = leaderboardState[game] || [];
    const next = [...current, score].sort((a, b) => b - a).slice(0, 10);
    const changed = next.length !== current.length || next.some((entry, index) => entry !== current[index]);
    if (!changed) return;
    leaderboardState = { ...leaderboardState, [game]: next };
    saveLeaderboard();
    renderLeaderboard();
}

window.recordLeaderboardScore = recordLeaderboardScore;
window.renderLeaderboard = renderLeaderboard;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        renderLeaderboard();
    });
} else {
    renderLeaderboard();
}

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

async function ensurePeopleData() {
    if (window.peopleData) return window.peopleData;
    try {
        const response = await fetch(peopleApiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        window.peopleData = data;
        return data;
    } catch (error) {
        console.error('Failed to load people data:', error);
        return null;
    }
}

window.ensurePeopleData = ensurePeopleData;

// Load on page ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        loadAPI();
    });
} else {
    loadAPI();
}
