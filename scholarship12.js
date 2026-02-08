// scholar12.js - COMPLETE VERSION
console.log("12th Scholarship Form Loaded");

// ================= CONFIGURATION =================
const CONFIG = {
    BACKEND_URL: "http://localhost:4000",
    SYNC_ENDPOINT: "/sync/submit",
    SERVICE_TYPE: "scholar12",
    
    // Local storage keys
    LOCAL_DB_NAME: "DigitalAccessDB",
    LOCAL_STORE_NAME: "pendingSubmissions",
    
    // Form field IDs
    FORM_IDS: {
        FORM: "scholarship12Form",
        NAME: "name",
        COLLEGE: "college",
        MARKS: "marks",
        YEAR: "year"
    }
};

// ================= INDEXEDDB SETUP =================
let db;

function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(CONFIG.LOCAL_DB_NAME, 1);

        request.onerror = (event) => {
            console.error("IndexedDB error:", event.target.error);
            reject("Failed to open database");
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("IndexedDB opened successfully");
            resolve();
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(CONFIG.LOCAL_STORE_NAME)) {
                const store = db.createObjectStore(CONFIG.LOCAL_STORE_NAME, { 
                    keyPath: 'id',
                    autoIncrement: true 
                });
                store.createIndex('service_type', 'service_type', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
                console.log("Object store created");
            }
        };
    });
}

// ================= FORM HANDLING =================
function getFormData() {
    return {
        name: document.getElementById(CONFIG.FORM_IDS.NAME).value.trim(),
        college: document.getElementById(CONFIG.FORM_IDS.COLLEGE).value.trim(),
        marks: parseFloat(document.getElementById(CONFIG.FORM_IDS.MARKS).value),
        year: document.getElementById(CONFIG.FORM_IDS.YEAR).value.trim()
    };
}

function validateFormData(data) {
    const errors = [];
    
    if (!data.name) errors.push("Name is required");
    if (!data.college) errors.push("College name is required");
    if (isNaN(data.marks) || data.marks < 0 || data.marks > 100) {
        errors.push("Marks must be between 0 and 100");
    }
    if (!data.year || data.year.length !== 4) {
        errors.push("Year must be 4 digits (e.g., 2024)");
    }
    
    return errors;
}

// ================= OFFLINE STORAGE =================
function saveToIndexedDB(formData) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject("Database not initialized");
            return;
        }

        const transaction = db.transaction([CONFIG.LOCAL_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(CONFIG.LOCAL_STORE_NAME);
        
        const submission = {
            service_type: CONFIG.SERVICE_TYPE,
            form_data: formData,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        const request = store.add(submission);

        request.onsuccess = () => {
            console.log("Saved to IndexedDB with ID:", request.result);
            resolve(request.result);
        };

        request.onerror = (event) => {
            console.error("Error saving to IndexedDB:", event.target.error);
            reject(event.target.error);
        };
    });
}

// ================= SYNC WITH BACKEND =================
async function syncWithBackend() {
    if (!db) {
        console.log("Database not ready, skipping sync");
        return;
    }

    const transaction = db.transaction([CONFIG.LOCAL_STORE_NAME], 'readonly');
    const store = transaction.objectStore(CONFIG.LOCAL_STORE_NAME);
    const index = store.index('status');
    const request = index.getAll('pending');

    request.onsuccess = async (event) => {
        const pendingItems = event.target.result;
        
        if (pendingItems.length === 0) {
            console.log("No pending submissions to sync");
            return;
        }

        console.log(`Found ${pendingItems.length} pending submissions to sync`);

        for (const item of pendingItems) {
            try {
                const response = await fetch(`${CONFIG.BACKEND_URL}${CONFIG.SYNC_ENDPOINT}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        service_type: item.service_type,
                        form_data: item.form_data
                    })
                });

                if (response.ok) {
                    console.log(`Successfully synced item ${item.id}`);
                    // Mark as synced
                    await markAsSynced(item.id);
                } else {
                    console.error(`Failed to sync item ${item.id}:`, await response.text());
                }
            } catch (error) {
                console.error(`Error syncing item ${item.id}:`, error);
            }
        }
    };
}

function markAsSynced(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([CONFIG.LOCAL_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(CONFIG.LOCAL_STORE_NAME);
        
        const getRequest = store.get(id);
        
        getRequest.onsuccess = () => {
            const item = getRequest.result;
            item.status = 'synced';
            item.synced_at = new Date().toISOString();
            
            const updateRequest = store.put(item);
            
            updateRequest.onsuccess = () => {
                console.log(`Marked item ${id} as synced`);
                resolve();
            };
            
            updateRequest.onerror = (event) => {
                console.error("Error marking as synced:", event.target.error);
                reject(event.target.error);
            };
        };
        
        getRequest.onerror = (event) => {
            console.error("Error getting item:", event.target.error);
            reject(event.target.error);
        };
    });
}

// ================= FORM SUBMISSION =================
async function handleSubmit(event) {
    event.preventDefault();
    console.log("Form submission started");

    const formData = getFormData();
    console.log("Form data:", formData);

    const errors = validateFormData(formData);
    if (errors.length > 0) {
        alert(" Please fix the following errors:\n\n" + errors.join("\n"));
        return;
    }

    try {
        // Try to submit online first
        if (navigator.onLine) {
            console.log("Online - attempting direct submission");
            
            const response = await fetch(`${CONFIG.BACKEND_URL}${CONFIG.SYNC_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    service_type: CONFIG.SERVICE_TYPE,
                    form_data: formData
                })
            });

            if (response.ok) {
                const result = await response.json();
                alert(` ✅ Application Submitted Successfully!\n\nApplication ID: ${result.application_id}\nStatus: ${result.status}\n\nYour application has been received.`);
                
                // Reset form
                document.getElementById(CONFIG.FORM_IDS.FORM).reset();
                
                // Sync any pending items
                await syncWithBackend();
                return;
            } else {
                throw new Error(`Server error: ${response.status}`);
            }
        }
    } catch (error) {
        console.log("Online submission failed, saving offline:", error);
    }

    // Save offline
    try {
        await saveToIndexedDB(formData);
        alert(` 📱 Application Saved Offline\n\nYour application has been saved locally and will be submitted automatically when you're back online.\n\nName: ${formData.name}\nCollege: ${formData.college}\nMarks: ${formData.marks}\nYear: ${formData.year}`);
        
        // Reset form
        document.getElementById(CONFIG.FORM_IDS.FORM).reset();
        
    } catch (dbError) {
        console.error("Failed to save offline:", dbError);
        alert(" ❌ Error\n\nFailed to save your application. Please try again.");
    }
}

// ================= NETWORK DETECTION =================
function updateOnlineStatus() {
    const statusElement = document.querySelector('.app-footer p');
    if (statusElement) {
        if (navigator.onLine) {
            statusElement.textContent = "You're online. Submissions will be sent immediately.";
            statusElement.style.color = "#27ae60";
            
            // Try to sync when coming online
            setTimeout(() => syncWithBackend(), 1000);
        } else {
            statusElement.textContent = "You're offline. Submissions will be saved locally and synced later.";
            statusElement.style.color = "#e74c3c";
        }
    }
}

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', async function() {
    console.log("Initializing 12th Scholarship form...");
    
    try {
        // Initialize IndexedDB
        await initIndexedDB();
        console.log("IndexedDB initialized");
        
        // Set up form submission
        const form = document.getElementById(CONFIG.FORM_IDS.FORM);
        if (form) {
            form.addEventListener('submit', handleSubmit);
            console.log("Form event listener added");
        } else {
            console.error("Form not found with ID:", CONFIG.FORM_IDS.FORM);
        }
        
        // Set up network detection
        updateOnlineStatus();
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        
        // Try to sync any pending submissions
        if (navigator.onLine) {
            setTimeout(() => syncWithBackend(), 2000);
        }
        
        console.log("12th Scholarship form initialized successfully");
        
    } catch (error) {
        console.error("Initialization failed:", error);
        alert("Error initializing form. Please refresh the page.");
    }
});

// ================= UTILITY FUNCTIONS =================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
