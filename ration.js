import { initDB, saveApplication, getPendingSyncs, markSynced } from "./db.js";

await initDB();

const form = document.getElementById("rationForm");
console.log("ration.js loaded, form =", form);

// ================= DIRECT SUBMISSION =================
async function submitRationToBackend(formData, dbId = null) {
    try {
        const payload = {
            name: formData.name,
            category: formData.category,
            ration_number: formData.ration_number,
            family_members: formData.family_members
        };

        console.log('Sending ration sync request:', payload);

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

        if (dbId) {
            await markSynced(dbId, result);
        }

        return { success: true, data: result };

    } catch (error) {
        if (dbId) {
            await markSynced(dbId, null);
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

            const result = await submitRationToBackend({
                name: pending.name,
                category: pending.category,
                ration_number: pending.ration_number,
                family_members: pending.family_members
            }, pending.id);

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
        family_members: Number(document.getElementById("family_members").value)
    };

    try {
        const dbResult = await saveApplication({
            formType: "ration",
            ...data,
            status: "pending_sync",
            createdAt: new Date()
        });

        console.log('Saved to IndexedDB with ID:', dbResult.id);

        if (navigator.onLine) {
            const result = await submitRationToBackend(data, dbResult.id);

            if (result.success) {
                alert("Ration card application submitted successfully!");
            } else {
                alert("Saved locally. Will sync later.");
            }
        } else {
            alert("Saved offline. Will sync when online.");
        }

    } catch (error) {
        console.error('Error:', error);
        alert("Error saving application");
    }
});
