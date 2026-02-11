let db;

export function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("DigitalDivideDB", 3);

        request.onupgradeneeded = (e) => {
            db = e.target.result;
            
            if (!db.objectStoreNames.contains("applications")) {
                const store = db.createObjectStore("applications", {
                    keyPath: "id",
                    autoIncrement: false // CHANGED: false because you're providing custom IDs
                });
                
                store.createIndex("formType", "formType", { unique: false });
                store.createIndex("synced", "synced", { unique: false });
                store.createIndex("status", "status", { unique: false });
                store.createIndex("createdAt", "createdAt", { unique: false });
                
                console.log("Object store created");
            }
        };

        request.onsuccess = (e) => {
            db = e.target.result;
            console.log("IndexedDB initialized");
            resolve(db);
        };

        request.onerror = (e) => {
            reject("IndexedDB error: " + e.target.error);
        };
    });
}

export function saveApplication(data) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("applications", "readwrite");
        const store = tx.objectStore("applications");
        
        // CRITICAL FIX: Use the ID you're providing, don't auto-generate
        const appToSave = {
            ...data,
            synced: false,
            status: data.status || "pending_sync",
            syncAttempts: 0,
            lastSyncAttempt: null,
            backendId: null,
            updatedAt: new Date().toISOString()
        };

        // Use put() instead of add() to handle your custom IDs
        const req = store.put(appToSave);

        req.onsuccess = () => {
            console.log("✅ Saved:", appToSave.id, appToSave.name);
            resolve(appToSave);
        };
        
        req.onerror = (e) => {
            console.error("❌ Save failed:", e.target.error);
            reject("Save failed: " + e.target.error);
        };
    });
}

export function getAllApplications() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("applications", "readonly");
        const store = tx.objectStore("applications");
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result);
        req.onerror = (e) => reject("Failed to read: " + e.target.error);
    });
}

// ============= CRITICAL FIX: This is your problem area =============
export function getPendingSyncs() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("applications", "readonly");
        const store = tx.objectStore("applications");
        const req = store.getAll();
        
        req.onsuccess = () => {
            const allApps = req.result;
            
            // SIMPLE, CLEAR FILTERING
            const pending = allApps.filter(app => {
                // Your app saves with status "pending_sync" - this should catch them
                if (app.status === "pending_sync") return true;
                if (app.status === "sync_failed") return true;
                if (app.synced === false) return true;
                if (app.synced === "false") return true; // Handle strings
                if (app.synced === undefined && app.status === undefined) return true;
                
                return false;
            });
            
            console.log(`📊 Pending syncs: ${pending.length}/${allApps.length}`);
            resolve(pending);
        };

        req.onerror = (e) => {
            reject("Failed to get pending: " + e.target.error);
        };
    });
}

export function updateSyncStatus(id, status, response = null) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("applications", "readwrite");
        const store = tx.objectStore("applications");
        
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const app = getRequest.result;
            
            if (!app) {
                console.error("❌ Not found:", id);
                reject("Application not found");
                return;
            }

            // Update fields
            app.status = status;
            app.lastSyncAttempt = new Date().toISOString();
            app.syncAttempts = (app.syncAttempts || 0) + 1;
            
            if (status === "synced") {
                app.synced = true;
                app.backendId = response ? (response.application_id || response.id) : null;
                app.syncResponse = response;
            } else {
                app.synced = false;
                app.lastError = response;
            }
            
            app.updatedAt = new Date().toISOString();

            const updateRequest = store.put(app);

            updateRequest.onsuccess = () => {
                console.log(`✅ Updated ${id}: ${status}`);
                resolve(app);
            };

            updateRequest.onerror = (e) => {
                reject("Update failed: " + e.target.error);
            };
        };

        getRequest.onerror = (e) => {
            reject("Get failed: " + e.target.error);
        };
    });
}

// Keep these for backward compatibility
export function markSynced(id, backendData = {}) {
    return updateSyncStatus(id, "synced", JSON.stringify(backendData));
}

export function incrementSyncAttempts(id, error = null) {
    return updateSyncStatus(id, "retrying", error?.message || error);
}

export function getApplicationsByType(formType) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("applications", "readonly");
        const store = tx.objectStore("applications");
        const req = store.getAll();
        
        req.onsuccess = () => {
            const filtered = req.result.filter(app => app.formType === formType);
            resolve(filtered);
        };

        req.onerror = (e) => {
            reject("Failed to get by type: " + e.target.error);
        };
    });
}

export function deleteApplication(id) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("applications", "readwrite");
        const store = tx.objectStore("applications");
        const req = store.delete(id);

        req.onsuccess = () => resolve();
        req.onerror = (e) => reject("Delete failed: " + e.target.error);
    });
}

// Helper to clear DB (use carefully!)
export function clearAllApplications() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("applications", "readwrite");
        const store = tx.objectStore("applications");
        const req = store.clear();

        req.onsuccess = () => resolve();
        req.onerror = (e) => reject("Clear failed: " + e.target.error);
    });
}
