console.log(" Government Scheme Form Initializing...");

// Configuration
const CONFIG = {
    BACKEND_URL: 'http://localhost:4000',
    ENDPOINT: '/gov/scheme',
    MAX_RETRIES: 2,
    RETRY_DELAY: 1000
};

// ================= TRACK SYNC STATE =================
let isSyncing = false;

// ================= SHOW SYNC NOTIFICATION =================
function showSyncNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = 'sync-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : 
                     type === 'error' ? '#f44336' : 
                     type === 'warning' ? '#ff9800' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        font-weight: bold;
        max-width: 300px;
        animation: slideIn 0.3s ease;
        border-left: 5px solid ${type === 'success' ? '#45a049' : 
                             type === 'error' ? '#d32f2f' : 
                             type === 'warning' ? '#f57c00' : '#1976D2'};
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span>${type === 'success' ? '' : 
                   type === 'error' ? '' : 
                   type === 'warning' ? '' : ''}</span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add CSS animations if not already present
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
    
    // Auto-remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, duration);
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
    
    if (!formData.name) errors.push('Full Name');
    if (!formData.dob) errors.push('Date of Birth');
    if (!formData.state) errors.push('State');
    if (!formData.city) errors.push('City');
    if (!formData.address) errors.push('Address');
    if (!formData.category) errors.push('Category');
    if (!formData.income) errors.push('Annual Income');
    
    if (errors.length > 0) {
        return {
            valid: false,
            message: `Please fill: ${errors.join(', ')}`
        };
    }
    
    const income = parseFloat(formData.income);
    if (isNaN(income) || income < 0) {
        return {
            valid: false,
            message: 'Annual Income must be a valid positive number'
        };
    }
    
    return { valid: true };
}

// ================= FAST SUBMIT TO BACKEND =================
async function submitToBackend(formData, dbId = null, retryCount = 0) {
    console.log(` Submitting to backend (attempt ${retryCount + 1})`);
    
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
        
        console.log(' Payload:', payload);
        
        // Add timeout for faster failure
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
        
        console.log(` Response: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Backend submission successful:', result);
            
            if (dbId) {
                await updateLocalStatus(dbId, 'synced', JSON.stringify(result));
            }
            
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
            
            console.error('Server error:', errorText);
            
            // Retry on server errors
            if (retryCount < CONFIG.MAX_RETRIES && response.status >= 500) {
                console.log(` Retrying in ${CONFIG.RETRY_DELAY}ms...`);
                await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
                return await submitToBackend(formData, dbId, retryCount + 1);
            }
            
            return { 
                success: false, 
                error: errorText,
                status: response.status
            };
        }
        
    } catch (error) {
        console.error(' Network error:', error.message);
        
        if (retryCount < CONFIG.MAX_RETRIES) {
            console.log(` Retrying network error in ${CONFIG.RETRY_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
            return await submitToBackend(formData, dbId, retryCount + 1);
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
        // Quick connection test with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(CONFIG.BACKEND_URL, {
            method: 'HEAD',
            cache: 'no-cache',
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
        
        const isConnected = response && response.ok;
        console.log(` Backend connection: ${isConnected ? ' Connected' : ' Not connected'}`);
        return isConnected;
    } catch (error) {
        console.log('Backend connection check failed:', error.message);
        return false;
    }
}

// ================= FAST AUTO-SYNC =================
async function performAutoSync() {
    if (isSyncing) {
        showSyncNotification('Sync already in progress...', 'warning', 2000);
        return;
    }
    
    isSyncing = true;
    console.log('Starting FAST auto-sync...');
    showSyncNotification(' Syncing offline applications...', 'info', 3000);
    
    try {
        const pendingApps = getPendingApplications();
        
        console.log(`Found ${pendingApps.length} scheme applications to sync`);
        
        if (pendingApps.length === 0) {
            showSyncNotification('All applications already synced', 'success', 3000);
            isSyncing = false;
            return;
        }
        
        // Show progress
        const progressDiv = document.createElement('div');
        progressDiv.id = 'syncProgress';
        progressDiv.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            background: #2196F3;
            color: white;
            padding: 12px 15px;
            border-radius: 5px;
            z-index: 9999;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            max-width: 300px;
            font-size: 14px;
        `;
        progressDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;"> Uploading ${pendingApps.length} applications</div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="flex: 1; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; overflow: hidden;">
                    <div id="syncProgressBar" style="height: 100%; background: white; width: 0%; transition: width 0.3s;"></div>
                </div>
                <span id="syncCounter">0/${pendingApps.length}</span>
            </div>
        `;
        document.body.appendChild(progressDiv);
        
        let successCount = 0;
        
        // Process applications in parallel batches (faster!)
        const BATCH_SIZE = 3;
        
        for (let i = 0; i < pendingApps.length; i += BATCH_SIZE) {
            const batch = pendingApps.slice(i, i + BATCH_SIZE);
            const promises = batch.map(async (app, batchIndex) => {
                const absoluteIndex = i + batchIndex;
                
                try {
                    // Update progress UI
                    document.getElementById('syncCounter').textContent = 
                        `${absoluteIndex + 1}/${pendingApps.length}`;
                    document.getElementById('syncProgressBar').style.width = 
                        `${((absoluteIndex + 1) / pendingApps.length) * 100}%`;
                    
                    const formData = {
                        name: app.name || '',
                        dob: app.dob || '',
                        state: app.state || '',
                        city: app.city || '',
                        address: app.address || '',
                        category: app.category || '',
                        income: app.income || ''
                    };
                    
                    console.log(`Submitting ${absoluteIndex + 1}/${pendingApps.length}: ${app.name}`);
                    
                    const result = await submitToBackend(formData, app.id);
                    
                    if (result.success) {
                        successCount++;
                        return { success: true, name: app.name };
                    } else {
                        return { success: false, name: app.name, error: result.error };
                    }
                    
                } catch (error) {
                    return { success: false, name: app.name, error: error.message };
                }
            });
            
            // Wait for this batch to complete
            const batchResults = await Promise.all(promises);
            
            // Log batch results
            batchResults.forEach(result => {
                if (result.success) {
                    console.log(` ${result.name} synced`);
                } else {
                    console.log(` ${result.name}: ${result.error}`);
                }
            });
        }
        
        // Remove progress
        if (progressDiv.parentNode) {
            progressDiv.parentNode.removeChild(progressDiv);
        }
        
        // Show final result
        if (successCount > 0) {
            showSyncNotification(` ${successCount} scheme applications synced`, 'success', 5000);
            
            // IMPORTANT: Tell user to refresh admin dashboard
            setTimeout(() => {
                showSyncNotification(
                    ' <strong>Admin dashboard updated!</strong><br><small>Refresh dashboard page to see new data</small>', 
                    'success', 
                    8000
                );
            }, 1000);
            
        } else {
            showSyncNotification(' Could not sync applications', 'warning', 5000);
        }
        
        console.log(` Sync complete: ${successCount}/${pendingApps.length} successful`);
        
    } catch (error) {
        console.error(' Error during auto-sync:', error);
        showSyncNotification(' Sync failed: ' + error.message, 'error', 5000);
        
    } finally {
        isSyncing = false;
    }
}

// ================= FORM SUBMISSION HANDLER =================
async function handleFormSubmit(event) {
    event.preventDefault();
    console.log(' Scheme form submitted');
    
    const form = document.getElementById('govForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = " Saving...";
    submitBtn.style.opacity = "0.7";
    submitBtn.style.cursor = "not-allowed";
    
    try {
        // 1. Get form data
        const formData = getFormData();
        console.log('Form data collected:', formData);
        
        // 2. Validate
        const validation = validateForm(formData);
        if (!validation.valid) {
            showSyncNotification(validation.message, 'error', 3000);
            return;
        }
        
        // 3. Show immediate feedback
        showSyncNotification(' Saving application...', 'info', 2000);
        
        // 4. Save locally first
        const saveResult = saveToLocalStorage(formData);
        
        if (!saveResult.success) {
            throw new Error("Failed to save locally");
        }
        
        console.log(' Saved locally with ID:', saveResult.id);
        
        // 5. Update UI
        showSyncNotification(' Application saved!', 'success', 2000);
        
        // 6. Try online submission if connected
        const isBrowserOnline = navigator.onLine;
        console.log(` Browser online status: ${isBrowserOnline ? 'Online' : 'Offline'}`);
        
        if (isBrowserOnline) {
            const isBackendConnected = await checkBackendConnection();
            
            if (isBackendConnected) {
                // Submit immediately when online
                showSyncNotification(' Uploading to server...', 'info', 2000);
                
                const backendResult = await submitToBackend(formData, saveResult.id);
                
                if (backendResult.success) {
                    showSyncNotification(` ${formData.name}'s application submitted!`, 'success', 3000);
                    
                    // Reset form
                    form.reset();
                    
                    // Set default date
                    const dobField = document.getElementById('dob');
                    if (dobField) {
                        const today = new Date().toISOString().split('T')[0];
                        dobField.value = today;
                    }
                    
                    // IMPORTANT: Tell user data is now in admin dashboard
                    setTimeout(() => {
                        showSyncNotification(
                            ' <strong>Data available in admin dashboard!</strong><br><small>Refresh dashboard to see it</small>', 
                            'success', 
                            5000
                        );
                    }, 1000);
                    
                } else {
                    showSyncNotification(` Saved locally. Will sync automatically.`, 'warning', 3000);
                }
            } else {
                updateLocalStatus(saveResult.id, 'pending', 'Backend not reachable');
                showSyncNotification(" Saved locally. Server connection issue.", "warning", 3000);
            }
        } else {
            updateLocalStatus(saveResult.id, 'pending', 'Device offline');
            showSyncNotification(" Saved offline. Will sync when online.", "info", 3000);
            
            // Schedule immediate sync when we come online
            const syncOnOnline = () => {
                showSyncNotification(' Back online! Syncing...', 'info', 2000);
                performAutoSync();
                window.removeEventListener('online', syncOnOnline);
            };
            window.addEventListener('online', syncOnOnline);
        }
        
    } catch (error) {
        console.error(' Form submission error:', error);
        showSyncNotification(` Error: ${error.message}`, "error", 3000);
        
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = "1";
        submitBtn.style.cursor = "pointer";
    }
}

// ================= INSTANT ONLINE SYNC =================
window.addEventListener('online', async () => {
    console.log(' Device is online. Starting INSTANT sync...');
    
    // Show immediate notification
    showSyncNotification(' Back online! Checking for offline data...', 'info', 2000);
    
    // Check immediately if there are pending apps
    setTimeout(async () => {
        try {
            const pendingApps = getPendingApplications();
            
            if (pendingApps.length > 0) {
                showSyncNotification(` Found ${pendingApps.length} offline applications`, 'info', 2000);
                
                // Start sync after short delay
                setTimeout(() => {
                    performAutoSync();
                }, 1000);
            }
        } catch (error) {
            console.error('Error checking pending:', error);
        }
    }, 500);
});

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', function() {
    console.log(" Page loaded, initializing form...");
    
    const form = document.getElementById('govForm');
    
    if (!form) {
        console.error(" Form with ID 'govForm' not found!");
        return;
    }
    
    console.log("Form found");
    
    // Add submit handler
    form.addEventListener('submit', handleFormSubmit);
    
    // Set today's date as default
    const dobField = document.getElementById('dob');
    if (dobField) {
        const today = new Date().toISOString().split('T')[0];
        dobField.value = today;
        console.log('Set default date to:', today);
    }
    
    // Add manual sync button
    const syncBtn = document.createElement('button');
    syncBtn.textContent = ' Sync Now';
    syncBtn.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        margin-top: 15px;
        font-weight: bold;
        width: 100%;
        transition: all 0.3s;
    `;
    syncBtn.onmouseenter = () => {
        syncBtn.style.transform = 'translateY(-2px)';
        syncBtn.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.4)';
    };
    syncBtn.onmouseleave = () => {
        syncBtn.style.transform = 'translateY(0)';
        syncBtn.style.boxShadow = 'none';
    };
    syncBtn.onclick = () => {
        if (navigator.onLine) {
            performAutoSync();
        } else {
            showSyncNotification(' You are offline', 'warning', 2000);
        }
    };
    
    // Add status indicator
    const statusDiv = document.createElement('div');
    statusDiv.id = 'syncStatusIndicator';
    statusDiv.style.cssText = `
        margin-top: 10px;
        padding: 8px;
        border-radius: 4px;
        font-size: 12px;
        text-align: center;
        background: ${navigator.onLine ? '#d4edda' : '#fff3cd'};
        color: ${navigator.onLine ? '#155724' : '#856404'};
        border: 1px solid ${navigator.onLine ? '#c3e6cb' : '#ffeaa7'};
    `;
    statusDiv.innerHTML = navigator.onLine ? 
        ' Online - Real-time sync' : 
        ' Offline - Saving locally';
    
    // Add to form
    if (form && form.parentNode) {
        const container = document.createElement('div');
        container.appendChild(syncBtn);
        container.appendChild(statusDiv);
        form.parentNode.insertBefore(container, form.nextSibling);
    }
    
    // Update status indicator when network changes
    window.addEventListener('online', () => {
        statusDiv.innerHTML = ' Online - Real-time sync';
        statusDiv.style.background = '#d4edda';
        statusDiv.style.color = '#155724';
        statusDiv.style.borderColor = '#c3e6cb';
    });
    
    window.addEventListener('offline', () => {
        statusDiv.innerHTML = ' Offline - Saving locally';
        statusDiv.style.background = '#fff3cd';
        statusDiv.style.color = '#856404';
        statusDiv.style.borderColor = '#ffeaa7';
    });
    
    // Auto-sync on load if online and there are pending apps
    if (navigator.onLine) {
        setTimeout(async () => {
            try {
                const pendingApps = getPendingApplications();
                
                if (pendingApps.length > 0) {
                    console.log(`Found ${pendingApps.length} pending apps on load`);
                    showSyncNotification(` ${pendingApps.length} pending applications found`, 'info', 3000);
                    
                    // Auto-sync after 3 seconds
                    setTimeout(() => {
                        performAutoSync();
                    }, 3000);
                }
            } catch (error) {
                console.error('Error checking pending on load:', error);
            }
        }, 1000);
    }
});

// ================= PERIODIC SYNC CHECK =================
// Check every 30 seconds if we have pending apps (when online)
setInterval(() => {
    if (navigator.onLine && !isSyncing) {
        const pendingApps = getPendingApplications();
        
        if (pendingApps.length > 0) {
            console.log('Periodic check: Found', pendingApps.length, 'pending apps');
            // Auto-sync if we find pending apps
            performAutoSync();
        }
    }
}, 30000); // 30 seconds

// ================= DEBUG FUNCTIONS =================
window.debugSchemeData = async function() {
    try {
        const pendingApps = getPendingApplications();
        
        console.group(' DEBUG: Local Storage Contents');
        console.log('Total scheme applications:', pendingApps.length);
        
        pendingApps.forEach((app, index) => {
            console.group(`Application ${index + 1}:`);
            console.log('ID:', app.id);
            console.log('Name:', app.name);
            console.log('Status:', app.status);
            console.log('State:', app.state);
            console.log('Category:', app.category);
            console.log('Income:', app.income);
            console.log('Created:', app.savedAt);
            console.groupEnd();
        });
        
        // Show duplicates
        const names = pendingApps.map(app => app.name);
        const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
        if (duplicates.length > 0) {
            console.warn(' Possible duplicates:', [...new Set(duplicates)]);
        }
        
        console.groupEnd();
        
        // Show in alert
        const summary = pendingApps.map(app => 
            `• ${app.name || 'Unknown'} (${app.status}) - ${app.state || 'No state'}`
        ).join('\n');
        
        alert(`Scheme Applications (${pendingApps.length}):\n\n${summary || 'No applications'}`);
        
    } catch (error) {
        console.error('Debug error:', error);
        alert('Debug error: ' + error.message);
    }
};

window.manualSync = function() {
    if (navigator.onLine) {
        performAutoSync();
    } else {
        alert('You are offline. Cannot sync now.');
    }
};

console.log('Scheme form system ready with FAST sync');
console.log('Debug commands: debugSchemeData(), manualSync()');