import { initDB, saveApplication, getPendingSyncs, markSynced, updateSyncStatus } from "./db.js";

await initDB();

const form = document.getElementById("scholarship10Form");

// ================= SYNC FUNCTION =================
async function syncScholar10ToBackend(formData, dbId = null) {
    try {
        const payload = {
            service_type: "scholar10",
            form_data: {
                name: formData.name,
                school: formData.school,
                marks: formData.marks,
                year: formData.year,
                timestamp: new Date().toISOString()
            }
        };
        
        console.log('Sending scholar10 sync request:', payload);
        
        const response = await fetch('http://localhost:4000/sync/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Scholar10 sync successful:', result);
        
        if (dbId && result.success) {
            await markSynced(dbId, result);
        }
        
        return { success: true, data: result };
    } catch (error) {
        console.error('Scholar10 sync failed:', error);
        
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

// ================= AUTO-SYNC WHEN ONLINE =================
window.addEventListener('online', async () => {
    console.log('Device is online. Checking for pending scholarship10 syncs...');
    
    try {
        const pendingSyncs = await getPendingSyncs();
        const scholar10Pending = pendingSyncs.filter(app => app.formType === "scholarship10");
        console.log(`Found ${scholar10Pending.length} pending scholarship10 syncs`);
        
        for (const pending of scholar10Pending) {
            console.log('Retrying scholarship10 sync for:', pending.id);
            
            const result = await syncScholar10ToBackend(pending, pending.id);
            
            if (result.success) {
                console.log('Successfully synced pending scholarship10 application:', pending.id);
            } else {
                console.log('Failed to sync pending scholarship10 application:', pending.id);
            }
        }
    } catch (error) {
        console.error('Error during auto-sync:', error);
    }
});

// ================= FORM SUBMISSION =================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        name: document.getElementById("name").value,
        school: document.getElementById("school").value,
        marks: Number(document.getElementById("marks").value),
        year: Number(document.getElementById("year").value),
    };

    try {
        // Save to IndexedDB first
        const dbResult = await saveApplication({
            formType: "scholarship10",
            ...data,
            status: "pending_sync",
            createdAt: new Date()
        });
        
        console.log('Saved to IndexedDB with ID:', dbResult.id);
        
        // Try to sync if online
        if (navigator.onLine) {
            const syncResult = await syncScholar10ToBackend(data, dbResult.id);
            
            if (syncResult.success) {
                alert(`✅ Scholarship 10th application submitted successfully!\nApplication ID: ${syncResult.data.application_id}\nStatus: ${syncResult.data.status}`);
            } else {
                alert(`⚠️ Scholarship 10th saved locally.\nWill automatically sync when possible.\nError: ${syncResult.error}`);
            }
        } else {
            alert("📴 Scholarship 10th saved offline.\nWill sync automatically when you're back online.");
        }
        
        form.reset();
    } catch (error) {
        console.error('Error saving scholarship10 data:', error);
        alert("❌ Error saving scholarship data");
    }
});

// ================= BACKGROUND SYNC CHECK =================
setInterval(async () => {
    if (navigator.onLine) {
        const pending = await getPendingSyncs();
        const scholar10Pending = pending.filter(app => app.formType === "scholarship10");
        if (scholar10Pending.length > 0) {
            console.log(`Background sync: ${scholar10Pending.length} pending scholarship10 applications`);
            // Optional: Auto-sync them
            // for (const pending of scholar10Pending) {
            //     await syncScholar10ToBackend(pending, pending.id);
            // }
        }
    }
}, 30000); // Check every 30 seconds

console.log("scholarship10.js loaded successfully");