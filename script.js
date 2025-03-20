const CLIENT_ID = '720910107898-8id1nrg0o8q0unds8u90srtkuutn0837.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const API_KEY = 'AIzaSyD5SHVtMFbCBYd9k04s705o3GgV5Om7e2Q';
const SCOPES = 'https://www.googleapis.com/auth/drive.file openid email profile';

// Handle Google Sign-In Response
function handleCredentialResponse(response) {
    console.log("Google Login Response:", response);

    const idToken = response.credential;

    // Initialize gapi if not already loaded
    gapi.load("client:auth2", async () => {
        await gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
            scope: SCOPES,
        });

        const authInstance = gapi.auth2.getAuthInstance();
        authInstance.signIn().then(user => {
            const authResponse = user.getAuthResponse();
            document.cookie = `googleAccessToken=${authResponse.access_token}; path=/`;
            console.log("Access Token Received:", authResponse.access_token);
            loadGoogleDrive();
        }).catch(error => {
            console.error("Google Sign-In Error:", error);
        });
    });
}

// Logout function
function logout() {
    document.cookie = "googleAccessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    location.reload();
}

// Load Google Drive API
function loadGoogleDrive() {
    if (typeof gapi === 'undefined') {
        console.error("Google API (gapi) is not loaded yet.");
        return;
    }

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

// Save notes to Google Drive
async function saveNotesToDrive() {
    const accessToken = document.cookie.split('; ').find(row => row.startsWith('googleAccessToken='))?.split('=')[1];

    if (!accessToken) {
        console.error("User not authenticated!");
        alert("Please log in with Google to save notes.");
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

    try {
        const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: form,
        });

        const uploadData = await uploadResponse.json();
        if (uploadData.error) {
            console.error("Google Drive Upload Error:", uploadData.error);
        } else {
            console.log("Notes saved to Google Drive:", uploadData);
        }
    } catch (error) {
        console.error("Failed to save notes:", error);
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