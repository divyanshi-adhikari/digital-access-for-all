import { initDB, saveApplication, getPendingSyncs, markSynced, updateSyncStatus } from "./db.js";

await initDB();

const form = document.getElementById("rationForm");

// Sync function for ration
async function syncRationToBackend(formData, dbId = null) {
    try {
        const payload = {
            service_type: "ration",
            form_data: {
                name: formData.name,
                category: formData.category,
                ration_number: formData.ration_number,
                family_members: formData.family_members,
                timestamp: new Date().toISOString()
            }
        };
        
        console.log('Sending ration sync request:', payload);
        
        const response = await fetch('http://localhost:4000/sync/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Ration sync successful:', result);
        
        // Mark as synced in IndexedDB if we have a dbId
        if (dbId && result.success) {
            await markSynced(dbId, result);
        }
        
        return { success: true, data: result };
    } catch (error) {
        console.error('Ration sync failed:', error);
        
        // Update sync status to failed
        if (dbId) {
            await updateSyncStatus(dbId, "sync_failed", error);
        }
        
        return { 
            success: false, 
            error: error.message,
            dbId: dbId
        };
    }
}

// Auto-retry pending syncs when coming online
window.addEventListener('online', async () => {
    console.log('Device is online. Checking for pending ration syncs...');
    
    try {
        const pendingSyncs = await getPendingSyncs();
        const rationPending = pendingSyncs.filter(app => app.formType === "ration");
        console.log(`Found ${rationPending.length} pending ration syncs`);
        
        for (const pending of rationPending) {
            console.log('Retrying ration sync for:', pending.id);
            
            const result = await syncRationToBackend(pending, pending.id);
            
            if (result.success) {
                console.log('Successfully synced pending ration application:', pending.id);
            } else {
                console.log('Failed to sync pending ration application:', pending.id);
            }
        }
    } catch (error) {
        console.error('Error during auto-sync:', error);
    }
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const data = {
        name: document.getElementById("name").value,
        category: document.getElementById("category").value,
        ration_number: document.getElementById("ration_number").value,
        family_members: Number(document.getElementById("family_members").value),
    };

    try {
        // Save to IndexedDB first
        const dbResult = await saveApplication({
            formType: "ration",
            ...data,
            status: "pending_sync",
            createdAt: new Date()
        });
        
        console.log('Saved to IndexedDB with ID:', dbResult.id);
        
        // Try to sync if online
        if (navigator.onLine) {
            const syncResult = await syncRationToBackend(data, dbResult.id);
            
            if (syncResult.success) {
                alert(`Ration card application submitted successfully!\nApplication ID: ${syncResult.data.application_id}\nStatus: ${syncResult.data.status}`);
            } else {
                alert(`Ration card saved locally.\nWill automatically sync when possible.\nError: ${syncResult.error}`);
            }
        } else {
            alert("Ration card saved offline.\nWill sync automatically when you're back online.");
        }
        
        form.reset();
    } catch (error) {
        console.error('Error saving ration data:', error);
        alert("Error saving ration card data");
    }
});
