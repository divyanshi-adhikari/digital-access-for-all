// ================= ADMIN.JS - PERMANENT STATUS FIX =================
const API_BASE = "http://localhost:4000";

// ================= AUTH CHECK =================
(function() {
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'admin-login.html';
    }
})();

// Store current status locally so refresh doesn't lose it
let currentStatus = {};

// ================= LOAD DATA (WITH CACHE) =================
async function loadAllData() {
    console.log("Loading dashboard data...");
    
    try {
        const [rationData, schemeData, scholar10Data, scholar12Data] = await Promise.all([
            fetchData('/gov/ration'),
            fetchData('/gov/scheme'),
            fetchData('/gov/scholar10'),
            fetchData('/gov/scholar12')
        ]);
        
        // Apply locally stored status over server data
        const processedRation = applyLocalStatus(rationData, 'ration');
        const processedScheme = applyLocalStatus(schemeData, 'scheme');
        const processedScholar10 = applyLocalStatus(scholar10Data, 'scholar10');
        const processedScholar12 = applyLocalStatus(scholar12Data, 'scholar12');
        
        renderTable('rationTable', processedRation, 'ration');
        renderTable('schemeTable', processedScheme, 'scheme');
        renderTable('scholar10Table', processedScholar10, 'scholar10');
        renderTable('scholar12Table', processedScholar12, 'scholar12');
        
        updateStats(processedRation, processedScheme, processedScholar10, processedScholar12);
        
    } catch (error) {
        console.error('Load error:', error);
    }
}

// Apply locally stored status to server data
function applyLocalStatus(data, appType) {
    return data.map(item => {
        const appId = item.id || item.applicationId;
        const key = `${appType}-${appId}`;
        
        // If we have a local status, use it instead of server status
        if (currentStatus[key]) {
            return { ...item, status: currentStatus[key] };
        }
        return item;
    });
}

async function fetchData(endpoint) {
    try {
        // Add cache busting
        const url = API_BASE + endpoint + '?_t=' + Date.now();
        const response = await fetch(url, {
            headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (!response.ok) return [];
        
        const data = await response.json();
        return data.data || data || [];
        
    } catch (error) {
        console.error('Fetch error:', error);
        return [];
    }
}

// ================= RENDER TABLE =================
function renderTable(tableId, data, appType) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;
    
    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:30px;color:#999;">
                    📭 No applications
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    data.forEach(item => {
        const status = (item.status || 'PENDING').toUpperCase();
        const appId = item.applicationId || item.id || '';
        
        html += `
        <tr data-id="${appId}" data-type="${appType}">
            <td><strong>${appId}</strong></td>
            <td>${item.name || ''}</td>
            <td>${getTableCell(item, appType, 1)}</td>
            <td>${getTableCell(item, appType, 2)}</td>
            <td>
                <span class="status-display" id="status-${appType}-${appId}"
                      style="color: ${getStatusColor(status)}; 
                             font-weight: bold;
                             padding: 4px 10px;
                             border-radius: 12px;
                             background: ${getStatusBg(status)};
                             display: inline-block;">
                    ${status}
                </span>
            </td>
            <td>
                ${status === 'PENDING' ? `
                    <button class="btn-approve" 
                            data-id="${appId}"
                            data-type="${appType}"
                            style="background:green;color:white;border:none;
                                   padding:6px 12px;border-radius:4px;margin-right:5px;
                                   cursor:pointer;">
                        ✓ Approve
                    </button>
                    <button class="btn-reject"
                            data-id="${appId}"
                            data-type="${appType}"
                            style="background:red;color:white;border:none;
                                   padding:6px 12px;border-radius:4px;cursor:pointer;">
                        ✗ Reject
                    </button>
                ` : `
                    <span style="color:${status === 'APPROVED' ? 'green' : 'red'};font-weight:bold;">
                        ${status === 'APPROVED' ? 'Approved' : ' Rejected'}
                    </span>
                `}
            </td>
        </tr>`;
    });
    
    tbody.innerHTML = html;
    
    // Add event listeners
    addTableEventListeners(tableId);
}

function getTableCell(item, appType, cellIndex) {
    switch(appType) {
        case 'ration': return cellIndex === 1 ? (item.category || '') : (item.family_members || item.familyMembers || '');
        case 'scheme': return cellIndex === 1 ? (item.category || '') : (item.state || '');
        case 'scholar10': return cellIndex === 1 ? (item.school || '') : (item.marks || '');
        case 'scholar12': return cellIndex === 1 ? (item.college || '') : (item.marks || '');
        default: return '';
    }
}

function getStatusColor(status) {
    switch(status.toUpperCase()) {
        case 'APPROVED': return 'green';
        case 'REJECTED': return 'red';
        default: return 'orange';
    }
}

function getStatusBg(status) {
    switch(status.toUpperCase()) {
        case 'APPROVED': return '#d4ffd4';
        case 'REJECTED': return '#ffd4d4';
        default: return '#fff3cd';
    }
}

// ================= EVENT HANDLERS =================
function addTableEventListeners(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    table.addEventListener('click', function(event) {
        const target = event.target;
        
        if (target.classList.contains('btn-approve') || 
            target.classList.contains('btn-reject')) {
            
            const appId = target.getAttribute('data-id');
            const appType = target.getAttribute('data-type');
            const action = target.classList.contains('btn-approve') ? 'APPROVED' : 'REJECTED';
            
            if (appId && appType) {
                handleAction(appId, action, appType, target);
            }
        }
    });
}

// ================= ACTION HANDLER =================
async function handleAction(appId, action, appType, button) {
    if (!confirm(`${action} application ${appId}?`)) return;
    
    // Find the row
    const row = document.querySelector(`tr[data-id="${appId}"][data-type="${appType}"]`);
    if (!row) {
        alert('Application not found');
        return;
    }
    
    // Disable buttons
    const buttons = row.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });
    
    // 1. UPDATE UI IMMEDIATELY
    updateRowUI(row, action);
    
    // 2. SAVE STATUS LOCALLY (survives refresh)
    const key = `${appType}-${appId}`;
    currentStatus[key] = action;
    localStorage.setItem('adminStatusCache', JSON.stringify(currentStatus));
    
    // 3. SEND TO BACKEND
    try {
        const response = await fetch(`${API_BASE}/gov/application/${appId}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({
                status: action,
                appType: appType
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Backend error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Backend update result:', result);
        
        alert(` Application ${appId} ${action.toLowerCase()}ed!`);
        
    } catch (error) {
        console.error('Backend update failed:', error);
        alert(` UI updated but server sync failed: ${error.message}`);
        // Don't revert - keep the UI change
    }
}

function updateRowUI(row, newStatus) {
    // Update status display
    const appId = row.getAttribute('data-id');
    const appType = row.getAttribute('data-type');
    const statusElement = document.getElementById(`status-${appType}-${appId}`);
    
    if (statusElement) {
        statusElement.textContent = newStatus;
        statusElement.style.color = getStatusColor(newStatus);
        statusElement.style.background = getStatusBg(newStatus);
    }
    
    // Update action cell
    const actionCell = row.querySelector('td:last-child');
    if (actionCell) {
        actionCell.innerHTML = `
            <span style="color:${newStatus === 'APPROVED' ? 'green' : 'red'};font-weight:bold;">
                ${newStatus === 'APPROVED' ? ' Approved' : ' Rejected'}
            </span>
        `;
    }
}

// ================= UPDATE STATS =================
function updateStats(ration, scheme, scholar10, scholar12) {
    const stats = {
        'rationCount': ration.length,
        'schemeCount': scheme.length,
        'scholar10Count': scholar10.length,
        'scholar12Count': scholar12.length
    };
    
    Object.entries(stats).forEach(([id, count]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = count;
    });
}

// ================= INITIALIZE =================
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('adminLoggedIn') !== 'true') return;
    
    // Load cached status from localStorage
    const cachedStatus = localStorage.getItem('adminStatusCache');
    if (cachedStatus) {
        currentStatus = JSON.parse(cachedStatus);
        console.log('Loaded cached status:', currentStatus);
    }
    
    console.log('Admin dashboard starting...');
    loadAllData();
    
    // Add refresh button (but it won't lose status now)
    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = '🔄 Refresh';
    refreshBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 15px;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1000;
    `;
    refreshBtn.onclick = loadAllData;
    document.body.appendChild(refreshBtn);
});

// ================= GLOBAL FUNCTIONS =================
window.loadAllData = loadAllData;
window.logout = function() {
    if (confirm('Logout?')) {
        localStorage.clear(); // Clear all cached status
        window.location.href = 'admin-login.html';
    }
};

console.log('Admin.js loaded - Status persists through refresh');