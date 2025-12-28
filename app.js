const API_URL = 'http://localhost:3000/api/notes';

const noteTitle = document.getElementById('note-title');
const noteContent = document.getElementById('note-content');
const addBtn = document.getElementById('add-btn');
const updateBtn = document.getElementById('update-btn');
const notesList = document.getElementById('notes-list');

let currentEditId = null;

document.addEventListener('DOMContentLoaded', fetchNotes);

async function fetchNotes() {
    try {
        const response = await fetch(API_URL);
        const notes = await response.json();
        renderNotes(notes);
    } catch (err) {
        console.error('Error fetching notes:', err);
    }
}

function renderNotes(notes) {
    notesList.innerHTML = '';
    notes.forEach(note => {
        const noteCard = document.createElement('div');
        noteCard.classList.add('note-card');
        noteCard.innerHTML = `
            <h3>${escapeHtml(note.title)}</h3>
            <p>${escapeHtml(note.content)}</p>
            <div class="note-actions">
                <button class="action-btn edit-btn" onclick="editNote('${note._id}', '${escapeHtml(note.title)}', '${escapeHtml(note.content)}')">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteNote('${note._id}')">Delete</button>
            </div>
        `;
        notesList.appendChild(noteCard);
    });
}

// Add Note
addBtn.addEventListener('click', async () => {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    if (!title || !content) {
        alert('Please fill in both fields');
        return;
    }

    // specific visual feedback button
    const originalText = addBtn.textContent;
    addBtn.textContent = 'Adding...';
    addBtn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });
        
        if (!response.ok) throw new Error('Failed to add note');

        clearForm();
        fetchNotes(); // Re-fetch to update list
    } catch (err) {
        console.error('Error adding note:', err);
        alert('Error adding note. Is the server running?');
    } finally {
        addBtn.textContent = originalText;
        addBtn.disabled = false;
    }
});

// Delete Note
async function deleteNote(id) {
    if(!confirm('Are you sure you want to delete this note?')) return;
    
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchNotes();
    } catch (err) {
        console.error('Error deleting note:', err);
    }
}

// Edit Note (Prepare UI)
window.editNote = function(id, title, content) {
    currentEditId = id;
    noteTitle.value = unescapeHtml(title);
    noteContent.value = unescapeHtml(content);
    addBtn.style.display = 'none';
    updateBtn.style.display = 'inline-block';
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update Note (Action)
updateBtn.addEventListener('click', async () => {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    if (!title || !content) {
        alert('Please fill in both fields');
        return;
    }

    try {
        await fetch(`${API_URL}/${currentEditId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });
        clearForm();
        fetchNotes();
    } catch (err) {
        console.error('Error updating note:', err);
    }
});

function clearForm() {
    noteTitle.value = '';
    noteContent.value = '';
    currentEditId = null;
    addBtn.style.display = 'inline-block';
    updateBtn.style.display = 'none';
}

// Simple HTML Escape/Unescape to prevent XSS
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function unescapeHtml(text) {
    return text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#039;/g, "'");
}
