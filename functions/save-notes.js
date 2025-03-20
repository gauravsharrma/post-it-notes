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
