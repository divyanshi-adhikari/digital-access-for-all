// app.js - Scheme Application Form (SIMPLIFIED)
console.log("Scheme Application Form Initializing...");

const form = document.getElementById("govForm");
console.log("govForm =", form);
if (!form) {
    console.error("Government scheme form not found");
}


// ================= SUBMIT FUNCTION =================
async function submitScheme(formData) {
    try {
        const payload = {
            name: formData.name,
            category: formData.category,
            state: formData.state
        };

        console.log('Submitting scheme:', payload);

        const response = await fetch('http://localhost:4000/gov/scheme', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Scheme submitted:', result);

        return { success: true, data: result };

    } catch (error) {
        // Update sync status to failed
        if (dbId) {
            await updateSyncStatus(dbId, "sync_failed", error.message);
        }

        return { success: false, error: error.message };
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
            state: document.getElementById("state").value
        };

        // Validation
        if (!formData.name || !formData.category || !formData.state || !formData.scheme_type) {
            alert(" Please fill all fields");
            return;
        }

        // Disable submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
        submitBtn.style.opacity = "0.7";

        try {
            const dbResult = await saveApplication({
                formType: "scheme",
                ...data,
                status: "pending_sync",
                createdAt: new Date()
            });

            console.log('Saved to IndexedDB with ID:', dbResult.id);

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

        } catch (error) {
            console.error('Form error:', error);
            alert(" Error submitting application");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            submitBtn.style.opacity = "1";
        }
    });
}

