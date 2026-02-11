import { initDB, saveApplication, getPendingSyncs, updateSyncStatus } from "./db.js";

await initDB();

const form = document.getElementById("rationForm");
console.log("ration.js loaded, form =", form);

// ================= TRACK SYNC STATE =================
let isSyncing = false;
const pendingNotifications = [];

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
    pendingNotifications.push(notification);
    
    // Auto-remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                const index = pendingNotifications.indexOf(notification);
                if (index > -1) pendingNotifications.splice(index, 1);
            }, 300);
        }
    }, duration);
    
    // Add CSS animations
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
}

// ================= DIRECT SUBMISSION =================
async function submitRationToBackend(formData, dbId = null) {
    try {
        const payload = {
            name: formData.name,
            category: formData.category,
            ration_number: formData.ration_number,
            family_members: formData.family_members
        };

        console.log('Sending ration sync for:', payload.name, 'ID:', dbId);
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch('http://localhost:4000/gov/ration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        console.log('Response status for', payload.name, ':', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error for', payload.name, ':', errorText);
            throw new Error(`Server error ${response.status}: ${errorText || response.statusText}`);
        }

        const result = await response.json();
        console.log(payload.name, 'submitted successfully:', result);

        if (dbId) {
            await updateSyncStatus(dbId, "synced", JSON.stringify(result));
            console.log(' Updated', dbId, 'to synced');
        }

        return { success: true, data: result };

    } catch (error) {
        console.error('Ration submission error for ID', dbId, ':', error);
        
        if (dbId) {
            await updateSyncStatus(dbId, "sync_failed", error.message);
            console.log(' Updated', dbId, 'to sync_failed');
        }

        return {
            success: false,
            error: error.message,
            dbId: dbId
        };
    }
}

// ================= FAST AUTO-SYNC =================
async function performAutoSync() {
    if (isSyncing) {
        showSyncNotification('Sync already in progress...', 'warning', 2000);
        return;
    }
    
    isSyncing = true;
    console.log(' Starting FAST auto-sync...');
    showSyncNotification(' Syncing offline applications...', 'info', 3000);
    
    try {
        // Get all pending applications
        const pendingSyncs = await getPendingSyncs();
        
        // Filter for ration applications that need sync
        const rationPending = pendingSyncs.filter(app => 
            app.formType === "ration" && 
            (app.status === "pending_sync" || app.status === "sync_failed")
        );
        
        console.log(`Found ${rationPending.length} ration applications to sync`);
        
        if (rationPending.length === 0) {
            showSyncNotification(' All applications already synced', 'success', 3000);
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
            <div style="font-weight: bold; margin-bottom: 5px;">📤 Uploading ${rationPending.length} applications</div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="flex: 1; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; overflow: hidden;">
                    <div id="syncProgressBar" style="height: 100%; background: white; width: 0%; transition: width 0.3s;"></div>
                </div>
                <span id="syncCounter">0/${rationPending.length}</span>
            </div>
        `;
        document.body.appendChild(progressDiv);
        
        let successCount = 0;
        
        // Process applications in parallel with limited concurrency (faster!)
        const BATCH_SIZE = 3; // Process 3 at a time for speed
        
        for (let i = 0; i < rationPending.length; i += BATCH_SIZE) {
            const batch = rationPending.slice(i, i + BATCH_SIZE);
            const promises = batch.map(async (app, batchIndex) => {
                const absoluteIndex = i + batchIndex;
                
                try {
                    const formData = {
                        name: app.name || '',
                        category: app.category || '',
                        ration_number: app.ration_number || '',
                        family_members: app.family_members || 0
                    };
                    
                    console.log(`Submitting ${absoluteIndex + 1}/${rationPending.length}: ${app.name}`);
                    
                    // Update progress UI
                    document.getElementById('syncCounter').textContent = 
                        `${absoluteIndex + 1}/${rationPending.length}`;
                    document.getElementById('syncProgressBar').style.width = 
                        `${((absoluteIndex + 1) / rationPending.length) * 100}%`;
                    
                    const result = await submitRationToBackend(formData, app.id);
                    
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
            showSyncNotification(` ${successCount} applications synced to dashboard`, 'success', 5000);
            
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
        
        console.log(` Sync complete: ${successCount}/${rationPending.length} successful`);
        
    } catch (error) {
        console.error(' Error during auto-sync:', error);
        showSyncNotification('Sync failed: ' + error.message, 'error', 5000);
        
    } finally {
        isSyncing = false;
    }
}

// ================= FORM SUBMISSION =================
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    console.log(' Ration form submitted');

    const data = {
        name: document.getElementById("name").value.trim(),
        category: document.getElementById("category").value,
        ration_number: document.getElementById("ration_number").value.trim(),
        family_members: Number(document.getElementById("family_members").value) || 0
    };

    // Validate
    if (!data.name || !data.category || !data.ration_number || data.family_members <= 0) {
        alert("Please fill all required fields correctly");
        return;
    }

    console.log('Submitting data for:', data.name);

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = " Saving...";
    submitBtn.style.opacity = "0.7";

    try {
        // Generate unique ID
        const uniqueId = 'ration_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Show immediate feedback
        showSyncNotification(' Saving application...', 'info', 2000);
        
        const dbResult = await saveApplication({
            id: uniqueId,
            formType: "ration",
            ...data,
            status: "pending_sync",
            createdAt: new Date().toISOString(),
            lastSyncAttempt: new Date().toISOString()
        });

        console.log(' Saved to IndexedDB with ID:', uniqueId, 'Name:', data.name);
        
        // Update UI
        showSyncNotification(' Application saved!', 'success', 2000);
        
        if (navigator.onLine) {
            // Submit immediately when online (WITH VISUAL FEEDBACK)
            showSyncNotification('Uploading to server...', 'info', 2000);
            
            const result = await submitRationToBackend(data, uniqueId);

            if (result.success) {
                showSyncNotification(` ${data.name}'s application submitted!`, 'success', 3000);
                form.reset();
                
                // IMPORTANT: Tell user data is now in admin dashboard
                setTimeout(() => {
                    showSyncNotification(
                        '<strong>Data available in admin dashboard!</strong><br><small>Refresh dashboard to see it</small>', 
                        'success', 
                        5000
                    );
                }, 1000);
                
            } else {
                showSyncNotification(` Saved locally. Will sync automatically.`, 'warning', 3000);
            }
        } else {
            showSyncNotification(` Saved offline. Will sync when online.`, 'info', 3000);
            
            // Schedule immediate sync when we come online
            const syncOnOnline = () => {
                showSyncNotification(' Back online! Syncing...', 'info', 2000);
                performAutoSync();
                window.removeEventListener('online', syncOnOnline);
            };
            window.addEventListener('online', syncOnOnline);
        }

    } catch (error) {
        console.error(' Error:', error);
        showSyncNotification('Error: ' + error.message, 'error', 3000);
        
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = "1";
    }
});

// ================= INSTANT ONLINE SYNC =================
window.addEventListener('online', async () => {
    console.log(' Device is online. Starting INSTANT sync...');
    
    // Show immediate notification
    showSyncNotification(' Back online! Checking for offline data...', 'info', 2000);
    
    // Check immediately if there are pending apps
    setTimeout(async () => {
        try {
            const pendingSyncs = await getPendingSyncs();
            const rationPending = pendingSyncs.filter(app => 
                app.formType === "ration" && 
                (app.status === "pending_sync" || app.status === "sync_failed")
            );
            
            if (rationPending.length > 0) {
                showSyncNotification(` Found ${rationPending.length} offline applications`, 'info', 2000);
                
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

// ================= CHECK FOR PENDING ON PAGE LOAD =================
document.addEventListener('DOMContentLoaded', async () => {
    console.log(' Page loaded');
    
    // Check immediately if we have pending apps
    if (navigator.onLine) {
        setTimeout(async () => {
            try {
                const pendingSyncs = await getPendingSyncs();
                const rationPending = pendingSyncs.filter(app => 
                    app.formType === "ration" && 
                    (app.status === "pending_sync" || app.status === "sync_failed")
                );
                
                if (rationPending.length > 0) {
                    console.log(`Found ${rationPending.length} pending apps on load`);
                    showSyncNotification(` ${rationPending.length} pending applications found`, 'info', 3000);
                    
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
});

// ================= PERIODIC SYNC CHECK =================
// Check every 30 seconds if we have pending apps (when online)
setInterval(() => {
    if (navigator.onLine && !isSyncing) {
        getPendingSyncs().then(pendingSyncs => {
            const rationPending = pendingSyncs.filter(app => 
                app.formType === "ration" && 
                (app.status === "pending_sync" || app.status === "sync_failed")
            );
            
            if (rationPending.length > 0) {
                console.log('Periodic check: Found', rationPending.length, 'pending apps');
                // Auto-sync if we find pending apps
                performAutoSync();
            }
        }).catch(console.error);
    }
}, 30000); // 30 seconds

console.log('Ration form system ready with FAST sync');


