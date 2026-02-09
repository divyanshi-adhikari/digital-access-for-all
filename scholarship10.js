import { initDB, saveApplication, getPendingSyncs, markSynced } from "./db.js";

await initDB();

const form = document.getElementById("scholarship10Form");

// ================= DIRECT SUBMISSION =================
async function submitScholar10ToBackend(formData, dbId = null) {
    try {
        const payload = {
            name: formData.name,
            school: formData.school,
            marks: formData.marks,
            year: formData.year,
            status: 'PENDING'
        };
        
        console.log('Submitting scholarship10:', payload);
        
        // TRY DIRECT ENDPOINT
        const response = await fetch('http://localhost:4000/gov/scholar10', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Scholarship10 submitted:', result);
        
        if (dbId && result.success) {
            await markSynced(dbId, result);
        }
        
        return { success: true, data: result };
        
    } catch (error) {
        console.error('Direct submission failed:', error);
        
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
        school: document.getElementById("school").value,
        marks: Number(document.getElementById("marks").value),
        year: Number(document.getElementById("year").value)
    };

    try {
        // Save to IndexedDB first
        const dbResult = await saveApplication({
            formType: "scholarship10",
            ...data,
            status: "pending_sync",
            createdAt: new Date()
        });
        
        console.log('Saved to IndexedDB');
        
        // Try to submit
        if (navigator.onLine) {
            const result = await submitScholar10ToBackend(data, dbResult.id);
            
            if (result.success) {
                alert(` Scholarship 10th submitted!`);
                form.reset();
            } else {
                alert(` Saved locally. Will sync later.`);
            }
        } else {
            alert(" Saved offline.");
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert(" Error saving application");
    }
});