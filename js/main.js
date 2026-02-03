            const apiUrl = "http://localhost:5000/api";
            async function loadAPI() {
                try {
                    const dataURL = apiUrl + "/data";
                    const res = await fetch(dataURL);
                    if (!res.ok) throw new Error('Network response was not ok');
                    const data = await res.json();
                    console.log('API Data:', data);
                } catch (err) {
                    console.error('Failed to load API data:', err);
                }
            }
    
            async function loadHobbies() {
                try {

                    const hobbiesURL = apiUrl + "/hobbies";
                    const res = await fetch(hobbiesURL);
                    if (!res.ok) throw new Error('Network response was not ok');
                    const data = await res.json();
                    const ul = document.getElementById('hobbies-list');
                    ul.innerHTML = '';
                    if (Array.isArray(data.hobbies)) {
                        data.hobbies.forEach(h => {
                            const li = document.createElement('li');
                            li.textContent = h;
                            ul.appendChild(li);
                        });
                    } else {
                        ul.textContent = 'No hobbies found.';
                    }
                } catch (err) {
                    console.error(err);
                    const ul = document.getElementById('hobbies-list');
                    ul.textContent = 'Failed to load hobbies.';
                }
            }



            // Load on page ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', loadHobbies);
            } else {
                loadHobbies();
            }