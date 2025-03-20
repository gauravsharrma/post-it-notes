const { google } = require('googleapis');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);
        const token = data.token;
        const notes = data.notes;

        // Verify the JWT token
        const ticket = await google.auth.verifyIdToken({
            idToken: token,
            audience: '720910107898-8id1nrg0o8q0unds8u90srtkuutn0837.apps.googleusercontent.com', //Replace with you client ID.
        });

        const payload = ticket.getPayload();
        const userId = payload['sub'];

        // Authenticate with Google Drive API
        const auth = new google.auth.OAuth2({
            clientId: '720910107898-8id1nrg0o8q0unds8u90srtkuutn0837.apps.googleusercontent.com', //Replace with you client ID.
        });
        auth.setCredentials({ id_token: token });
        const drive = google.drive({ version: 'v3', auth });

        // Combine notes into a single string
        const fileContent = notes.join('\n---\n');

        // Upload the file to Google Drive
        const fileMetadata = {
            name: 'PostItNotes.txt',
            mimeType: 'text/plain',
        };
        const media = {
            mimeType: 'text/plain',
            body: fileContent,
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });
