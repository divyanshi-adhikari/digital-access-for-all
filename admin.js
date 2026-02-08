// ================= CONFIGURATION =================
const CONFIG = {
    BASE_URL: "http://localhost:4000",
    API_ENDPOINTS: {
        RATION: "/gov/ration",
        SCHEME: "/gov/scheme",
        SCHOLAR10: "/gov/scholar10",
        SCHOLAR12: "/gov/scholar12",
        UPDATE_STATUS: "/gov/application"
    },
    UPDATE_TYPES: {
        RATION: 'ration',
        SCHEME: 'scheme',
        SCHOLAR10: 'scholar10',
        SCHOLAR12: 'scholar12'
    }
};

// ================= AUTHENTICATION GUARD =================
(function checkAuth() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        alert(' Access Denied\nPlease login first.');
        window.location.href = 'admin-login.html';
        return; // Stop execution
    }
    
    console.log('Admin authenticated');
})();

// ================= UTILITY FUNCTIONS =================
class ApiService {
    static async fetchData(endpoint) {
        try {
            console.log(` Fetching: ${CONFIG.BASE_URL}${endpoint}`);
            const response = await fetch(`${CONFIG.BASE_URL}${endpoint}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`Loaded ${data.length || 0} items from ${endpoint}`);
            return data;
        } catch (error) {
            console.error(` Error fetching ${endpoint}:`, error);
            this.showError(`Failed to load data from ${endpoint}`);
            return [];
        }
    }
    
    static async updateStatus(applicationId, status, appType) {
        try {
            const response = await fetch(
                `${CONFIG.BASE_URL}${CONFIG.API_ENDPOINTS.UPDATE_STATUS}/${applicationId}`,
                {
                    method: "PATCH",
                    headers: { 
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ 
                        status: status.toUpperCase(),
                        appType: appType 
                    })
                }
            );
            
            if (!response.ok) {
                throw new Error(`Update failed: HTTP ${response.status}`);
            }
            
            const result = await response.json();
            console.log(` Status updated for ${applicationId}: ${status}`);
            return result;
        } catch (error) {
            console.error(`Error updating status:`, error);
            this.showError(`Failed to update status: ${error.message}`);
            throw error;
        }
    }
    
    static showError(message) {
        alert(` Error\n${message}\n\nCheck console for details.`);
    }
    
    static showSuccess(message) {
        alert(` Success\n${message}`);
    }
}

// ================= DATA LOADING FUNCTIONS =================
async function loadAllData() {
    console.log('Loading all dashboard data...');
    
    try {
        // Load all data in parallel
        const [rationData, schemeData, scholar10Data, scholar12Data] = await Promise.all([
            loadRation(),
            loadScheme(),
            loadScholar10(),
            loadScholar12()
        ]);
        
        // Update stats
        updateStats(rationData, schemeData, scholar10Data, scholar12Data);
        
        console.log(' All data loaded successfully');
    } catch (error) {
        console.error(' Error loading data:', error);
    }
}

function updateStats(rationData, schemeData, scholar10Data, scholar12Data) {
    document.getElementById('rationCount').textContent = rationData.length || 0;
    document.getElementById('schemeCount').textContent = schemeData.length || 0;
    document.getElementById('scholar10Count').textContent = scholar10Data.length || 0;
    document.getElementById('scholar12Count').textContent = scholar12Data.length || 0;
    
    // Update colors based on count
    updateStatColor('rationCount', rationData.length);
    updateStatColor('schemeCount', schemeData.length);
    updateStatColor('scholar10Count', scholar10Data.length);
    updateStatColor('scholar12Count', scholar12Data.length);
}

function updateStatColor(elementId, count) {
    const element = document.getElementById(elementId);
    if (count === 0) {
        element.style.color = '#95a5a6';
    } else if (count > 10) {
        element.style.color = '#e74c3c';
    } else {
        element.style.color = '#2c3e50';
    }
}

// ================= APPLICATION SPECIFIC LOADERS =================
async function loadRation() {
    const data = await ApiService.fetchData(CONFIG.API_ENDPOINTS.RATION);
    renderTable('rationTable', data, CONFIG.UPDATE_TYPES.RATION, renderRationRow);
    return data;
}

async function loadScheme() {
    const data = await ApiService.fetchData(CONFIG.API_ENDPOINTS.SCHEME);
    renderTable('schemeTable', data, CONFIG.UPDATE_TYPES.SCHEME, renderSchemeRow);
    return data;
}

async function loadScholar10() {
    const data = await ApiService.fetchData(CONFIG.API_ENDPOINTS.SCHOLAR10);
    renderTable('scholar10Table', data, CONFIG.UPDATE_TYPES.SCHOLAR10, renderScholar10Row);
    return data;
}

async function loadScholar12() {
    const data = await ApiService.fetchData(CONFIG.API_ENDPOINTS.SCHOLAR12);
    renderTable('scholar12Table', data, CONFIG.UPDATE_TYPES.SCHOLAR12, renderScholar12Row);
    return data;
}

// ================= TABLE RENDER FUNCTIONS =================
function renderTable(tableId, data, appType, rowRenderer) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    
    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #7f8c8d;">
                    📭 No applications found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    data.forEach(item => {
        tbody.innerHTML += rowRenderer(item, appType);
    });
}

function renderRationRow(item, appType) {
    const status = item.status || 'PENDING';
    return `
        <tr>
            <td><strong>${item.applicationId || item.id || 'N/A'}</strong></td>
            <td>${item.name || 'N/A'}</td>
            <td>${item.category || 'N/A'}</td>
            <td>${item.family_members || item.familyMembers || 'N/A'}</td>
            <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
            <td>
                <div class="action-buttons">
                    ${status === 'PENDING' ? `
                        <button class="btn-approve" onclick="handleApprove('${item.applicationId || item.id}', '${appType}')">
                            Approve
                        </button>
                        <button class="btn-reject" onclick="handleReject('${item.applicationId || item.id}', '${appType}')">
                            Reject
                        </button>
                    ` : `
                        <span style="color: #7f8c8d; font-size: 12px;">
                            ${status === 'APPROVED' ? ' Approved' : 'Rejected'}
                        </span>
                    `}
                </div>
            </td>
        </tr>
    `;
}

function renderSchemeRow(item, appType) {
    const status = item.status || 'PENDING';
    return `
        <tr>
            <td><strong>${item.applicationId || item.id || 'N/A'}</strong></td>
            <td>${item.name || 'N/A'}</td>
            <td>${item.category || 'N/A'}</td>
            <td>${item.state || 'N/A'}</td>
            <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
            <td>
                <div class="action-buttons">
                    ${status === 'PENDING' ? `
                        <button class="btn-approve" onclick="handleApprove('${item.applicationId || item.id}', '${appType}')">
                            Approve
                        </button>
                        <button class="btn-reject" onclick="handleReject('${item.applicationId || item.id}', '${appType}')">
                            Reject
                        </button>
                    ` : `
                        <span style="color: #7f8c8d; font-size: 12px;">
                            ${status === 'APPROVED' ? 'Approved' : ' Rejected'}
                        </span>
                    `}
                </div>
            </td>
        </tr>
    `;
}

function renderScholar10Row(item, appType) {
    const status = item.status || 'PENDING';
    return `
        <tr>
            <td><strong>${item.applicationId || item.id || 'N/A'}</strong></td>
            <td>${item.name || 'N/A'}</td>
            <td>${item.school || 'N/A'}</td>
            <td>${item.marks || 'N/A'}</td>
            <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
            <td>
                <div class="action-buttons">
                    ${status === 'PENDING' ? `
                        <button class="btn-approve" onclick="handleApprove('${item.applicationId || item.id}', '${appType}')">
                            Approve
                        </button>
                        <button class="btn-reject" onclick="handleReject('${item.applicationId || item.id}', '${appType}')">
                            Reject
                        </button>
                    ` : `
                        <span style="color: #7f8c8d; font-size: 12px;">
                            ${status === 'APPROVED' ? ' Approved' : 'Rejected'}
                        </span>
                    `}
                </div>
            </td>
        </tr>
    `;
}

function renderScholar12Row(item, appType) {
    const status = item.status || 'PENDING';
    return `
        <tr>
            <td><strong>${item.applicationId || item.id || 'N/A'}</strong></td>
            <td>${item.name || 'N/A'}</td>
            <td>${item.college || 'N/A'}</td>
            <td>${item.marks || 'N/A'}</td>
            <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
            <td>
                <div class="action-buttons">
                    ${status === 'PENDING' ? `
                        <button class="btn-approve" onclick="handleApprove('${item.applicationId || item.id}', '${appType}')">
                            Approve
                        </button>
                        <button class="btn-reject" onclick="handleReject('${item.applicationId || item.id}', '${appType}')">
                            Reject
                        </button>
                    ` : `
                        <span style="color: #7f8c8d; font-size: 12px;">
                            ${status === 'APPROVED' ? ' Approved' : ' Rejected'}
                        </span>
                    `}
                </div>
            </td>
        </tr>
    `;
}

// ================= ACTION HANDLERS =================
async function handleApprove(applicationId, appType) {
    if (!confirm(` Approve Application ${applicationId}?\n\nThis action cannot be undone.`)) {
        return;
    }
    
    try {
        await ApiService.updateStatus(applicationId, 'APPROVED', appType);
        ApiService.showSuccess(`Application ${applicationId} approved successfully!`);
        
        // Reload only the specific table
        await reloadSpecificTable(appType);
    } catch (error) {
        console.error('Approval failed:', error);
    }
}

async function handleReject(applicationId, appType) {
    if (!confirm(`Reject Application ${applicationId}?\n\nThis action cannot be undone.`)) {
        return;
    }
    
    try {
        await ApiService.updateStatus(applicationId, 'REJECTED', appType);
        ApiService.showSuccess(`Application ${applicationId} rejected.`);
        
        // Reload only the specific table
        await reloadSpecificTable(appType);
    } catch (error) {
        console.error('Rejection failed:', error);
    }
}

async function reloadSpecificTable(appType) {
    switch (appType) {
        case CONFIG.UPDATE_TYPES.RATION:
            await loadRation();
            break;
        case CONFIG.UPDATE_TYPES.SCHEME:
            await loadScheme();
            break;
        case CONFIG.UPDATE_TYPES.SCHOLAR10:
            await loadScholar10();
            break;
        case CONFIG.UPDATE_TYPES.SCHOLAR12:
            await loadScholar12();
            break;
    }
}

// ================= SEARCH FUNCTIONALITY =================
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        filterAllTables(query);
    });
    
    // Add keyboard shortcut
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
        
        // ESC to clear search
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            searchInput.value = '';
            filterAllTables('');
        }
    });
}

function filterAllTables(query) {
    const tables = [
        'rationTable',
        'schemeTable',
        'scholar10Table',
        'scholar12Table'
    ];
    
    tables.forEach(tableId => {
        filterTable(tableId, query);
    });
}

function filterTable(tableId, query) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const isVisible = !query || text.includes(query);
        row.style.display = isVisible ? '' : 'none';
    });
}

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', function() {
    console.log(' Admin Dashboard Initializing...');
    
    // Check authentication
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Setup search
    setupSearch();
    
    // Load all data
    loadAllData();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        console.log(' Auto-refreshing data...');
        loadAllData();
    }, 30000);
    
    console.log('Admin Dashboard Ready');
});

// ================= GLOBAL EXPORTS =================
// Make functions available globally for onclick handlers
window.handleApprove = handleApprove;
window.handleReject = handleReject;
window.logout = function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('loginTime');
        window.location.href = 'admin-login.html';
    }
};