
// scholarship12.js 
console.log(" 12th Scholarship Form Initializing...");

const form = document.getElementById("scholarship12Form");
if (!form) {
    console.error("Scholarship form not found");
    alert("Error: Form not found on page. Please refresh.");
}

// ================= CONFIGURATION =================
const CONFIG = {
    BACKEND_URL: 'http://localhost:4000/',
    API_ENDPOINTS: {
        SCHOLAR12: 'gov/scholar12',
        SYNC: 'sync/submit'
    },
    SERVICE_TYPE: 'scholar12'
};

// ================= MAIN SUBMIT FUNCTION =================
async function submitScholarship12(formData) {
    try {
        // Ensure year is a number
        const yearNumber = parseInt(formData.year);
        const marksNumber = parseFloat(formData.marks);
        
        const payload = {
            name: formData.name,
            college: formData.college,
            marks: marksNumber,     // Number
            year: yearNumber,       // Number (CRITICAL!)
            status: 'PENDING',
            timestamp: new Date().toISOString()
        };

        console.log(' Submitting to server:');
        console.log(' Payload:', payload);
        console.log(' Year type:', typeof payload.year, 'Value:', payload.year);

        const response = await fetch(`${CONFIG.BACKEND_URL}${CONFIG.API_ENDPOINTS.SCHOLAR12}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log(' Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(' Server error:', errorText);
            throw new Error(`Server error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('Submission successful');
        return { success: true, data: result };

    } catch (error) {
        console.error('Submission failed:', error.message);
        return { success: false, error: error.message };
    }
}

// ================= SAVE OFFLINE =================
function saveScholarship12Offline(formData) {
    try {
        const pendingKey = 'scholarship12_pending';
        const pendingApps = JSON.parse(localStorage.getItem(pendingKey) || '[]');
        
        // Ensure data types are correct
        const offlineApp = {
            id: 'sch12_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: formData.name,
            college: formData.college,
            marks: typeof formData.marks === 'string' ? parseFloat(formData.marks) : formData.marks,
            year: typeof formData.year === 'string' ? parseInt(formData.year) : formData.year,
            timestamp: new Date().toISOString(),
            status: 'saved_offline',
            syncAttempts: 0
        };
        
        // Validate year before saving
        if (isNaN(offlineApp.year) || offlineApp.year < 2000 || offlineApp.year > 2100) {
            console.error(' Invalid year in offline save:', offlineApp.year);
            return { success: false, error: 'Invalid year' };
        }
        
        pendingApps.push(offlineApp);
        localStorage.setItem(pendingKey, JSON.stringify(pendingApps));
        
        console.log(' Saved offline:', offlineApp.name, 'Year:', offlineApp.year);
        return { success: true, id: offlineApp.id };
        
    } catch (e) {
        console.error(' Failed to save offline:', e);
        return { success: false, error: e.message };
    }
}

// ================= SYNC OFFLINE APPLICATIONS =================
async function syncPendingScholarship12() {
    if (!navigator.onLine) {
        console.log(' Device offline');
        return;
    }

    const pendingKey = 'scholarship12_pending';
    const pendingApps = JSON.parse(localStorage.getItem(pendingKey) || '[]');
    
    if (pendingApps.length === 0) {
        console.log(' No pending applications');
        return;
    }

    console.log(` Syncing ${pendingApps.length} pending apps`);
    
    const successfulSyncs = [];
    
    for (const app of pendingApps) {
        try {
            console.log(`Syncing: ${app.name}`);
            const result = await submitScholarship12(app);
            
            if (result.success) {
                successfulSyncs.push(app.id);
                console.log(` Synced: ${app.name}`);
            } else {
                console.log(` Failed to sync: ${app.name}`, result.error);
            }
        } catch (error) {
            console.error(`Error syncing ${app.name}:`, error);
        }
    }
    
    // Remove successfully synced
    if (successfulSyncs.length > 0) {
        const remainingApps = pendingApps.filter(app => !successfulSyncs.includes(app.id));
        localStorage.setItem(pendingKey, JSON.stringify(remainingApps));
        console.log(` Removed ${successfulSyncs.length} synced apps`);
    }
}

// ================= FORM SUBMISSION =================
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log(" Form submitted");

    // Get form values
    const name = document.getElementById("name").value.trim();
    const college = document.getElementById("college").value.trim();
    const marks = document.getElementById("marks").value.trim();
    const year = document.getElementById("year").value.trim();

    // Validation
    if (!name || !college || !marks || !year) {
        alert(" Please fill all fields");
        return;
    }

    const marksNumber = parseFloat(marks);
    if (isNaN(marksNumber) || marksNumber < 0 || marksNumber > 100) {
        alert(" Please enter valid marks (0-100)");
        return;
    }

    const yearNumber = parseInt(year);
    if (isNaN(yearNumber) || yearNumber < 2000 || yearNumber > 2100) {
        alert(" Please enter a valid year (2000-2100)");
        return;
    }

    // Prepare data with correct types
    const formData = {
        name: name,
        college: college,
        marks: marksNumber,  // Number
        year: yearNumber     // Number
    };

    console.log(' Validated data:', formData);

    // Disable submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
    submitBtn.style.opacity = "0.7";

    try {
        if (navigator.onLine) {
            console.log(" Online - submitting to server");
            const result = await submitScholarship12(formData);
            
            if (result.success) {
                alert(" Application Submitted Successfully!");
                form.reset();
            } else {
                // Server failed, save offline
                throw new Error(result.error);
            }
        } else {
            throw new Error("Device is offline");
        }
        
    } catch (error) {
        console.log("⚠ Saving offline:", error.message);
        
        // Save offline
        const saveResult = saveScholarship12Offline(formData);
        
        if (saveResult.success) {
            alert("📱 Application Saved Offline\n\nIt will sync automatically when you're back online.");
            form.reset();
        } else {
            alert(" Failed to save application. Please try again.");
        }
        
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = "1";
    }

    // Sync pending if online
    if (navigator.onLine) {
        setTimeout(syncPendingScholarship12, 1000);
    }
});

// ================= NETWORK STATUS =================
function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    
    let statusElement = document.querySelector('.status-indicator');
    if (!statusElement) {
        statusElement = document.createElement('div');
        statusElement.className = 'status-indicator';
        statusElement.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(statusElement);
    }
    
    if (isOnline) {
        statusElement.textContent = " Online";
        statusElement.style.color = "#27ae60";
        statusElement.style.backgroundColor = "#d5f4e6";
    } else {
        statusElement.textContent = "⚠ Offline";
        statusElement.style.color = "#e74c3c";
        statusElement.style.backgroundColor = "#fadbd8";
    }
}

// ================= EVENT LISTENERS =================
window.addEventListener('online', () => {
    console.log(' Device online');
    updateOnlineStatus();
    setTimeout(syncPendingScholarship12, 2000);
});

window.addEventListener('offline', () => {
    console.log(' Device offline');
    updateOnlineStatus();
});

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', function () {
    console.log(" Form initialized");
    
    // Initialize status
    updateOnlineStatus();
    
    // Check for pending apps
    const pendingApps = JSON.parse(localStorage.getItem('scholarship12_pending') || '[]');
    if (pendingApps.length > 0) {
        console.log(`Found ${pendingApps.length} pending applications`);
        
        // Show pending count in status
        const statusElement = document.querySelector('.status-indicator');
        if (statusElement && pendingApps.length > 0) {
            statusElement.textContent += ` (${pendingApps.length} pending)`;
        }
        
        // Auto-sync if online
        if (navigator.onLine) {
            setTimeout(syncPendingScholarship12, 3000);
        }
    }
    
    console.log(" Ready for submissions");
});

// ================= DEBUG HELPERS =================
window.debugScholar12 = {
    clearAll: () => {
        localStorage.removeItem('scholarship12_pending');
        console.log(" Cleared all pending");
        alert('Cleared pending applications');
        updateOnlineStatus();
    },
    viewPending: () => {
        const pending = JSON.parse(localStorage.getItem('scholarship12_pending') || '[]');
        console.log(`Pending (${pending.length}):`, pending);
        return pending;
    },
    testSubmit: () => {
        document.getElementById("name").value = "Test Student";
        document.getElementById("college").value = "Test College";
        document.getElementById("marks").value = "85";
        document.getElementById("year").value = "2023";
        form.dispatchEvent(new Event('submit'));
    },
    forceSync: () => {
        syncPendingScholarship12();
    }
};