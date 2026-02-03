const apiUrl = "http://localhost:5000/api";

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
        const nameElement = document.getElementById("name");
        nameElement.textContent = `Name: ${data.name}`;
    } catch (err) {
        console.error(err);
        const nameElement = document.getElementById("name");
        nameElement.textContent = "Failed to load name.";
    }
}

async function loadHobbies() {
    try {
        const res = await fetch(apiUrl + "/hobbies");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        const ul = document.getElementById("hobbies-list");
        ul.innerHTML = "";
        if (Array.isArray(data.hobbies)) {
            data.hobbies.forEach(h => {
                const li = document.createElement("li");
                li.textContent = h;
                ul.appendChild(li);
            });
        } else {
            ul.textContent = "No hobbies found.";
        }
    } catch (err) {
        console.error(err);
        document.getElementById("hobbies-list").textContent = "Failed to load hobbies.";
    }
}

async function loadAge() {
    try {
        const res = await fetch(apiUrl + "/age");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        document.getElementById("age").textContent = `Age: ${data.age}`;
    } catch (err) {
        console.error(err);
        document.getElementById("age").textContent = "Failed to load age.";
    }
}

async function loadLocation() {
    try {
        const res = await fetch(apiUrl + "/location");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        document.getElementById("location").textContent = `Location: ${data.location}`;
    } catch (err) {
        console.error(err);
        document.getElementById("location").textContent = "Failed to load location.";
    }
}

async function loadOccupation() {
    try {
        const res = await fetch(apiUrl + "/occupation");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        const ul = document.getElementById("occupation-list");
        ul.innerHTML = "";
        if (Array.isArray(data.occupation)) {
            data.occupation.forEach(o => {
                const li = document.createElement("li");
                li.textContent = o;
                ul.appendChild(li);
            });
        } else {
            ul.textContent = "No occupation found.";
        }
    } catch (err) {
        console.error(err);
        document.getElementById("occupation-list").textContent = "Failed to load occupation.";
    }
}

async function loadLearningGoals() {
    try {
        const res = await fetch(apiUrl + "/learning_goals");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        const ul = document.getElementById("learning-goals");
        ul.innerHTML = "";
        if (Array.isArray(data.learning_goals)) {
            data.learning_goals.forEach(g => {
                const li = document.createElement("li");
                li.textContent = g;
                ul.appendChild(li);
            });
        } else {
            ul.textContent = "No learning goals found.";
        }
    } catch (err) {
        console.error(err);
        document.getElementById("learning-goals").textContent = "Failed to load learning goals.";
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
    });
} else {
    loadAPI();
    loadName();
    loadHobbies();
    loadAge();
    loadLocation();
    loadOccupation();
    loadLearningGoals();
}