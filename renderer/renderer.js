// Array to hold all the notes
let notes = [];
let filteredNotes = [];

// Get DOM elements
const noteModal = document.getElementById("noteModal");
const noteInput = document.getElementById("noteInput");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const cancelNoteBtn = document.getElementById("cancelNoteBtn");

// ========== Create Note Modal ==========

// Show modal when "Create Note" button is clicked
document.getElementById("createNote").addEventListener("click", () => {
  noteInput.value = ""; // Clear input field
  noteModal.style.display = "block"; // Show modal
  noteInput.focus(); // Focus on input
});

// Save note when "Save" button clicked
saveNoteBtn.addEventListener("click", () => {
  const noteText = noteInput.value.trim();
  if (noteText) {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now
        .getHours()
        .toString()
        .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    notes.push({ text: noteText, timestamp });
    updateNotesList(); // Update the displayed list
    window.api.saveNotes(notes); // Send IPC event to save notes (handled in main process)
  }
  noteModal.style.display = "none"; // Hide modal
});

// Close modal when "Cancel" button clicked
cancelNoteBtn.addEventListener("click", () => {
  noteModal.style.display = "none"; // Hide modal
});

// ========== Settings Button ==========

// Open Settings window when "Settings" button clicked
document.getElementById("openSettings").addEventListener("click", () => {
  window.api.openSettings(); // Sends IPC event to open settings window
});

// ========== Open Notes File Button ==========

// Open notes file location when "Open Notes File" button clicked
document.getElementById("openNotesFile").addEventListener("click", () => {
  window.api.openNotesFile(); // Sends IPC event to open file
});

// ========== Update Notes List in UI ==========
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input', (e) => {
  const keyword = e.target.value.toLowerCase();
  if (keyword) {
    filteredNotes = notes.filter(note => note.text.toLowerCase().includes(keyword));
    updateNotesList(filteredNotes);
  } else {
    updateNotesList();
  }
});


function updateNotesList(displayNotes = notes) {
  const notesList = document.getElementById("notesList");
  notesList.innerHTML = ""; // Clear current list
  notes.forEach((note, index) => {
    const li = document.createElement("li");

    const textSpan = document.createElement('span');
    textSpan.textContent = note.text;

    const timeSpan = document.createElement('span');
    timeSpan.style.fontSize = '0.8em';
    timeSpan.style.color = '#888';
    timeSpan.style.marginLeft = '10px';
    timeSpan.textContent = `[${note.timestamp}]`;

    // Create Delete button for each note
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.marginLeft = '10px';

    // On Delete click → remove note, update list, save updated notes
    deleteBtn.addEventListener('click', () => {
      notes.splice(index, 1); // Remove note from array
      updateNotesList(); // Update UI
      window.api.saveNotes(notes); // Save updated notes
    });

    li.appendChild(textSpan);
    li.appendChild(timeSpan);
    li.appendChild(deleteBtn);
    notesList.appendChild(li);
  });
}

// ========== Load Notes into UI ==========

function loadNotes() {
  notes = notes || []; // Initialize notes if empty
  updateNotesList(); // Render notes
}

// ========== Listen for Notes Loaded Event ==========

// Main process sends 'notesLoaded' event → update UI with loaded notes
window.api.onNotesLoaded((loadedNotes) => {
  notes = loadedNotes; // Update notes array
  updateNotesList(); // Render notes in UI
});

// (Optional) → You might call window.api.loadNotes(); here if you want to trigger loading notes from file when app starts
// window.api.loadNotes();



document.getElementById("openNotesFile").addEventListener("click", () => {
  window.api.openNotesFile();
});


document.getElementById('clearNotes').addEventListener('click', () => {
  if (confirm('Are you sure you want to delete ALL notes?')) {
    notes = []; // Clear array
    updateNotesList();
    window.api.saveNotes(notes); // Save empty list
  }
});
