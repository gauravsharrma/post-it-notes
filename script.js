const CLIENT_ID = '720910107898-8id1nrg0o8q0unds8u90srtkuutn0837.apps.googleusercontent.com';
const API_KEY = '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';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';


// Handle Google Sign-In Response
function handleCredentialResponse(response) {
    console.log("Google Login Response:", response);

    const userToken = response.credential;
    document.cookie = `googleToken=${userToken}; path=/`;

    document.getElementById("logoutBtn").style.display = "block";
    document.getElementById("saveNotes").style.display = "block";

    loadGoogleDrive();
}

// Logout function
function logout() {
    document.cookie = "googleToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    location.reload();
}

// Load Google Drive API
function loadGoogleDrive() {
    gapi.load("client:auth2", async () => {
        await gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
            scope: SCOPES,
        });

        console.log("Google Drive API Loaded!");
    });
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
    const accessToken = gapi.auth.getToken()?.access_token;
    if (!accessToken) {
        console.error("User not authenticated!");
        return;
    }

    const allNotes = document.querySelectorAll(".note textarea");
    const notesArray = Array.from(allNotes).map(note => note.value);
    const fileContent = notesArray.join("\n---\n");

    const fileMetadata = {
        name: "PostItNotes.txt",
        mimeType: "text/plain"
    };

    const fileBlob = new Blob([fileContent], { type: 'text/plain' });
    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(fileMetadata)], { type: "application/json" }));
    form.append("file", fileBlob);

    const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
    });

    const uploadData = await uploadResponse.json();
    console.log("Notes saved to Google Drive:", uploadData);
}

// Initialize Google Auth when the page loads
window.onload = () => {
    google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
    });

    google.accounts.id.prompt();
};