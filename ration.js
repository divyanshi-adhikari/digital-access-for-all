import { initDB, saveApplication } from "./db.js";

/* Top-level await is safe (script uses type="module") */
await initDB();

const form = document.getElementById("rationForm");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const data = {
    name: document.getElementById("name").value,
    category: document.getElementById("category").value,
    ration_number: document.getElementById("ration_number").value,
    family_members: Number(
        document.getElementById("family_members").value
    ),
};

saveApplication({
    formType: "ration",
    ...data,
    createdAt: new Date()
})
    .then(() => {
        alert(
        navigator.onLine
        ? "Ration card application saved successfully."
        : "Saved offline. Will sync when internet is available."
    );
    form.reset();
    })
    .catch(() => alert("Error saving ration card data"));
});
