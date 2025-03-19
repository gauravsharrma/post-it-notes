document.addEventListener("DOMContentLoaded", function () {
    const addNoteBtn = document.getElementById("addNote");
    const notesContainer = document.getElementById("notesContainer");

    // Load notes from local storage
    function loadNotes() {
        notesContainer.innerHTML = "";
        const notes = JSON.parse(localStorage.getItem("notes")) || [];
        notes.forEach((note, index) => createNoteElement(note, index));
    }

    // Create a new note element
    function createNoteElement(text, index) {
        const note = document.createElement("div");
        note.classList.add("note");

        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.addEventListener("input", () => saveNotes());

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.innerText = "X";
        deleteBtn.addEventListener("click", () => {
            deleteNote(index);
        });

        note.appendChild(textarea);
        note.appendChild(deleteBtn);
        notesContainer.appendChild(note);
    }

    // Add new note
    addNoteBtn.addEventListener("click", function () {
        const notes = JSON.parse(localStorage.getItem("notes")) || [];
        notes.push("");
        localStorage.setItem("notes", JSON.stringify(notes));
        loadNotes();
    });

    // Delete note
    function deleteNote(index) {
        let notes = JSON.parse(localStorage.getItem("notes")) || [];
        notes.splice(index, 1);
        localStorage.setItem("notes", JSON.stringify(notes));
        loadNotes();
    }

    // Save notes
    function saveNotes() {
        const allNotes = document.querySelectorAll(".note textarea");
        const notes = Array.from(allNotes).map(note => note.value);
        localStorage.setItem("notes", JSON.stringify(notes));
    }

    function handleCredentialResponse(response) {
        const data = jwt_decode(response.credential);
        console.log(data);
        // Proceed with application-specific logic
    }

    // Load saved notes when the page loads
    loadNotes();
});