document.addEventListener("DOMContentLoaded", async () => {
    const addNoteBtn = document.getElementById("addNoteBtn");
    if (addNoteBtn) {
        addNoteBtn.addEventListener("click", showAddNoteModal);
    }

    const path = window.location.pathname;

    if (path.includes("enkripsi.html")) {
        loadNotes(); 
    }

    if (path.includes("dekripsi.html")) {
        loadNotesToTable(); 
    }
});
