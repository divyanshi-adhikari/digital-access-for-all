import { initDB, saveApplication, getPendingSyncs, markSynced } from "./db.js";

await initDB();

const form = document.getElementById("rationForm");

// ================= DIRECT SUBMISSION =================
async function submitRationToBackend(formData, dbId = null) {
    try {
        const payload = {
            name: formData.name,
            category: formData.category,
            ration_number: formData.ration_number,
            family_members: formData.family_members,
            status: 'PENDING'
        };
        
        console.log('Submitting ration:', payload);
        
        // TRY DIRECT ENDPOINT FIRST
        const response = await fetch('http://localhost:4000/gov/ration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Ration submitted successfully:', result);
        
        if (dbId && result.success) {
            await markSynced(dbId, result);
        }
        
        return { success: true, data: result };
        
    } catch (error) {
        console.error('Direct submission failed, trying sync endpoint:', error);
        
        // FALLBACK: Try sync endpoint
        try {
            const syncPayload = {
                service_type: "ration",
                form_data: formData
            };
            
            const syncResponse = await fetch('http://localhost:4000/sync/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(syncPayload)
            });
            
            if (syncResponse.ok) {
                const syncResult = await syncResponse.json();
                console.log('Ration sync successful:', syncResult);
                
                if (dbId && syncResult.success) {
                    await markSynced(dbId, syncResult);
                }
                
                return { success: true, data: syncResult };
            }
        } catch (syncError) {
            console.error('Sync also failed:', syncError);
        }
        
        return { 
            success: false, 
            error: error.message,
            dbId: dbId
        };
    }
}

// ================= FORM SUBMISSION =================
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const data = {
        name: document.getElementById("name").value,
        category: document.getElementById("category").value,
        ration_number: document.getElementById("ration_number").value,
        family_members: Number(document.getElementById("family_members").value)
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
        
        // Try to submit if online
        if (navigator.onLine) {
            const result = await submitRationToBackend(data, dbResult.id);
            
            if (result.success) {
                alert(` Ration application submitted!`);
                form.reset();
            } else {
                alert(` Saved locally. Will sync later.`);
            }
        } else {
            alert("Saved offline. Will sync when online.");
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert(" Error saving application");
    }
});