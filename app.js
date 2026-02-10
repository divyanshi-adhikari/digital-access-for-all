// app.js - Government Scheme Form (FIXED FIELD NAMES)
console.log(" Government Scheme Form Initializing...");

// Configuration
const CONFIG = {
    BACKEND_URL: 'http://localhost:4000',
    ENDPOINT: '/gov/scheme',
    MAX_RETRIES: 2,
    RETRY_DELAY: 1000
};

// ================= UTILITY FUNCTIONS =================
function showMessage(message, type = 'info') {
    console.log(`${type}: ${message}`);
    
    const existingMsg = document.querySelector('.form-message');
    if (existingMsg) existingMsg.remove();
    
    const msgEl = document.createElement('div');
    msgEl.className = `form-message ${type}`;
    msgEl.textContent = message;
    msgEl.style.cssText = `
        padding: 12px 20px;
        margin: 15px 0;
        border-radius: 6px;
        font-weight: bold;
        border: 1px solid;
        background-color: ${type === 'success' ? '#d4edda' : 
                            type === 'error' ? '#f8d7da' : 
                            type === 'warning' ? '#fff3cd' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : 
                type === 'error' ? '#721c24' : 
                type === 'warning' ? '#856404' : '#0c5460'};
        border-color: ${type === 'success' ? '#c3e6cb' : 
                            type === 'error' ? '#f5c6cb' : 
                            type === 'warning' ? '#ffeaa7' : '#bee5eb'};
    `;
    
    const form = document.getElementById('govForm');
    if (form && form.parentNode) {
        form.parentNode.insertBefore(msgEl, form.nextSibling);
    }
    
    if (type !== 'error') {
        setTimeout(() => {
            if (msgEl.parentNode) msgEl.remove();
        }, 5000);
    }
}

// ================= LOCAL STORAGE =================
const STORAGE_KEY = 'pending_scheme_applications';

function saveToLocalStorage(formData) {
    try {
        const pendingApps = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const appWithId = {
            ...formData,
            id: 'scheme_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            savedAt: new Date().toISOString(),
            status: 'pending'
        };
        
        pendingApps.push(appWithId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingApps));
        
        console.log(' Saved locally with ID:', appWithId.id);
        return { success: true, id: appWithId.id };
    } catch (error) {
        console.error(' Local storage error:', error);
        return { success: false, error: error.message };
    }
}

function updateLocalStatus(id, status, message) {
    try {
        const pendingApps = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const appIndex = pendingApps.findIndex(app => app.id === id);
        
        if (appIndex !== -1) {
            pendingApps[appIndex].status = status;
            pendingApps[appIndex].syncedAt = new Date().toISOString();
            pendingApps[appIndex].syncMessage = message;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingApps));
            console.log(` Updated ${id} to ${status}`);
        }
        
        return { success: true };
    } catch (error) {
        console.error('Update status error:', error);
        return { success: false };
    }
}

function getPendingApplications() {
    try {
        const allApps = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return allApps.filter(app => app.status === 'pending');
    } catch (error) {
        console.error('Get pending error:', error);
        return [];
    }
}

// ================= GET FORM DATA =================
function getFormData() {
    // SAFE way to get form data
    const getValue = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    };
    
    return {
        name: getValue('name'),
        dob: getValue('dob'),
        state: getValue('state'),
        city: getValue('city'),
        address: getValue('address'),
        category: getValue('category'),
        income: getValue('income')
    };
}

// ================= VALIDATE FORM =================
function validateForm(formData) {
    const errors = [];
    
    if (!formData.name) errors.push('name');
    if (!formData.dob) errors.push('dob');
    if (!formData.state) errors.push('state');
    if (!formData.city) errors.push('city');
    if (!formData.address) errors.push('address');
    if (!formData.category) errors.push('category');
    if (!formData.income) errors.push('income');
    
    if (errors.length > 0) {
        return {
            valid: false,
            message: `Missing fields: ${errors.join(', ')}`
        };
    }
    
    const income = parseFloat(formData.income);
    if (isNaN(income) || income < 0) {
        return {
            valid: false,
            message: 'Income must be a valid positive number'
        };
    }
    
    return { valid: true };
}

// ================= SUBMIT TO BACKEND (FIXED FIELD NAMES) =================
async function submitToBackend(formData, retryCount = 0) {
    console.log(`Submitting to backend (attempt ${retryCount + 1})`);
    
    try {
        const payload = {
            name: formData.name,
            dob: formData.dob,
            state: formData.state,
            city: formData.city,
            address: formData.address,
            category: formData.category,
            income: parseFloat(formData.income),
            submission_time: new Date().toISOString()
        };
        
        console.log(' Payload to backend:', payload);
        console.log(' Payload JSON:', JSON.stringify(payload));
        
        // Submit to backend
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(`${CONFIG.BACKEND_URL}${CONFIG.ENDPOINT}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
        
        console.log(` Response status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const result = await response.json();
            console.log(' Backend submission successful:', result);
            return { success: true, data: result };
        } else {
            let errorText = 'Server error';
            try {
                const errorData = await response.json();
                errorText = JSON.stringify(errorData);
            } catch (e) {
                try {
                    errorText = await response.text();
                } catch (e2) {
                    errorText = `Status: ${response.status}`;
                }
            }
            
            console.error(' Server error:', errorText);
            
            // Retry on server errors
            if (retryCount < CONFIG.MAX_RETRIES && response.status >= 500) {
                console.log(` Retrying in ${CONFIG.RETRY_DELAY}ms...`);
                await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
                return await submitToBackend(formData, retryCount + 1);
            }
            
            return { 
                success: false, 
                error: errorText,
                status: response.status
            };
        }
        
    } catch (error) {
        console.error( 'Network error:', error.message);
        
        if (retryCount < CONFIG.MAX_RETRIES) {
            console.log(` Retrying network error in ${CONFIG.RETRY_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
            return await submitToBackend(formData, retryCount + 1);
        }
        
        return { 
            success: false, 
            error: `Network error: ${error.message}` 
        };
    }
}

// ================= CHECK BACKEND CONNECTION =================
async function checkBackendConnection() {
    try {
        const response = await fetch(CONFIG.BACKEND_URL, {
            method: 'HEAD',
            cache: 'no-cache'
        }).catch(() => null);
        
        const isConnected = response && response.ok;
        console.log(`Backend connection: ${isConnected ? ' Connected' : ' Not connected'}`);
        return isConnected;
    } catch (error) {
        console.log('Backend connection check failed:', error.message);
        return false;
    }
}

// ================= FORM SUBMISSION HANDLER =================
async function handleFormSubmit(event) {
    event.preventDefault();
    console.log(' Form submission started');
    
    const form = document.getElementById('govForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";
    submitBtn.style.opacity = "0.7";
    submitBtn.style.cursor = "not-allowed";
    
    try {
        // 1. Get form data
        const formData = getFormData();
        console.log(' Form data collected:', formData);
        
        // 2. Validate
        const validation = validateForm(formData);
        if (!validation.valid) {
            showMessage(validation.message, 'error');
            return;
        }
        
        // 3. Save locally first
        showMessage(" Saving details locally...", "info");
        const saveResult = saveToLocalStorage(formData);
        
        if (!saveResult.success) {
            throw new Error("Failed to save locally");
        }
        
        // 4. Try online submission if connected
        const isBrowserOnline = navigator.onLine;
        console.log(` Browser online status: ${isBrowserOnline ? 'Online' : 'Offline'}`);
        
        if (isBrowserOnline) {
            const isBackendConnected = await checkBackendConnection();
            
            if (isBackendConnected) {
                showMessage(" Submitting online...", "info");
                
                const backendResult = await submitToBackend(formData);
                
                if (backendResult.success) {
                    updateLocalStatus(saveResult.id, 'synced', 'Submitted successfully');
                    showMessage(" Application submitted successfully!", "success");
                    console.log(' Form submitted and synced!');
                    
                    // Reset form
                    form.reset();
                    
                    // Set default date
                    const dobField = document.getElementById('dob');
                    if (dobField) {
                        const today = new Date().toISOString().split('T')[0];
                        dobField.value = today;
                    }
                } else {
                    updateLocalStatus(saveResult.id, 'pending', backendResult.error);
                    showMessage(" Saved locally. Server error: " + backendResult.error, "warning");
                    console.log('Backend submission failed:', backendResult.error);
                }
            } else {
                updateLocalStatus(saveResult.id, 'pending', 'Backend not reachable');
                showMessage(" Saved locally. Server connection issue.", "warning");
                console.log('Backend not reachable despite being online');
            }
        } else {
            updateLocalStatus(saveResult.id, 'pending', 'Device offline');
            showMessage(" Saved offline. Will sync when back online.", "warning");
            console.log('Offline mode - saved locally only');
        }
        
    } catch (error) {
        console.error(' Form submission error:', error);
        showMessage(` Error: ${error.message}`, "error");
        
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = "1";
        submitBtn.style.cursor = "pointer";
    }
}

// ================= AUTO SYNC =================
async function retryPendingSubmissions() {
    console.log(" Checking for pending submissions...");
    
    if (!navigator.onLine) {
        console.log('Device is offline, skipping auto-sync');
        return;
    }
    
    const isBackendConnected = await checkBackendConnection();
    if (!isBackendConnected) {
        console.log('Backend not reachable, skipping auto-sync');
        return;
    }
    
    const pendingApps = getPendingApplications();
    console.log(`Found ${pendingApps.length} pending applications`);
    
    if (pendingApps.length === 0) return;
    
    showMessage(`Syncing ${pendingApps.length} pending application(s)...`, "info");
    
    let successCount = 0;
    
    for (const app of pendingApps) {
        try {
            console.log(`Retrying submission for app ${app.id}`);
            
            // Extract form data
            const { id, savedAt, status, syncedAt, syncMessage, ...formData } = app;
            
            const result = await submitToBackend(formData);
            
            if (result.success) {
                updateLocalStatus(app.id, 'synced', 'Auto-synced successfully');
                successCount++;
                console.log(` Auto-synced app ${app.id}`);
            } else {
                console.log(` Failed to auto-sync app ${app.id}:`, result.error);
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.error(`Error syncing app ${app.id}:`, error);
        }
    }
    
    if (successCount > 0) {
        showMessage(` Successfully synced ${successCount} application(s)`, "success");
    }
}

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing form...");
    
    const form = document.getElementById('govForm');
    
    if (!form) {
        console.error(" Form with ID 'govForm' not found!");
        return;
    }
    
    console.log(" Form found");
    
    // Add submit handler
    form.addEventListener('submit', handleFormSubmit);
    
    // Set today's date as default
    const dobField = document.getElementById('dob');
    if (dobField) {
        const today = new Date().toISOString().split('T')[0];
        dobField.value = today;
        console.log('Set default date to:', today);
    }
    
    // Update online status
    updateOnlineStatus();
    
    // Check for pending submissions
    setTimeout(async () => {
        if (navigator.onLine) {
            const isConnected = await checkBackendConnection();
            if (isConnected) {
                retryPendingSubmissions();
            }
        }
    }, 2000);
});

// ================= ONLINE/OFFLINE STATUS =================
function updateOnlineStatus() {
    const statusElement = document.getElementById('offline-status');
    if (!statusElement) return;
    
    if (navigator.onLine) {
        statusElement.textContent = ' Online - Ready to submit';
        statusElement.style.color = 'green';
    } else {
        statusElement.textContent = '⚠ Offline - Saving locally';
        statusElement.style.color = 'orange';
    }
}

// Network event listeners
window.addEventListener('online', function() {
    console.log(' Device came online');
    updateOnlineStatus();
    
    setTimeout(() => {
        showMessage(" Back online, checking for pending submissions...", "info");
        retryPendingSubmissions();
    }, 1500);
});

window.addEventListener('offline', function() {
    console.log(' Device went offline');
    updateOnlineStatus();
    showMessage(" You are now offline", "warning");
});

// ================= TEST FUNCTIONS =================
window.testSubmit = async function() {
    console.log("Testing direct backend submission...");
    
    // Create test data with CORRECT field names
    const testData = {
        name: "Test User",
        dob: "1990-01-01",
        state: "Maharashtra",
        city: "Mumbai",
        address: "Test Address",
        category: "general",
        income: 500000
    };
    
    console.log("Test payload:", testData);
    
    try {
        const response = await fetch(`${CONFIG.BACKEND_URL}${CONFIG.ENDPOINT}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });
        
        const result = await response.json();
        console.log("Test response:", result);
        alert(`Test result: ${response.ok ? 'SUCCESS' : 'FAILED'}\n\n${JSON.stringify(result, null, 2)}`);
        
    } catch (error) {
        console.error("Test failed:", error);
        alert("Test failed: " + error.message);
    }
};

window.checkPayload = function() {
    // Get current form values
    const formData = getFormData();
    
    // Create payload exactly as it would be sent
    const payload = {
        name: formData.name,
        dob: formData.dob,
        state: formData.state,
        city: formData.city,
        address: formData.address,
        category: formData.category,
        income: parseFloat(formData.income) || 0,
        submission_time: new Date().toISOString()
    };
    
    console.log("Current form payload would be:", payload);
    console.log("JSON string:", JSON.stringify(payload));
    
    alert("Payload that will be sent:\n\n" + JSON.stringify(payload, null, 2));
};

console.log("Form system initialized!");
console.log("Test commands:");
console.log("testSubmit() - Test backend directly");
console.log("checkPayload() - Check what data will be sent");