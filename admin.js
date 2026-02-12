// ================= ADMIN.JS - PERMANENT STATUS FIX =================
const API_BASE = ""; 
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
    refreshBtn.textContent = ' Refresh';
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

// ================= AUTO-REFRESH SYSTEM =================
let autoRefreshEnabled = true;
let refreshInterval = null;

// Function to start auto-refresh
function startAutoRefresh(intervalSeconds = 5) {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    refreshInterval = setInterval(() => {
        if (autoRefreshEnabled && navigator.onLine) {
            console.log(' Auto-refreshing dashboard...');
            loadAllData();
        }
    }, intervalSeconds * 1000);
    
    console.log(` Auto-refresh started (every ${intervalSeconds}s)`);
}

// Function to stop auto-refresh
function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
        console.log(' Auto-refresh stopped');
    }
}

// Listen for sync events from form pages
function setupSyncListeners() {
    // Method 1: localStorage events (works across tabs)
    window.addEventListener('storage', function(event) {
        if (event.key === 'last_sync_time') {
            const syncTime = parseInt(event.newValue);
            const now = Date.now();
            
            // If sync happened less than 10 seconds ago
            if (now - syncTime < 10000) {
                console.log(' Sync detected in another tab! Refreshing...');
                loadAllData();
            }
        }
    });
    
    // Method 2: BroadcastChannel (modern browsers)
    if (typeof BroadcastChannel !== 'undefined') {
        const syncChannel = new BroadcastChannel('sync_channel');
        syncChannel.onmessage = function(event) {
            if (event.data.type === 'sync_complete') {
                console.log(` ${event.data.count} apps synced, refreshing...`);
                loadAllData();
            }
        };
    }
    
    // Method 3: Page visibility (user comes back to tab)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && navigator.onLine) {
            console.log(' Page became visible, refreshing...');
            setTimeout(loadAllData, 1000);
        }
    });
}

// Add auto-refresh controls to dashboard
function addAutoRefreshControls() {
    const controlsDiv = document.createElement('div');
    controlsDiv.style.cssText = `
        position: fixed;
        bottom: 60px;
        right: 20px;
        background: white;
        padding: 10px 15px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        border: 1px solid #ddd;
        font-size: 14px;
    `;
    
    controlsDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <input type="checkbox" id="autoRefreshToggle" checked>
            <label for="autoRefreshToggle" style="font-weight: bold;">Auto-refresh (5s)</label>
        </div>
        <div style="display: flex; gap: 5px;">
            <button id="refreshNowBtn" style="background: #4CAF50; color: white; border: none; 
                    padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">
                 Refresh Now
            </button>
            <button id="testSyncBtn" style="background: #9C27B0; color: white; border: none; 
                    padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">
                 Test Sync
            </button>
        </div>
    `;
    
    document.body.appendChild(controlsDiv);
    
    // Toggle auto-refresh
    const toggle = document.getElementById('autoRefreshToggle');
    toggle.checked = autoRefreshEnabled;
    toggle.onchange = function() {
        autoRefreshEnabled = this.checked;
        if (autoRefreshEnabled) {
            startAutoRefresh(5);
            showNotification(' Auto-refresh enabled', 'success');
        } else {
            stopAutoRefresh();
            showNotification('Auto-refresh paused', 'warning');
        }
    };
    
    // Manual refresh button
    document.getElementById('refreshNowBtn').onclick = function() {
        loadAllData();
        showNotification(' Manual refresh triggered', 'info');
    };
    
    // Test sync button
    document.getElementById('testSyncBtn').onclick = function() {
        testSyncNotification();
    };
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : 
                     type === 'error' ? '#f44336' : 
                     type === 'warning' ? '#ff9800' : '#2196F3'};
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        font-weight: bold;
        animation: slideIn 0.3s ease;
    `;
    
    // Add CSS animation if not exists
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 3000);
}

// Test sync notification
function testSyncNotification() {
    // Simulate a sync event
    localStorage.setItem('last_sync_time', Date.now());
    
    // Also send broadcast message
    if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('sync_channel');
        channel.postMessage({ 
            type: 'sync_complete', 
            count: 3,
            timestamp: new Date().toISOString()
        });
        setTimeout(() => channel.close(), 100);
    }
    
    showNotification(' Test sync triggered! Dashboard should refresh...', 'info');
}

// Add last update time display
function addLastUpdateDisplay() {
    const updateDiv = document.createElement('div');
    updateDiv.id = 'lastUpdateDisplay';
    updateDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        font-size: 12px;
        color: #666;
        background: white;
        padding: 5px 10px;
        border-radius: 3px;
        border: 1px solid #ddd;
        font-family: monospace;
    `;
    updateDiv.textContent = 'Last update: Just now';
    document.body.appendChild(updateDiv);
    
    // Update every second
    setInterval(() => {
        const lastUpdate = window.lastDashboardUpdate || 0;
        const secondsAgo = Math.floor((Date.now() - lastUpdate) / 1000);
        
        let text = 'Never';
        if (secondsAgo < 60) {
            text = `${secondsAgo}s ago`;
        } else if (secondsAgo < 3600) {
            text = `${Math.floor(secondsAgo/60)}m ago`;
        }
        
        updateDiv.textContent = `Last update: ${text}`;
    }, 1000);
}

// Modify your existing loadAllData to update timestamp
const originalLoadAllData = loadAllData;
window.loadAllData = async function() {
    await originalLoadAllData();
    window.lastDashboardUpdate = Date.now();
};