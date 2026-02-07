import { initDB, saveApplication } from "./db.js";
await initDB();

const form = document.getElementById("scholarship10Form");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
    name: document.getElementById("name").value,
    school: document.getElementById("school").value,
    marks:Number (document.getElementById("marks").value),
    year:Number (document.getElementById("year").value),
};

saveApplication({
    formType: "scholarship10",
    ...data,
    createdAt: new Date()
})
.then(() => {
    alert(
        navigator.onLine
        ? "Scholarship 10th saved"
        : "Saved offline. Will sync later."
    );
    form.reset();
})
.catch(() => alert("Error saving data"));
});
