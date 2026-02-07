import { initDB, saveApplication } from "./db.js";

/* Top-level await is OK because script uses type="module" */
await initDB();

const form = document.getElementById("scholarship12Form");

form.addEventListener("submit", (e) => {
    e.preventDefault();

const data = {
    name: document.getElementById("name").value,
    college: document.getElementById("college").value,
    marks: Number(document.getElementById("marks").value),
    year: Number(document.getElementById("year").value),
};

saveApplication({
    formType: "scholarship12",
    ...data,
    createdAt: new Date()
})
    .then(() => {
        alert(
        navigator.onLine
        ? "12th Scholarship saved successfully."
        : "Saved offline. Will sync when internet is available."
    );
    form.reset();
    })
    .catch(() => alert("Error saving scholarship data"));
});
