// ================= ADMIN.JS - OPTIMIZED FAST VERSION =================


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

// ================= SHOW LOADING STATE =================
function showLoading() {
    // Show loading in all tables
    ['rationTable', 'schemeTable', 'scholar10Table', 'scholar12Table'].forEach(tableId => {
        const table = document.getElementById(tableId);
        if (table) {
            const tbody = table.querySelector('tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:#666;">🔄 Loading...</td></tr>';
            }
        }
    });
    
    // Update stats to 0 initially
    ['rationCount', 'schemeCount', 'scholar10Count', 'scholar12Count'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '0';
    });
}

// ================= FAST DATA LOADING =================
async function loadAllDataFast() {
    console.time('DataLoadTime'); // Start timer
    
    showLoading(); // Show loading immediately
    
    try {
        // Load ALL data in parallel (not sequentially)
        const [rationData, schemeData, scholar10Data, scholar12Data] = await Promise.all([
            fetchDataFast(CONFIG.ENDPOINTS.RATION),
            fetchDataFast(CONFIG.ENDPOINTS.SCHEME),
            fetchDataFast(CONFIG.ENDPOINTS.SCHOLAR10),
            fetchDataFast(CONFIG.ENDPOINTS.SCHOLAR12)
        ]);
        
        // Render ALL tables in parallel
        await Promise.all([
            renderTableFast('rationTable', rationData, 'ration'),
            renderTableFast('schemeTable', schemeData, 'scheme'),
            renderTableFast('scholar10Table', scholar10Data, 'scholar10'),
            renderTableFast('scholar12Table', scholar12Data, 'scholar12')
        ]);
        
        // Update stats
        updateStatsFast(rationData, schemeData, scholar10Data, scholar12Data);
        
        console.timeEnd('DataLoadTime'); // End timer
        console.log(` Loaded: ${rationData.length} ration, ${schemeData.length} scheme, ${scholar10Data.length} scholar10, ${scholar12Data.length} scholar12`);
        
    } catch (error) {
        console.error(' Load error:', error);
        showError('Failed to load data');
    }
}

// ================= OPTIMIZED FETCH =================
async function fetchDataFast(endpoint) {
    try {
        const response = await fetch(`${CONFIG.BASE_URL}${endpoint}`, {
            // Timeout after 5 seconds
            signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) return [];
        
        const data = await response.json();
        
        // Quick data extraction
        if (Array.isArray(data)) return data;
        if (data?.data && Array.isArray(data.data)) return data.data;
        if (data?.success && data.data) return data.data;
        
        return [];
        
    } catch (error) {
        console.warn(` Failed to fetch ${endpoint}:`, error);
        return []; // Return empty array on error
    }
}

// ================= OPTIMIZED RENDER =================
function renderTableFast(tableId, data, appType) {
    return new Promise(resolve => {
        // Use setTimeout to avoid blocking UI
        setTimeout(() => {
            const table = document.getElementById(tableId);
            if (!table) {
                resolve();
                return;
            }
            
            const tbody = table.querySelector('tbody');
            if (!tbody) {
                resolve();
                return;
            }
            
            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:#999;">📭 No applications</td></tr>';
                resolve();
                return;
            }
            
            // Fast string concatenation
            let html = '';
            for (const item of data) {
                const status = item.status || 'PENDING';
                const appId = item.id || item.applicationId || 'N/A';
                
                html += `
                <tr>
                    <td><strong>${appId}</strong></td>
                    <td>${item.name || 'N/A'}</td>
                    <td>${getTableCell(item, appType, 1)}</td>
                    <td>${getTableCell(item, appType, 2)}</td>
                    <td>
                        <span style="color: ${status === 'APPROVED' ? 'green' : status === 'REJECTED' ? 'red' : 'orange'}; font-weight:bold;">
                            ${status}
                        </span>
                    </td>
                    <td>
                        ${status === 'PENDING' ? `
                            <button onclick="approveFast('${appId}', '${appType}')" 
                                    style="background:green;color:white;border:none;padding:4px 8px;border-radius:3px;margin-right:4px;cursor:pointer;font-size:12px;">
                                
                            </button>
                            <button onclick="rejectFast('${appId}', '${appType}')" 
                                    style="background:red;color:white;border:none;padding:4px 8px;border-radius:3px;cursor:pointer;font-size:12px;">
                                
                            </button>
                        ` : `
                            <span style="color:#666;font-size:12px;">
                                ${status === 'APPROVED' ? '✓ Done' : '✗ Done'}
                            </span>
                        `}
                    </td>
                </tr>`;
            }
            
            tbody.innerHTML = html;
            resolve();
        }, 0); // Minimal delay
    });
}

// ================= HELPER: GET TABLE CELL CONTENT =================
function getTableCell(item, appType, cellIndex) {
    switch(appType) {
        case 'ration':
            return cellIndex === 1 ? (item.category || 'N/A') : (item.family_members || item.familyMembers || 'N/A');
        case 'scheme':
            return cellIndex === 1 ? (item.category || 'N/A') : (item.state || 'N/A');
        case 'scholar10':
            return cellIndex === 1 ? (item.school || 'N/A') : (item.marks || 'N/A');
        case 'scholar12':
            return cellIndex === 1 ? (item.college || 'N/A') : (item.marks || 'N/A');
        default:
            return 'N/A';
    }
}

// ================= FAST STATS UPDATE =================
function updateStatsFast(ration, scheme, scholar10, scholar12) {
    const stats = {
        'rationCount': ration.length,
        'schemeCount': scheme.length,
        'scholar10Count': scholar10.length,
        'scholar12Count': scholar12.length
    };
    
    for (const [id, count] of Object.entries(stats)) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = count;
            el.style.color = count > 0 ? '#2c3e50' : '#95a5a6';
        }
    }
}

// ================= FAST APPROVE/REJECT =================
async function approveFast(appId, appType) {
    if (!confirm(`Approve #${appId}?`)) return;
    
    await updateStatusFast(appId, appType, 'APPROVED');
}

async function rejectFast(appId, appType) {
    if (!confirm(`Reject #${appId}?`)) return;
    
    await updateStatusFast(appId, appType, 'REJECTED');
}

async function updateStatusFast(appId, appType, newStatus) {
    const tableId = appType + 'Table';
    const table = document.getElementById(tableId);
    if (!table) return;
    
    // Find and update row immediately
    const rows = table.querySelectorAll('tbody tr');
    for (const row of rows) {
        const idCell = row.querySelector('td:first-child strong');
        if (idCell && idCell.textContent === appId) {
            // Update status cell
            const statusCell = row.querySelector('td:nth-child(5) span');
            if (statusCell) {
                statusCell.textContent = newStatus;
                statusCell.style.color = newStatus === 'APPROVED' ? 'green' : 'red';
            }
            
            // Update action buttons
            const actionCell = row.querySelector('td:last-child');
            if (actionCell) {
                actionCell.innerHTML = `<span style="color:#666;font-size:12px;">${newStatus === 'APPROVED' ? '✓ Done' : '✗ Done'}</span>`;
            }
            
            break;
        }
    }
    
    // Send to backend (don't wait for response to update UI)
    fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.UPDATE}/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, appType: appType })
    })
    .then(response => {
        if (!response.ok) {
            console.error('Backend update failed');
            // Could revert here if needed
        }
    })
    .catch(error => console.error('Network error:', error));
    
    alert(`Application ${appId} ${newStatus.toLowerCase()}ed!`);
}

// ================= ERROR HANDLING =================
function showError(message) {
    // Update all tables with error message
    ['rationTable', 'schemeTable', 'scholar10Table', 'scholar12Table'].forEach(tableId => {
        const table = document.getElementById(tableId);
        if (table) {
            const tbody = table.querySelector('tbody');
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:#e74c3c;">⚠️ ${message}</td></tr>`;
            }
        }
    });
}

// ================= INITIALIZE =================
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('adminLoggedIn') !== 'true') return;
    
    console.log(' Starting FAST load...');
    
    // Load data immediately
    loadAllDataFast();
    
    // Add refresh button handler if exists
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.onclick = loadAllDataFast;
    }
});

// ================= GLOBAL FUNCTIONS =================
window.approveFast = approveFast;
window.rejectFast = rejectFast;
window.loadAllDataFast = loadAllDataFast;

console.log(' Ultra-fast Admin.js loaded!');