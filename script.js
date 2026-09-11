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
            const nameEl = document.getElementById("memberName");
            const phoneEl = document.getElementById("memberPhone");
            const planEl = document.getElementById("memberPlan");
            const dateEl = document.getElementById("memberJoinDate");
            const passEl = document.getElementById("memberPassword");

            const name = nameEl ? nameEl.value.trim() : "";
            const phone = phoneEl ? phoneEl.value.trim() : "";
            const plan = planEl && planEl.selectedIndex > 0 ? planEl.options[planEl.selectedIndex].text.split(" (")[0] : "Starter Plan";
            const joinDate = dateEl ? dateEl.value : "";
            const password = passEl ? passEl.value : "123456";

            try {
                const res = await fetch(`${API_BASE}/members`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, phone, plan, joinDate, password })
                });
                const result = await res.json();
                if (result.success) {
                    alert(`Athlete "${name}" registered successfully!\n\nMember ID: ${result.data.memberId}\nPassword: ${result.data.password}\n\nLogin now at Member Login using this ID and Password!`);
                    addMemberForm.reset();
                    loadMembersFromDB();
                } else {
                    alert(result.message || "Failed to register member");
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
            const nameEl = document.getElementById("trainerName");
            const phoneEl = document.getElementById("trainerPhone");
            const specEl = document.getElementById("trainerSpec");
            const salEl = document.getElementById("trainerSalary");
            const shiftEl = document.getElementById("trainerShift");
            const passEl = document.getElementById("trainerPassword");

            const name = nameEl ? nameEl.value.trim() : "";
            const phone = phoneEl ? phoneEl.value.trim() : "";
            const specialization = specEl ? specEl.value.trim() : "";
            const salary = salEl ? salEl.value.trim() : "";
            const shift = shiftEl && shiftEl.selectedIndex > 0 ? shiftEl.options[shiftEl.selectedIndex].text.split(" (")[0] : "Morning Shift";
            const password = passEl ? passEl.value : "trainer123";

            try {
                const res = await fetch(`${API_BASE}/trainers`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, phone, specialization, salary, shift, password })
                });
                const result = await res.json();
                if (result.success) {
                    alert(`Coach "${name}" registered successfully!\n\nTrainer ID: ${result.data.trainerId}\nPassword: ${result.data.password}\n\nCoach can now log in at Trainer Login!`);
                    trainerForm.reset();
                    loadTrainersFromDB();
                } else {
                    alert(result.message || "Failed to register trainer");
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
    
    function setupLoginForm(formId, role, redirectUrl) {
        const form = document.getElementById(formId);
        if (!form) return;

        form.addEventListener("submit", async function (e) {
            e.preventDefault();
            const usernameInput = form.querySelector("#username");
            const passwordInput = form.querySelector("#password");
            const submitBtn = form.querySelector("button[type='submit']");

            if (!usernameInput || !passwordInput) return;

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            if (submitBtn) {
                submitBtn.textContent = "Verifying...";
                submitBtn.disabled = true;
            }

            try {
                const res = await fetch(`${API_BASE}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password, role })
                });

                const result = await res.json();

                if (result.success) {
                    localStorage.setItem("currentUser", JSON.stringify(result.user));
                    window.location.href = redirectUrl;
                } else {
                    alert(result.message || "Invalid username or password!");
                    if (submitBtn) {
                        submitBtn.textContent = "Sign In";
                        submitBtn.disabled = false;
                    }
                }
            } catch (err) {
                alert("Server error. Please try again!");
                if (submitBtn) {
                    submitBtn.textContent = "Sign In";
                    submitBtn.disabled = false;
                }
            }
        });
    }

    setupLoginForm("ownerLoginForm", "owner", "owner-dashboard.html");
    setupLoginForm("trainer-login-form", "trainer", "trainer-dashboard.html");
    setupLoginForm("memberLoginForm", "member", "member-dashboard.html");
});