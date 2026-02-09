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
        
        // Try direct endpoint first
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
        
        // Try sync endpoint as fallback
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
    
    // Get form data
    const formData = {
        name: document.getElementById("name").value.trim(),
        college: document.getElementById("college").value.trim(),
        marks: Number(document.getElementById("marks").value),
        year: document.getElementById("year").value.trim()
    };
    
    // Basic validation
    if (!formData.name || !formData.college || !formData.marks || !formData.year) {
        alert(" Please fill all fields");
        return;
    }
    
    if (formData.marks < 0 || formData.marks > 100) {
        alert(" Marks must be between 0-100");
        return;
    }
    
    // Disable submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
    submitBtn.style.opacity = "0.7";
    
    try {
        if (navigator.onLine) {
            // Try online submission
            const result = await submitScholarship12(formData);
            
            if (result.success) {
                alert(` Scholarship 12th submitted successfully!\nApplication ID: ${result.data.id || result.data.applicationId}`);
                form.reset();
            } else {
                // Save locally if online submission failed
                saveToLocalStorage(formData);
                alert(` Saved locally. Will sync later.\nError: ${result.error}`);
            }
        } else {
            // Save offline
            saveToLocalStorage(formData);
            alert("Saved offline. Will sync when back online.");
            form.reset();
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        alert(" Error submitting application");
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = "1";
    }
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
        console.log('Saved to localStorage:', pendingApps.length, 'pending apps');
    } catch (e) {
        console.error('Failed to save locally:', e);
    }
}

// ================= AUTO-SYNC WHEN ONLINE =================
window.addEventListener('online', async () => {
    const pending = JSON.parse(localStorage.getItem('pendingScholarship12') || '[]');
    if (pending.length > 0) {
        console.log('Online - found', pending.length, 'pending apps to sync');
        
        for (const app of pending) {
            try {
                const result = await submitScholarship12(app);
                if (result.success) {
                    // Remove from pending
                    const updated = pending.filter(a => a.timestamp !== app.timestamp);
                    localStorage.setItem('pendingScholarship12', JSON.stringify(updated));
                    console.log('Synced pending app:', app.name);
                }
            } catch (error) {
                console.error('Failed to sync pending app:', error);
            }
        }
    }
});

// ================= INITIALIZE =================
document.addEventListener('DOMContentLoaded', () => {
    console.log("12th Scholarship Form Ready");
    
    // Check online status
    const statusElement = document.createElement('div');
    statusElement.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        padding: 5px 10px;
        background: ${navigator.onLine ? '#2ecc71' : '#e74c3c'};
        color: white;
        border-radius: 3px;
        font-size: 12px;
        z-index: 1000;
    `;
    statusElement.textContent = navigator.onLine ? ' Online' : ' Offline';
    document.body.appendChild(statusElement);
    
    // Update status when network changes
    window.addEventListener('online', () => {
        statusElement.textContent = ' Online';
        statusElement.style.background = '#2ecc71';
    });
    
    window.addEventListener('offline', () => {
        statusElement.textContent = ' Offline';
        statusElement.style.background = '#e74c3c';
    });
});