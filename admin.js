// ================= ADMIN LOGIN GUARD =================
if (!localStorage.getItem("adminLoggedIn")) {
    alert("Unauthorized access");
    window.location.href = "admin-login.html";
}

// ================= BASE URL =================
const BASE_URL = "http://localhost:4000";

// ================= RATION =================
async function loadRation() {
    const res = await fetch(`${BASE_URL}/gov/ration`);
    const data = await res.json();
    const tbody = document.querySelector("#rationTable tbody");
    tbody.innerHTML = "";

    data.forEach(app => {
        tbody.innerHTML += `
        <tr>
            <td>${app.applicationId}</td>
            <td>${app.name}</td>
            <td>${app.category}</td>
            <td>${app.family_members}</td>
            <td>${app.status || "PENDING"}</td>
            <td>
                <button onclick="updateStatus('${app.applicationId}', 'APPROVED')">Approve</button>
                <button onclick="updateStatus('${app.applicationId}', 'REJECTED')">Reject</button>
            </td>
        </tr>
        `;
    });
}

// ================= GOVERNMENT SCHEME =================
async function loadScheme() {
    const res = await fetch(`${BASE_URL}/gov/scheme`);
    const data = await res.json();
    const tbody = document.querySelector("#schemeTable tbody");
    tbody.innerHTML = "";

    data.forEach(app => {
        tbody.innerHTML += `
        <tr>
            <td>${app.applicationId}</td>
            <td>${app.name}</td>
            <td>${app.category}</td>
            <td>${app.state}</td>
            <td>${app.status || "PENDING"}</td>
            <td>
                <button onclick="updateStatus('${app.applicationId}', 'APPROVED')">Approve</button>
                <button onclick="updateStatus('${app.applicationId}', 'REJECTED')">Reject</button>
            </td>
        </tr>
        `;
    });
}

// ================= SCHOLARSHIP 10 =================
async function loadScholar10() {
    const res = await fetch(`${BASE_URL}/gov/scholar10`);
    const data = await res.json();
    const tbody = document.querySelector("#scholar10Table tbody");
    tbody.innerHTML = "";

    data.forEach(app => {
        tbody.innerHTML += `
        <tr>
            <td>${app.applicationId}</td>
            <td>${app.name}</td>
            <td>${app.school}</td>
            <td>${app.marks}</td>
            <td>${app.status || "PENDING"}</td>
            <td>
                <button onclick="updateStatus('${app.applicationId}', 'APPROVED')">Approve</button>
                <button onclick="updateStatus('${app.applicationId}', 'REJECTED')">Reject</button>
            </td>
        </tr>
        `;
    });
}

// ================= SCHOLARSHIP 12 =================
async function loadScholar12() {
    const res = await fetch(`${BASE_URL}/gov/scholar12`);
    const data = await res.json();
    const tbody = document.querySelector("#scholar12Table tbody");
    tbody.innerHTML = "";

    data.forEach(app => {
        tbody.innerHTML += `
        <tr>
            <td>${app.applicationId}</td>
            <td>${app.name}</td>
            <td>${app.college}</td>
            <td>${app.marks}</td>
            <td>${app.status || "PENDING"}</td>
            <td>
                <button onclick="updateStatus('${app.applicationId}', 'APPROVED')">Approve</button>
                <button onclick="updateStatus('${app.applicationId}', 'REJECTED')">Reject</button>
            </td>
        </tr>
        `;
    });
}

// ================= UPDATE STATUS (FIXED) =================
async function updateStatus(id, status) {
    await fetch(`${BASE_URL}/gov/application/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
    });

    // Reload all tables after update
    loadRation();
    loadScheme();
    loadScholar10();
    loadScholar12();
}

// ================= SEARCH =================
function filterTable() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll("tbody tr");

    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(query)
            ? ""
            : "none";
    });
}

// ================= INITIAL LOAD =================
loadRation();
loadScheme();
loadScholar10();
loadScholar12();
