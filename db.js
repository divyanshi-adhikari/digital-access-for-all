let db;

export function initDB() {
    return new Promise((resolve, reject) => {
    const request = indexedDB.open("DigitalDivideDB", 1);

    request.onupgradeneeded = (e) => {
        db = e.target.result;
        if (!db.objectStoreNames.contains("applications")) {
        db.createObjectStore("applications", {
            keyPath: "id",
            autoIncrement: true
        });
    }
    };

    request.onsuccess = (e) => {
        db = e.target.result;
        resolve(db);
    };

    request.onerror = () => reject("IndexedDB error");
});
}

export function saveApplication(data) {
    return new Promise((resolve, reject) => {
    const tx = db.transaction("applications", "readwrite");
    const store = tx.objectStore("applications");
    const req = store.add(data);

    req.onsuccess = () => resolve();
    req.onerror = () => reject("Save failed");
});
}
export function getAllApplications() {
    return new Promise((resolve, reject) => {
    const tx = db.transaction("applications", "readonly");
    const store = tx.objectStore("applications");
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject("Failed to read applications");
});
}
