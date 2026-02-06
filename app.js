import{ initDB, saveApplication }from "./db.js";
initDB();

// Populate State dropdown
const states = [
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
    "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
    "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
    "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu",
    "Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"
];

const stateSelect = document.getElementById("state");
states.forEach(state => {
    const opt = document.createElement("option");
    opt.value = state;
    opt.textContent = state;
    stateSelect.appendChild(opt);
});

const statusText = document.getElementById("offline-status");

function updateStatus() {
    if (navigator.onLine) {
    statusText.textContent = "Online mode";
    statusText.style.color = "green";
} else {
    statusText.textContent = "Offline mode – data will be saved locally";
    statusText.style.color = "orange";
}
}

window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);
updateStatus();

// Form submit handler
const form = document.querySelector("form");
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const data = {
        name: document.getElementById("name").value,
        dob: document.getElementById("dob").value,
        state: document.getElementById("state").value,
        city: document.getElementById("city").value,
        address: document.getElementById("address").value,
        category: document.getElementById("category").value,
        income: document.getElementById("income").value
    };

    saveApplication({
    formType: "government",
    ...data,
    createdAt: new Date()
}).then(() => {
    alert(
        navigator.onLine
            ? "Form saved successfully."
            : "Form saved locally. It will sync when internet is available."
    );
    form.reset();
}).catch(() => {
    console.log("Error storing data");
});
});
// Register Service Worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("sw.js")
            .then(() => console.log("Service Worker registered"))
            .catch(err => console.error("Service Worker error:", err));
    });
}