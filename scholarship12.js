// scholarship12.js - SIMPLIFIED WORKING VERSION
console.log("12th Scholarship Form Initializing...");

const form = document.getElementById("scholarship12Form");

// ================= SIMPLE SUBMIT FUNCTION =================
async function submitScholarship12(formData) {
    try {
        const payload = {
            name: formData.name,
            college: formData.college,
            marks: formData.marks,
            year: formData.year,
            status: 'PENDING'
        };

        console.log('Submitting scholarship12:', payload);

        const response = await fetch('http://localhost:4000/gov/scholar12', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Submission successful:', result);

        return { success: true, data: result };

    } catch (error) {
        console.error('Submission failed:', error);

        try {
            const syncPayload = {
                service_type: "scholar12",
                form_data: formData
            };

            const syncResponse = await fetch('http://localhost:4000/sync/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(syncPayload)
            });

            if (syncResponse.ok) {
                const syncResult = await syncResponse.json();
                return { success: true, data: syncResult };
            }
        } catch (syncError) {
            console.error('Sync also failed:', syncError);
        }

        return { success: false, error: error.message };
    }
}

// ================= FORM SUBMISSION =================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
        name: document.getElementById("name").value.trim(),
        college: document.getElementById("college").value.trim(),
        marks: Number(document.getElementById("marks").value),
        year: document.getElementById("year").value.trim()
    };

    if (!formData.name || !formData.college || !formData.marks || !formData.year) {
        alert("Please fill all fields");
        return;
    }

    try {
        if (navigator.onLine) {
            console.log("Online - attempting direct submission");

            const response = await fetch(`${CONFIG.BACKEND_URL}${CONFIG.SYNC_ENDPOINT}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service_type: CONFIG.SERVICE_TYPE,
                    form_data: formData
                })
            });

            if (response.ok) {
                const result = await response.json();
                alert("Application Submitted Successfully");
                document.getElementById(CONFIG.FORM_IDS.FORM).reset();
                await syncWithBackend();
                return;
            } else {
                throw new Error(`Server error: ${response.status}`);
            }
        }
    } catch (error) {
        console.log("Online submission failed, saving offline:", error);
    }

    try {
        await saveToIndexedDB(formData);
        alert("Application Saved Offline");
        document.getElementById(CONFIG.FORM_IDS.FORM).reset();
    } catch (dbError) {
        console.error("Failed to save offline:", dbError);
        alert("Failed to save your application. Please try again.");
    }
}); 

// ================= NETWORK DETECTION =================
function updateOnlineStatus() {
    const statusElement = document.querySelector('.app-footer p');
    if (statusElement) {
        if (navigator.onLine) {
            statusElement.textContent = "You're online.";
            statusElement.style.color = "#27ae60";
            setTimeout(() => syncWithBackend(), 1000);
        } else {
            statusElement.textContent = "You're offline.";
            statusElement.style.color = "#e74c3c";
        }
    }
}

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', async function () {
    console.log("Initializing 12th Scholarship form...");
});

// ================= LOCAL STORAGE FALLBACK =================
function saveToLocalStorage(data) {
    try {
        const pendingApps = JSON.parse(localStorage.getItem('pendingScholarship12') || '[]');
        pendingApps.push({
            ...data,
            timestamp: new Date().toISOString(),
            status: 'PENDING'
        });
        localStorage.setItem('pendingScholarship12', JSON.stringify(pendingApps));
    } catch (e) {
        console.error('Failed to save locally:', e);
    }
}

// ================= AUTO-SYNC WHEN ONLINE =================
window.addEventListener('online', async () => {
    const pending = JSON.parse(localStorage.getItem('pendingScholarship12') || '[]');
    for (const app of pending) {
        try {
            await submitScholarship12(app);
        } catch (error) {
            console.error(error);
        }
    }
});

// ================= STATUS INDICATOR =================
document.addEventListener('DOMContentLoaded', () => {
    const statusElement = document.createElement('div');
    statusElement.textContent = navigator.onLine ? 'Online' : 'Offline';
    document.body.appendChild(statusElement);

    window.addEventListener('online', () => {
        statusElement.textContent = 'Online';
    });

    window.addEventListener('offline', () => {
        statusElement.textContent = 'Offline';
    });
});
