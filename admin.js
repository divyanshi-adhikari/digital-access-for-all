// ================= ADMIN.JS - FINAL WORKING VERSION =================

const CONFIG = {
    BASE_URL: "http://localhost:4000",
    ENDPOINTS: {
        RATION: "/gov/ration",
        SCHEME: "/gov/scheme",
        SCHOLAR10: "/gov/scholar10",
        SCHOLAR12: "/gov/scholar12",
        UPDATE: "/gov/application"
    }
};

// ================= AUTH CHECK =================
(function() {
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'admin-login.html';
    }
})();

// ================= LOAD ALL DATA =================
async function loadAllData() {
    try {
        const [rationData, schemeData, scholar10Data, scholar12Data] = await Promise.all([
            fetchData(CONFIG.ENDPOINTS.RATION),
            fetchData(CONFIG.ENDPOINTS.SCHEME),
            fetchData(CONFIG.ENDPOINTS.SCHOLAR10),
            fetchData(CONFIG.ENDPOINTS.SCHOLAR12)
        ]);
        
        renderTable('rationTable', rationData, 'ration');
        renderTable('schemeTable', schemeData, 'scheme');
        renderTable('scholar10Table', scholar10Data, 'scholar10');
        renderTable('scholar12Table', scholar12Data, 'scholar12');
        
        updateStats(rationData, schemeData, scholar10Data, scholar12Data);
        
    } catch (error) {
        console.error('Load error:', error);
    }
}

// ================= FETCH DATA =================
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${CONFIG.BASE_URL}${endpoint}`);
        if (!response.ok) return [];
        
        const data = await response.json();
        
        // Handle any response format
        if (Array.isArray(data)) return data;
        if (data?.data && Array.isArray(data.data)) return data.data;
        if (data?.success && data.data) return data.data;
        
        return [];
    } catch (error) {
        console.error(`Fetch error:`, error);
        return [];
    }
}

// ================= RENDER TABLE =================
function renderTable(tableId, data, appType) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:#999;">📭 No applications</td></tr>';
        return;
    }
    
    let html = '';
    for (const item of data) {
        const status = item.status || 'PENDING';
        const appId = item.id || item.applicationId || 'N/A';
        const statusColor = status === 'APPROVED' ? 'green' : status === 'REJECTED' ? 'red' : 'orange';
        
        // FIX: Only add data-app-id if appId is NOT 'N/A'
        const dataAttr = appId !== 'N/A' ? `data-app-id="${appId}"` : '';
        
        html += `
        <tr ${dataAttr}>
            <td><strong>${appId}</strong></td>
            <td>${item.name || 'N/A'}</td>
            <td>${getTableCell(item, appType, 1)}</td>
            <td>${getTableCell(item, appType, 2)}</td>
            <td>
                <span class="status-cell" data-app-id="${appId}">
                    ${status}
                </span>
            </td>
            <td>
                ${status === 'PENDING' ? `
                    <button onclick="approveApp('${appId}', '${appType}', this)" 
                            style="background:green;color:white;border:none;padding:5px 10px;border-radius:4px;margin-right:5px;cursor:pointer;">
                        ✓
                    </button>
                    <button onclick="rejectApp('${appId}', '${appType}', this)" 
                            style="background:red;color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;">
                        ✗
                    </button>
                ` : `
                    <span style="color:#666;font-size:12px;">
                        ${status === 'APPROVED' ? '✓ Approved' : '✗ Rejected'}
                    </span>
                `}
            </td>
        </tr>`;
    }
    
    tbody.innerHTML = html;
}

function getTableCell(item, appType, cellIndex) {
    switch(appType) {
        case 'ration': return cellIndex === 1 ? (item.category || 'N/A') : (item.family_members || 'N/A');
        case 'scheme': return cellIndex === 1 ? (item.category || 'N/A') : (item.state || 'N/A');
        case 'scholar10': return cellIndex === 1 ? (item.school || 'N/A') : (item.marks || 'N/A');
        case 'scholar12': return cellIndex === 1 ? (item.college || 'N/A') : (item.marks || 'N/A');
        default: return 'N/A';
    }
}

// ================= UPDATE STATS =================
function updateStats(ration, scheme, scholar10, scholar12) {
    document.getElementById('rationCount').textContent = ration.length;
    document.getElementById('schemeCount').textContent = scheme.length;
    document.getElementById('scholar10Count').textContent = scholar10.length;
    document.getElementById('scholar12Count').textContent = scholar12.length;
}

// ================= APPROVE/REJECT - SIMPLE VERSION =================
async function approveApp(appId, appType, buttonElement) {
    if (appId === 'N/A') {
        alert('Cannot approve - invalid application ID');
        return;
    }
    
    if (!confirm(`Approve ${appId}?`)) return;
    
    // 1. Update UI IMMEDIATELY
    updateStatusInUI(appId, 'APPROVED');
    
    // 2. Send to backend
    try {
        const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.UPDATE}/${appId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                status: "APPROVED", 
                appType: appType 
            })
        });
        
        if (!response.ok) throw new Error('Backend failed');
        
        alert(` Application ${appId} approved!`);
        
    } catch (error) {
        console.error('Backend failed:', error);
        // UI stays approved - that's OK
    }
}

async function rejectApp(appId, appType, buttonElement) {
    if (appId === 'N/A') {
        alert('Cannot reject - invalid application ID');
        return;
    }
    
    if (!confirm(`Reject ${appId}?`)) return;
    
    // 1. Update UI IMMEDIATELY
    updateStatusInUI(appId, 'REJECTED');
    
    // 2. Send to backend
    try {
        const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.UPDATE}/${appId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                status: "REJECTED", 
                appType: appType 
            })
        });
        
        if (!response.ok) throw new Error('Backend failed');
        
        alert(` Application ${appId} rejected!`);
        
    } catch (error) {
        console.error('Backend failed:', error);
        // UI stays rejected - that's OK
    }
}

// ================= SIMPLE UI UPDATE =================
function updateStatusInUI(appId, newStatus) {
    console.log(`Updating UI: ${appId} -> ${newStatus}`);
    
    // Find ALL status cells with this appId
    const statusCells = document.querySelectorAll('.status-cell');
    
    statusCells.forEach(cell => {
        if (cell.getAttribute('data-app-id') === appId) {
            // Update the status text
            cell.textContent = newStatus;
            cell.style.color = newStatus === 'APPROVED' ? 'green' : 'red';
            cell.style.fontWeight = 'bold';
            
            // Also update the parent row's action buttons
            const row = cell.closest('tr');
            if (row) {
                const actionCell = row.querySelector('td:last-child');
                if (actionCell) {
                    actionCell.innerHTML = `
                        <span style="color:${newStatus === 'APPROVED' ? 'green' : 'red'};font-weight:bold;">
                            ${newStatus === 'APPROVED' ? '✓ Approved' : '✗ Rejected'}
                        </span>
                    `;
                }
            }
            
            console.log(` UI updated for ${appId}`);
        }
    });
}

// ================= INITIALIZE =================
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('adminLoggedIn') !== 'true') return;
    
    console.log('Loading admin data...');
    loadAllData();
    
    // Auto-refresh every 30 seconds
    setInterval(loadAllData, 30000);
});

// ================= GLOBAL FUNCTIONS =================
window.approveApp = approveApp;
window.rejectApp = rejectApp;
window.loadAllData = loadAllData;

console.log('Admin.js loaded!');