// scholarship10.js - 10th Scholarship Form (CORRECTED VERSION)
console.log("10th Scholarship Form Initializing...");

const form = document.getElementById("scholarship10Form");
if (!form) {
    console.error("10th Scholarship form not found!");
    alert("Error: Form not found on page. Please refresh.");
}

// ================= CONFIGURATION =================
const CONFIG = {
    BACKEND_URL: 'http://localhost:4000/',
    API_ENDPOINTS: {
        SCHOLAR10: 'gov/scholar10',
        SYNC: 'sync/submit'
    },
    SERVICE_TYPE: 'scholar10'
};

// ================= SUBMIT TO SERVER =================
async function submitScholar10ToServer(formData) {
    try {
        const payload = {
            name: formData.name,
            school: formData.school,
            marks: formData.marks,
            year: formData.year,
            status: 'PENDING',
            timestamp: new Date().toISOString()
        };

        console.log('Submitting 10th scholarship application:', payload);

        const response = await fetch(`${CONFIG.BACKEND_URL}${CONFIG.API_ENDPOINTS.SCHOLAR10}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        console.log(' 10th scholarship submitted successfully:', result);
        return { success: true, data: result };

    } catch (error) {
        console.error('Server submission failed:', error.message);
        return { success: false, error: error.message };
    }
}

// ================= SAVE OFFLINE =================
function saveScholar10Offline(formData) {
    try {
        const pendingKey = 'scholar10_pending';
        const pendingApps = JSON.parse(localStorage.getItem(pendingKey) || '[]');
        
        const offlineApp = {
            id: 'scholar10_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            ...formData,
            timestamp: new Date().toISOString(),
            status: 'saved_offline',
            formType: 'scholar10'
        };
        
        pendingApps.push(offlineApp);
        localStorage.setItem(pendingKey, JSON.stringify(pendingApps));
        
        console.log(' 10th scholarship saved offline:', offlineApp);
        console.log('Total pending 10th scholarships:', pendingApps.length);
        
        return { 
            success: true, 
            message: 'Application saved offline',
            id: offlineApp.id,
            pendingCount: pendingApps.length
        };
        
    } catch (error) {
        console.error(' Failed to save 10th scholarship offline:', error);
        return { success: false, error: 'Could not save application offline' };
    }
}

// ================= SYNC OFFLINE APPLICATIONS =================
async function syncOfflineScholar10() {
    if (!navigator.onLine) {
        console.log('Device offline, cannot sync 10th scholarships');
        return;
    }

    const pendingKey = 'scholar10_pending';
    const pendingApps = JSON.parse(localStorage.getItem(pendingKey) || '[]');
    
    if (pendingApps.length === 0) {
        console.log('No offline 10th scholarships to sync');
        return;
    }

    console.log(` Syncing ${pendingApps.length} offline 10th scholarships...`);
    
    const successfulSyncs = [];
    const failedSyncs = [];
    
    for (const app of pendingApps) {
        try {
            console.log(`Syncing 10th scholarship: ${app.name} (${app.id})`);
            
            const result = await submitScholar10ToServer(app);
            
            if (result.success) {
                successfulSyncs.push(app.id);
                console.log(` Synced successfully: ${app.name}`);
            } else {
                failedSyncs.push(app.id);
                console.log(` Failed to sync: ${app.name}`);
            }
            
        } catch (error) {
            failedSyncs.push(app.id);
            console.error(`Error syncing ${app.name}:`, error);
        }
    }
    
    // Remove successfully synced applications
    if (successfulSyncs.length > 0) {
        const remainingApps = pendingApps.filter(app => !successfulSyncs.includes(app.id));
        localStorage.setItem(pendingKey, JSON.stringify(remainingApps));
        console.log(` Removed ${successfulSyncs.length} successfully synced 10th scholarships`);
    }
    
    if (failedSyncs.length > 0) {
        console.log(` ${failedSyncs.length} 10th scholarships still need syncing`);
    }
}

// ================= FORM SUBMISSION =================
form.addEventListener("submit", async function(event) {
    event.preventDefault(); // Stop form from refreshing page
    
    console.log("10th Scholarship form submitted");

    // Get form values
    const formData = {
        name: document.getElementById("name").value.trim(),
        school: document.getElementById("school").value.trim(),
        marks: document.getElementById("marks").value.trim(),
        year: document.getElementById("year").value.trim()
    };

    console.log("Form values:", formData);

    // Validate form
    if (!formData.name || !formData.school || !formData.marks || !formData.year) {
        alert(" Please fill in all fields");
        return;
    }

    // Validate marks is a number
    const marksNumber = parseFloat(formData.marks);
    if (isNaN(marksNumber) || marksNumber < 0 || marksNumber > 100) {
        alert("Please enter valid marks between 0 and 100");
        return;
    }

    // Validate year is a number
    const yearNumber = parseInt(formData.year);
    if (isNaN(yearNumber) || yearNumber < 2000 || yearNumber > new Date().getFullYear()) {
        alert("Please enter a valid passing year");
        return;
    }
    
    // Update data with numbers
    formData.marks = marksNumber;
    formData.year = yearNumber;

    // Disable submit button to prevent double submission
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";
    submitButton.style.opacity = "0.7";

    let submissionResult = null;
    let savedOffline = false;

    try {
        // Step 1: Try to submit online if available
        if (navigator.onLine) {
            console.log("Online - attempting server submission...");
            submissionResult = await submitScholar10ToServer(formData);
        } else {
            console.log("Offline - will save locally");
            submissionResult = { success: false, error: "Offline" };
        }
        
        // Step 2: If online submission failed or we're offline, save locally
        if (!submissionResult.success) {
            console.log("Server submission failed or offline, saving locally...");
            const offlineResult = saveScholar10Offline(formData);
            
            if (offlineResult.success) {
                savedOffline = true;
                alert(" 10th Scholarship application saved offline!\n\nIt will be submitted automatically when you're back online.");
                form.reset(); // Clear the form
            } else {
                alert("Failed to save application. Please check your data and try again.");
            }
        } 
        // Step 3: If online submission was successful
        else if (submissionResult.success) {
            alert(" 10th Scholarship application submitted successfully!");
            form.reset(); // Clear the form
            
            // Try to sync any pending offline applications
            if (navigator.onLine) {
                setTimeout(syncOfflineScholar10, 1000);
            }
        } 
        // Step 4: If something else went wrong
        else {
            alert(" Submission failed: " + (submissionResult.error || "Unknown error"));
        }
        
    } catch (error) {
        console.error("Unexpected error during submission:", error);
        alert(" An unexpected error occurred. Please try again.");
        
        // Last resort: try to save offline
        try {
            saveScholar10Offline(formData);
            alert(" Application was saved offline as a backup.");
        } catch (e) {
            console.error("Could not even save offline:", e);
        }
        
    } finally {
        // Always re-enable the submit button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        submitButton.style.opacity = "1";
        console.log("Submit button reset");
    }

    // If saved offline and now online, try to sync
    if (savedOffline && navigator.onLine) {
        setTimeout(syncOfflineScholar10, 1000);
    }
});

// ================= NETWORK STATUS =================
function updateNetworkStatus() {
    const isOnline = navigator.onLine;
    console.log("Network status:", isOnline ? "Online" : "Offline");
    
    // Update status indicator
    let statusElement = document.querySelector('.scholar10-status-indicator');
    if (!statusElement) {
        statusElement = document.createElement('div');
        statusElement.className = 'scholar10-status-indicator';
        statusElement.style.cssText = `
            position: fixed;
            top: 90px;
            right: 10px;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            background-color: #f8f9fa;
        `;
        document.body.appendChild(statusElement);
    }
    
    if (isOnline) {
        statusElement.textContent = "✓ Online";
        statusElement.style.color = "#27ae60";
        statusElement.style.backgroundColor = "#d5f4e6";
    } else {
        statusElement.textContent = "⚠ Offline";
        statusElement.style.color = "#e74c3c";
        statusElement.style.backgroundColor = "#fadbd8";
    }
}

// ================= AUTO-SYNC WHEN ONLINE =================
window.addEventListener('online', async () => {
    console.log(' Device came online');
    updateNetworkStatus();
    
    // Sync pending 10th scholarships after 2 seconds
    setTimeout(syncOfflineScholar10, 2000);
});

window.addEventListener('offline', () => {
    console.log(' Device went offline');
    updateNetworkStatus();
});

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', function() {
    console.log(" 10th Scholarship Form Loaded");
    
    if (!form) {
        console.error("CRITICAL: Form not found!");
        return;
    }
    
    // Set up network listeners
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // Initial status check
    updateNetworkStatus();
    
    // Check for pending 10th scholarships on load
    const pendingApps = JSON.parse(localStorage.getItem('scholar10_pending') || '[]');
    if (pendingApps.length > 0) {
        console.log(`Found ${pendingApps.length} pending 10th scholarship applications`);
        
        // If online, sync them after a delay
        if (navigator.onLine) {
            console.log("Auto-syncing pending 10th scholarships in 3 seconds...");
            setTimeout(syncOfflineScholar10, 3000);
        }
    }
    
    console.log(" 10th Scholarship form ready");
});

// ================= DEBUG HELPERS =================
window.scholar10Debug = {
    clearAll: function() {
        localStorage.removeItem('scholar10_pending');
        console.log(" Cleared all pending 10th scholarships");
        alert('All pending 10th scholarships cleared');
    },
    viewPending: function() {
        const pending = JSON.parse(localStorage.getItem('scholar10_pending') || '[]');
        console.log("Pending 10th scholarships:", pending);
        console.log(`Total: ${pending.length}`);
        return pending;
    },
    testSubmission: function() {
        // Auto-fill form for testing
        document.getElementById("name").value = "Saraswati";
        document.getElementById("school").value = "D.P.S";
        document.getElementById("marks").value = "97";
        document.getElementById("year").value = "2022";
        form.dispatchEvent(new Event('submit'));
    },
    forceSync: function() {
        syncOfflineScholar10();
    }
};