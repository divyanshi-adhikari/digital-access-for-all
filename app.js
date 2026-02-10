import { initDB, saveApplication, getPendingSyncs, markSynced, updateSyncStatus } from "./db.js";

await initDB();

const form = document.getElementById("govForm");
console.log("govForm =", form);
if (!form) {
    console.error("Government scheme form not found");
}


// Sync function for scheme
async function syncSchemeToBackend(formData, dbId = null) {
    try {
        const payload = {
    name: formData.name,
    category: formData.category,
    state: formData.state
};
        
        console.log('Sending scheme sync request:', payload);
        
        const response = await fetch('http://localhost:4000/gov/scheme', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Scheme sync successful:', result);
        
        // Mark as synced in IndexedDB if we have a dbId
        if (dbId && result.success) {
            await markSynced(dbId, result);
        }
        
        return { success: true, data: result };
    } catch (error) {
        console.error('Scheme sync failed:', error);
        
        // Update sync status to failed
        if (dbId) {
            await updateSyncStatus(dbId, "sync_failed", error.message);
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
    console.log('Device is online. Checking for pending scheme syncs...');
    
    try {
        const pendingSyncs = await getPendingSyncs();
        const schemePending = pendingSyncs.filter(app => app.formType === "scheme");
        console.log(`Found ${schemePending.length} pending scheme syncs`);
        
        for (const pending of schemePending) {
            console.log('Retrying scheme sync for:', pending.id);
            
            const result = await syncSchemeToBackend(pending, pending.id);
            
            if (result.success) {
                console.log('Successfully synced pending scheme application:', pending.id);
            } else {
                console.log('Failed to sync pending scheme application:', pending.id);
            }
        }
    } catch (error) {
        console.error('Error during auto-sync:', error);
    }
});

if (form) {
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Government Scheme form submitted");

    const data = {
        name: document.getElementById("name").value,
        category: document.getElementById("category").value,
        state: document.getElementById("state").value,
    };

    try {
        // Save to IndexedDB first
        const dbResult = await saveApplication({
            formType: "scheme",
            ...data,
            status: "pending_sync",
            createdAt: new Date()
        });
        
        console.log('Saved to IndexedDB with ID:', dbResult.id);
        
        // Try to sync if online
        // Try sync but NEVER block form submission
if (navigator.onLine) {
    try {
        await syncSchemeToBackend(data, dbResult.id);
        alert("Scheme application submitted successfully ");
    } catch (err) {
        alert("Scheme saved locally. Will sync automatically ");
    }
} else {
    alert("Scheme saved offline. Will sync when online ");
}

        
        form.reset();
    } catch (error) {
        console.error('Error saving scheme data:', error);
        alert(" Error saving scheme data");
    }
}); 
}