const apiUrl = "http://localhost:5000/api";

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
        const res = await fetch(apiUrl + "/data");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        console.log("API Data:", data);
    } catch (err) {
        console.error("Failed to load API data:", err);
    }
}

async function loadName() {
    try {
        const res = await fetch(apiUrl + "/name");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        apiData.name = data.name;
        setPlaceholder('name', data.name);
    } catch (err) {
        console.error(err);
        apiData.name = "Failed to load name.";
    }
}

async function loadHobbies() {
    try {
        const res = await fetch(apiUrl + "/hobbies");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        apiData.hobbies = Array.isArray(data.hobbies) ? data.hobbies : [];
        setPlaceholdersList('hobbies-list', apiData.hobbies);
    } catch (err) {
        console.error(err);
        apiData.hobbies = null;
    }
}

async function loadAge() {
    try {
        const res = await fetch(apiUrl + "/age");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        apiData.age = data.age;
        setPlaceholder('age', data.age);
    } catch (err) {
        console.error(err);
        apiData.age = "Failed to load age.";
    }
}

async function loadLocation() {
    try {
        const res = await fetch(apiUrl + "/location");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        apiData.location = data.location;
        setPlaceholder('location', data.location);
    } catch (err) {
        console.error(err);
        apiData.location = "Failed to load location.";
    }
}

async function loadOccupation() {
    try {
        const res = await fetch(apiUrl + "/occupation");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        apiData.occupation = Array.isArray(data.occupation) ? data.occupation : [];
        setPlaceholdersList('occupation-list', apiData.occupation);
    } catch (err) {
        console.error(err);
        apiData.occupation = null;
    }
}

async function loadLearningGoals() {
    try {
        const res = await fetch(apiUrl + "/learning_goals");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        apiData.learningGoals = Array.isArray(data.learning_goals) ? data.learning_goals : [];
        setPlaceholdersList('learning-goals', apiData.learningGoals);
    } catch (err) {
        console.error(err);
        apiData.learningGoals = null;
    }
}

async function loadCourse() {
    try {
        const res = await fetch(apiUrl + "/course");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        apiData.course = Array.isArray(data.course) ? data.course : [];
        setPlaceholdersList('course-list', apiData.course);
    } catch (err) {
        console.error(err);
        apiData.course = null;
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
    }
}

// Load on page ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        loadAPI();
        loadName();
        loadHobbies();
        loadAge();
        loadLocation();
        loadOccupation();
        loadLearningGoals();
        loadCourse();
    });
} else {
    loadAPI();
    loadName();
    loadHobbies();
    loadAge();
    loadLocation();
    loadOccupation();
    loadLearningGoals();
    loadCourse();
}