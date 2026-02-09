// app.js - Scheme Application Form (SIMPLIFIED)
console.log("Scheme Application Form Initializing...");

const form = document.getElementById("schemeForm");

// ================= SUBMIT FUNCTION =================
async function submitScheme(formData) {
    try {
        const payload = {
            name: formData.name,
            category: formData.category,
            state: formData.state,
            scheme_type: formData.scheme_type,
            status: 'PENDING'
        };
        
        console.log('Submitting scheme:', payload);
        
        // Try direct endpoint
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
        console.error('Submission failed:', error);
        
        // Try sync endpoint as fallback
        try {
            const syncPayload = {
                service_type: "scheme",
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
        category: document.getElementById("category").value,
        state: document.getElementById("state").value,
        scheme_type: document.getElementById("scheme_type").value
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
        if (navigator.onLine) {
            // Try online submission
            const result = await submitScheme(formData);
            
            if (result.success) {
                alert(`Scheme application submitted!\nApplication ID: ${result.data.id || result.data.applicationId}`);
                form.reset();
            } else {
                // Save locally
                saveToLocalStorage(formData);
                alert(` Saved locally. Will sync later.\nError: ${result.error}`);
            }
        } else {
            // Save offline
            saveToLocalStorage(formData);
            alert(" Saved offline. Will sync when back online.");
            form.reset();
        }
        
    } catch (error) {
        console.error('Form error:', error);
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
        const pendingApps = JSON.parse(localStorage.getItem('pendingSchemes') || '[]');
        pendingApps.push({
            ...data,
            timestamp: new Date().toISOString(),
            status: 'PENDING'
        });
        localStorage.setItem('pendingSchemes', JSON.stringify(pendingApps));
        console.log('Saved to localStorage:', pendingApps.length, 'pending schemes');
    } catch (e) {
        console.error('Failed to save locally:', e);
    }
}

// ================= AUTO-SYNC =================
window.addEventListener('online', async () => {
    const pending = JSON.parse(localStorage.getItem('pendingSchemes') || '[]');
    if (pending.length > 0) {
        console.log('Online - found', pending.length, 'pending schemes');
        
        for (const app of pending) {
            try {
                const result = await submitScheme(app);
                if (result.success) {
                    // Remove from pending
                    const updated = pending.filter(a => a.timestamp !== app.timestamp);
                    localStorage.setItem('pendingSchemes', JSON.stringify(updated));
                    console.log('Synced pending scheme:', app.name);
                }
            } catch (error) {
                console.error('Failed to sync scheme:', error);
            }
        }
    }
});

// ================= INITIALIZE =================
document.addEventListener('DOMContentLoaded', () => {
    console.log("Scheme Form Ready");
    
    // Add online status indicator
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
    statusElement.textContent = navigator.onLine ? 'Online' : 'Offline';
    document.body.appendChild(statusElement);
    
    // Update on network changes
    window.addEventListener('online', () => {
        statusElement.textContent = 'Online';
        statusElement.style.background = '#2ecc71';
    });
    
    window.addEventListener('offline', () => {
        statusElement.textContent = ' Offline';
        statusElement.style.background = '#e74c3c';
    });
});