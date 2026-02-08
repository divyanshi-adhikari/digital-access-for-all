let db;

export function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("DigitalDivideDB", 2); // Changed to version 2 for schema upgrade

        request.onupgradeneeded = (e) => {
            db = e.target.result;
            
            // Create object store if it doesn't exist
            if (!db.objectStoreNames.contains("applications")) {
                const store = db.createObjectStore("applications", {
                    keyPath: "id",
                    autoIncrement: true
                });
                
                console.log("Object store created");
            }
            
            // Add new fields to existing data if upgrading
            const transaction = e.target.transaction;
            const store = transaction.objectStore("applications");
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => {
                const allItems = getAllRequest.result;
                allItems.forEach(item => {
                    // Add sync fields if they don't exist
                    if (item.synced === undefined) {
                        item.synced = false;
                        store.put(item);
                    }
                    if (item.status === undefined) {
                        item.status = "pending";
                        store.put(item);
                    }
                    if (item.syncAttempts === undefined) {
                        item.syncAttempts = 0;
                        store.put(item);
                    }
                });
            };
        };

        request.onsuccess = (e) => {
            db = e.target.result;
            console.log("IndexedDB initialized successfully");
            resolve(db);
        };

        request.onerror = () => reject("IndexedDB error");
    });
}

export function saveApplication(data) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("applications", "readwrite");
        const store = tx.objectStore("applications");
        
        // Add sync tracking fields
        const appWithSync = {
            ...data,
            synced: false,
            status: data.status || "pending",
            syncAttempts: 0,
            lastSyncAttempt: null,
            backendId: null,
            createdAt: data.createdAt || new Date()
        };

        const req = store.add(appWithSync);

        req.onsuccess = () => {
            console.log("Application saved with ID:", req.result);
            resolve({ id: req.result, ...appWithSync });
        };
        
        req.onerror = () => reject("Save failed");
    });
}

export function getAllApplications() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("applications", "readonly");
        const store = tx.objectStore("applications");
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject("Failed to read applications");
    });
}

// ========== NEW SYNC FUNCTIONS ==========

// Get all applications that haven't been synced
export function getPendingSyncs() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("applications", "readonly");
        const store = tx.objectStore("applications");
        const req = store.getAll();
        
        req.onsuccess = () => {
            const allApps = req.result;
            // Filter applications that are not synced
            const pending = allApps.filter(app => !app.synced);
            console.log(`Found ${pending.length} pending syncs out of ${allApps.length} total applications`);
            resolve(pending);
        };

        req.onerror = () => reject("Failed to get pending syncs");
    });
}

// Mark an application as synced
export function markSynced(id, backendData = {}) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("applications", "readwrite");
        const store = tx.objectStore("applications");
        
        // First get the application
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const application = getRequest.result;
            if (!application) {
                reject("Application not found");
                return;
            }

            // Update sync status
            application.synced = true;
            application.status = "synced";
            application.syncAttempts = (application.syncAttempts || 0) + 1;
            application.lastSyncAttempt = new Date();
            application.backendId = backendData.application_id || backendData.id;
            application.syncResponse = backendData;

            // Save updated application
            const updateRequest = store.put(application);

            updateRequest.onsuccess = () => {
                console.log(`Application ${id} marked as synced`);
                resolve(application);
            };

            updateRequest.onerror = () => reject("Failed to mark as synced");
        };

        getRequest.onerror = () => reject("Failed to get application");
    });
}

// Update sync status (for retry logic)
export function updateSyncStatus(id, status, error = null) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("applications", "readwrite");
        const store = tx.objectStore("applications");
        
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const application = getRequest.result;
            if (!application) {
                reject("Application not found");
                return;
            }

            application.status = status;
            application.syncAttempts = (application.syncAttempts || 0) + 1;
            application.lastSyncAttempt = new Date();
            
            if (error) {
                application.lastError = error.message || error;
            }

            const updateRequest = store.put(application);

            updateRequest.onsuccess = () => {
                console.log(`Application ${id} status updated to: ${status}`);
                resolve(application);
            };

            updateRequest.onerror = () => reject("Failed to update status");
        };

        getRequest.onerror = () => reject("Failed to get application");
    });
}

// Get applications by form type
export function getApplicationsByType(formType) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("applications", "readonly");
        const store = tx.objectStore("applications");
        const req = store.getAll();
        
        req.onsuccess = () => {
            const allApps = req.result;
            const filtered = allApps.filter(app => app.formType === formType);
            resolve(filtered);
        };

        req.onerror = () => reject("Failed to get applications by type");
    });
}

// Delete application (optional, for cleanup)
export function deleteApplication(id) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("applications", "readwrite");
        const store = tx.objectStore("applications");
        const req = store.delete(id);

        req.onsuccess = () => resolve();
        req.onerror = () => reject("Failed to delete application");
    });
}
