const CLIENT_ID = '720910107898-8id1nrg0o8q0unds8u90srtkuutn0837.apps.googleusercontent.com';
const API_KEY = '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';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';


function initGoogleAuth() {
    google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
    });

    google.accounts.id.renderButton(
        document.getElementById("googleSignIn"), 
        { theme: "outline", size: "large" }
    );
}

// Handle Google Sign-In response
function handleCredentialResponse(response) {
    const userToken = response.credential;
    document.cookie = `googleToken=${userToken}; path=/`;

    document.getElementById("googleSignIn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "block";
    document.getElementById("saveNotes").style.display = "block"; // Show save button after login

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
        loadNotesFromDrive();
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

// Auto-Save Notes to Google Drive when a note is changed
function autoSaveNotes() {
    clearTimeout(window.autoSaveTimer);
    window.autoSaveTimer = setTimeout(saveNotesToDrive, 3000); // Auto-save after 3 seconds of inactivity
}

// Save notes to Google Drive when user clicks "Save Notes"
document.getElementById("saveNotes").addEventListener("click", saveNotesToDrive);

async function saveNotesToDrive() {
    const accessToken = gapi.auth.getToken().access_token;
    if (!accessToken) {
        console.error("User not authenticated!");
        return;
    }

    const allNotes = document.querySelectorAll(".note textarea");
    const notesArray = Array.from(allNotes).map(note => note.value);

    const fileMetadata = {
        name: "PostItNotes.txt",
        mimeType: "text/plain"
    };

    const fileContent = notesArray.join("\n---\n"); // Separate notes with ---
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

// Load Notes from Google Drive on Login
async function loadNotesFromDrive() {
    const accessToken = gapi.auth.getToken().access_token;
    if (!accessToken) {
        console.error("User not authenticated!");
        return;
    }

    const response = await fetch('https://www.googleapis.com/drive/v3/files?q=name="PostItNotes.txt"&fields=files(id,name)', {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await response.json();
    if (data.files.length > 0) {
        const fileId = data.files[0].id;

        // Fetch file content
        const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const fileText = await fileResponse.text();
        const notesArray = fileText.split("\n---\n");

        // Load notes into the UI
        document.getElementById("notesContainer").innerHTML = "";
        notesArray.forEach(noteText => createNoteElement(noteText));
    }
}

// Initialize Google Auth
window.onload = () => {
    initGoogleAuth();
};