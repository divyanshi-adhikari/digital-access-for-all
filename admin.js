// ================= ADMIN.JS (FINAL – VERCEL SAFE) =================

// POINT TO YOUR LIVE USER API
const API_BASE = "https://digital-access-for-all-user.vercel.app";

// ================= AUTH CHECK =================
(function () {
  if (localStorage.getItem("adminLoggedIn") !== "true") {
    window.location.href = "admin-lock.html";
  }
})();

// ================= GLOBAL STATE =================
let currentStatus = {};
let autoRefreshEnabled = true;
let refreshInterval = null;

// ================= FETCH HELPERS =================
async function fetchData(endpoint) {
  try {
    const response = await fetch(API_BASE + endpoint, {
      headers: { "Cache-Control": "no-cache" }
    });

    if (!response.ok) return [];
    const json = await response.json();
    return json.data || json || [];
  } catch {
    return [];
  }
}

// ================= LOAD ALL DATA =================
async function loadAllData() {
  try {
    const [ration, scheme, s10, s12] = await Promise.all([
      fetchData("/gov/ration"),
      fetchData("/gov/scheme"),
      fetchData("/gov/scholar10"),
      fetchData("/gov/scholar12")
    ]);

    renderTable("rationTable", applyLocalStatus(ration, "ration"), "ration");
    renderTable("schemeTable", applyLocalStatus(scheme, "scheme"), "scheme");
    renderTable("scholar10Table", applyLocalStatus(s10, "scholar10"), "scholar10");
    renderTable("scholar12Table", applyLocalStatus(s12, "scholar12"), "scholar12");

    updateStats(ration, scheme, s10, s12);
    window.lastDashboardUpdate = Date.now();
  } catch (e) {
    console.error("Dashboard load failed:", e);
  }
}

// ================= LOCAL STATUS =================
function applyLocalStatus(data, type) {
  return data.map(item => {
    const id = item.applicationId || item.id;
    const key = `${type}-${id}`;
    return currentStatus[key] ? { ...item, status: currentStatus[key] } : item;
  });
}

// ================= RENDER TABLE =================
function renderTable(tableId, data, type) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!tbody) return;

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#999;">No applications</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(item => {
    const id = item.applicationId || item.id;
    const status = (item.status || "PENDING").toUpperCase();

    return `
      <tr data-id="${id}" data-type="${type}">
        <td>${id}</td>
        <td>${item.name || ""}</td>
        <td>${item.category || item.school || item.college || ""}</td>
        <td>${item.marks || item.family_members || item.state || ""}</td>
        <td>
          <span style="color:${statusColor(status)}; font-weight:bold;">${status}</span>
        </td>
        <td>
          ${
            status === "PENDING"
              ? `<button onclick="handleAction('${id}', '${type}', 'APPROVED')" 
                       style="background:green; color:white; border:none; 
                              padding:5px 10px; margin-right:5px; border-radius:3px; cursor:pointer;">
                   Approve
                 </button>
                 <button onclick="handleAction('${id}', '${type}', 'REJECTED')"
                       style="background:red; color:white; border:none; 
                              padding:5px 10px; border-radius:3px; cursor:pointer;">
                   Reject
                 </button>`
              : `<strong style="color:${status === 'APPROVED' ? 'green' : 'red'};">${status}</strong>`
          }
        </td>
      </tr>
    `;
  }).join("");
}

// ================= ACTION HANDLER =================
window.handleAction = async function(id, type, action) {
  if (!confirm(`${action} application ${id}?`)) return;

  // UI update first
  const key = `${type}-${id}`;
  currentStatus[key] = action;
  localStorage.setItem("adminStatusCache", JSON.stringify(currentStatus));
  loadAllData();

  // Backend sync
  try {
    await fetch(`${API_BASE}/gov/application/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action, appType: type })
    });
  } catch (e) {
    console.error("Sync failed:", e);
  }
};

// ================= UTIL =================
function statusColor(s) {
  return s === "APPROVED" ? "green" : s === "REJECTED" ? "red" : "orange";
}

function updateStats(a, b, c, d) {
  const map = {
    rationCount: a.length,
    schemeCount: b.length,
    scholar10Count: c.length,
    scholar12Count: d.length
  };
  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
}

// ================= AUTO REFRESH =================
function startAutoRefresh(seconds = 30) {
  clearInterval(refreshInterval);
  refreshInterval = setInterval(() => {
    if (autoRefreshEnabled && navigator.onLine) loadAllData();
  }, seconds * 1000);
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("adminLoggedIn") !== "true") return;

  const cache = localStorage.getItem("adminStatusCache");
  if (cache) currentStatus = JSON.parse(cache);

  loadAllData();
  startAutoRefresh(30);
});

// ================= LOGOUT =================
window.logout = function () {
  if (confirm("Logout?")) {
    localStorage.clear();
    location.href = "admin-lock.html";
  }
};