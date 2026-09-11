document.addEventListener("DOMContentLoaded", function () {
    const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "/api";

    // 1. LIVE TABLE SEARCH (Universal for all tables)
    const searchInputs = document.querySelectorAll("input[type='text']");
    searchInputs.forEach(function (input) {
        if (input.placeholder && input.placeholder.toLowerCase().includes("search")) {
            input.addEventListener("keyup", function () {
                const filterValue = input.value.toLowerCase().trim();
                const table = document.querySelector("table");
                if (!table) return;

                const rows = table.querySelectorAll("tbody tr");
                rows.forEach(function (row) {
                    const rowText = row.textContent.toLowerCase();
                    if (rowText.includes(filterValue)) {
                        row.style.display = "";
                    } else {
                        row.style.display = "none";
                    }
                });
            });
        }
    });

    // 2. MEMBERS DATABASE INTEGRATION
    const memberTbody = document.querySelector(".table-section table tbody");
    const addMemberForm = document.getElementById("addMemberForm");

    async function loadMembersFromDB() {
        if (!memberTbody || window.location.pathname.includes("trainer") || window.location.pathname.includes("attendance")) return;
        try {
            const res = await fetch(`${API_BASE}/members`);
            const result = await res.json();
            if (result.success && result.data.length > 0) {
                memberTbody.innerHTML = "";
                result.data.forEach(function (m) {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${m.memberId}</td>
                        <td>${m.name}</td>
                        <td>+91 ${m.phone}</td>
                        <td>${m.plan}</td>
                        <td>${m.joinDate}</td>
                        <td><span class="status-active">${m.status}</span></td>
                        <td>
                            <button type="button" class="btn-edit">Edit</button>
                            <button type="button" class="btn-delete" data-id="${m._id}">Delete</button>
                        </td>
                    `;
                    memberTbody.appendChild(tr);
                });
            }
        } catch (err) {
            console.log("Error loading members:", err.message);
        }
    }
    loadMembersFromDB();

    if (addMemberForm) {
        addMemberForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const inputs = addMemberForm.querySelectorAll("input, select");
            const name = inputs[0].value.trim();
            const phone = inputs[1].value.trim();
            const planSelect = inputs[2];
            const plan = planSelect.options[planSelect.selectedIndex].text.split(" (")[0];
            const joinDate = inputs[3].value;

            try {
                const res = await fetch(`${API_BASE}/members`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, phone, plan, joinDate })
                });
                const result = await res.json();
                if (result.success) {
                    alert(`Athlete "${name}" successfully saved to MongoDB!`);
                    addMemberForm.reset();
                    loadMembersFromDB();
                }
            } catch (err) {
                alert("Server error connecting to MongoDB");
            }
        });
    }

    // 3. TRAINERS DATABASE INTEGRATION
    const trainerForm = document.getElementById("trainerForm");
    const trainerTbody = document.querySelector("table tbody");

    async function loadTrainersFromDB() {
        if (!window.location.pathname.includes("trainers.html") || !trainerTbody) return;
        try {
            const res = await fetch(`${API_BASE}/trainers`);
            const result = await res.json();
            if (result.success && result.data.length > 0) {
                trainerTbody.innerHTML = "";
                result.data.forEach(function (t) {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${t.trainerId}</td>
                        <td>${t.name}</td>
                        <td>+91 ${t.phone}</td>
                        <td>${t.specialization}</td>
                        <td>₹${t.salary}</td>
                        <td>${t.shift}</td>
                        <td>${t.traineesCount} Trainees</td>
                        <td>
                            <button type="button" class="btn-edit">Edit</button>
                            <button type="button" class="btn-delete" data-id="${t._id}">Delete</button>
                        </td>
                    `;
                    trainerTbody.appendChild(tr);
                });
            }
        } catch (err) {
            console.log("Error loading trainers:", err.message);
        }
    }
    loadTrainersFromDB();

    if (trainerForm) {
        trainerForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const inputs = trainerForm.querySelectorAll("input, select");
            const name = inputs[0].value.trim();
            const phone = inputs[1].value.trim();
            const specialization = inputs[2].value.trim();
            const salary = inputs[3].value.trim();
            const shift = inputs[4].options[inputs[4].selectedIndex].text.split(" (")[0];

            try {
                const res = await fetch(`${API_BASE}/trainers`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, phone, specialization, salary, shift })
                });
                const result = await res.json();
                if (result.success) {
                    alert(`Coach "${name}" successfully registered in MongoDB!`);
                    trainerForm.reset();
                    loadTrainersFromDB();
                }
            } catch (err) {
                alert("Server error connecting to MongoDB");
            }
        });
    }

    // 4. WORKOUTS DATABASE INTEGRATION
    const logWorkoutForm = document.getElementById("logWorkoutForm");
    const workoutTbody = document.querySelector(".trainer-table tbody");

    async function loadWorkoutsFromDB() {
        if (!workoutTbody || !window.location.pathname.includes("trainer-workouts")) return;
        try {
            const res = await fetch(`${API_BASE}/workouts`);
            const result = await res.json();
            if (result.success && result.data.length > 0) {
                workoutTbody.innerHTML = "";
                result.data.forEach(function (w) {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${w.date}</td>
                        <td>${w.athleteName}</td>
                        <td>${w.exercise}</td>
                        <td>${w.category}</td>
                        <td>${w.setsReps}</td>
                        <td>${w.weight}</td>
                        <td>${w.duration}</td>
                        <td><button type="button" class="btn-check">Edit</button></td>
                    `;
                    workoutTbody.appendChild(tr);
                });
            }
        } catch (err) {
            console.log("Error loading workouts:", err.message);
        }
    }
    loadWorkoutsFromDB();

    if (logWorkoutForm) {
        logWorkoutForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const athleteSelect = logWorkoutForm.querySelectorAll("select")[0];
            const categorySelect = logWorkoutForm.querySelectorAll("select")[1];
            const inputs = logWorkoutForm.querySelectorAll("input");

            const athleteName = athleteSelect.options[athleteSelect.selectedIndex].text.split(" (")[0];
            const category = categorySelect.options[categorySelect.selectedIndex].text;
            const exercise = inputs[0].value;
            const setsReps = inputs[1].value;
            const weight = inputs[2].value ? inputs[2].value + " kg" : "—";
            const duration = inputs[3].value ? inputs[3].value + " min" : "30 min";

            try {
                const res = await fetch(`${API_BASE}/workouts`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ athleteName, category, exercise, setsReps, weight, duration })
                });
                const result = await res.json();
                if (result.success) {
                    alert(`Workout logged for "${athleteName}" in MongoDB!`);
                    logWorkoutForm.reset();
                    loadWorkoutsFromDB();
                }
            } catch (err) {
                alert("Server error connecting to MongoDB");
            }
        });
    }

    // 5. ATTENDANCE & BUTTON HANDLERS
    document.addEventListener("click", async function (e) {
        // DELETE BUTTON
        if (e.target && e.target.classList.contains("btn-delete")) {
            const id = e.target.getAttribute("data-id");
            const row = e.target.closest("tr");
            const name = row.querySelectorAll("td")[1].textContent;

            if (confirm(`Are you sure you want to delete ${name}?`)) {
                if (id) {
                    const endpoint = window.location.pathname.includes("trainers") ? "trainers" : "members";
                    await fetch(`${API_BASE}/${endpoint}/${id}`, { method: "DELETE" });
                }
                row.remove();
                alert(`${name} deleted!`);
            }
        }

        // PRESENT BUTTON
        if (e.target && (e.target.classList.contains("btn-present") || e.target.classList.contains("btn-att-present"))) {
            const row = e.target.closest("tr");
            const cells = row.querySelectorAll("td");
            const memberId = cells[0].textContent;
            const memberName = cells[1].textContent;
            const badge = row.querySelector(".status-active, .status-absent, .badge-done, .badge-upcoming");
            const timeCell = cells[3];

            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (badge) {
                badge.className = badge.className.includes("badge") ? "badge-done" : "status-active";
                badge.textContent = "Present";
            }
            if (timeCell) timeCell.textContent = timeStr;

            // Save to MongoDB
            try {
                await fetch(`${API_BASE}/attendance`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ memberId, memberName, status: "Present", time: timeStr })
                });
            } catch (err) {}

            const countEl = document.querySelector(".green-box .count-num");
            if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;
        }

        // ABSENT BUTTON
        if (e.target && (e.target.classList.contains("btn-absent") || e.target.classList.contains("btn-att-absent"))) {
            const row = e.target.closest("tr");
            const cells = row.querySelectorAll("td");
            const memberId = cells[0].textContent;
            const memberName = cells[1].textContent;
            const badge = row.querySelector(".status-active, .status-absent, .badge-done, .badge-upcoming");
            const timeCell = cells[3];

            if (badge) {
                badge.className = badge.className.includes("badge") ? "badge-upcoming" : "status-absent";
                badge.textContent = "Absent";
            }
            if (timeCell) timeCell.textContent = "--:--";

            // Save to MongoDB
            try {
                await fetch(`${API_BASE}/attendance`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ memberId, memberName, status: "Absent", time: "--:--" })
                });
            } catch (err) {}

            const countEl = document.querySelector(".red-box .count-num");
            if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;
        }
    });
});