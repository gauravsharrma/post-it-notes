const CLIENT_ID = '720910107898-8id1nrg0o8q0unds8u90srtkuutn0837.apps.googleusercontent.com
';

function autoSaveNotes() {
    console.log("Auto-saving notes...");
    saveNotesToDrive();
}

// Handle Google Sign-In Response
function handleCredentialResponse(response) {
    console.log("Google Login Response:", response);

    const userToken = response.credential;
    document.cookie = `googleToken=${userToken}; path=/`;

    document.getElementById("logoutBtn").style.display = "block";
    document.getElementById("saveNotes").style.display = "block";
}

// Logout function
function logout() {
    document.cookie = "googleToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    location.reload();
}

// Create Notes in UI
function createNoteElement(text = "") {
    const note = document.createElement("div");
    note.classList.add("note");

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.addEventListener("input", () => autoSaveNotes());

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.innerText = "X";
    deleteBtn.addEventListener("click", () => {
        note.remove();
        autoSaveNotes();
    });

    note.appendChild(textarea);
    note.appendChild(deleteBtn);
    document.getElementById("notesContainer").appendChild(note);
}

// Add new note
document.getElementById("addNote").addEventListener("click", () => {
    createNoteElement();
});

// Save notes manually
document.getElementById("saveNotes").addEventListener("click", saveNotesToDrive);

// Save notes to Google Drive
async function saveNotesToDrive() {
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)googleToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");

    if (!token) {
        console.error('User not authenticated!');
        return;
    }

    const allNotes = document.querySelectorAll('.note textarea');
    const notesArray = Array.from(allNotes).map((note) => note.value);

    try {
        const response = await fetch('/.netlify/functions/save-notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token, notes: notesArray }),
        });

        const data = await response.json();
        if (response.ok) {
            console.log('Notes saved to Google Drive:', data);
            // Optionally provide user feedback here
        } else {
            console.error('Failed to save notes:', data);
            // Optionally provide user feedback here
        }
    } catch (error) {
        console.error('Error saving notes:', error);
        // Optionally provide user feedback here
    }
}

// Initialize Google Auth when the page loads
window.onload = () => {
    google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
    });

    google.accounts.id.prompt();
};