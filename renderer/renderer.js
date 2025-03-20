let notes = [];
const noteModal = document.getElementById("noteModal");
const noteInput = document.getElementById("noteInput");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const cancelNoteBtn = document.getElementById("cancelNoteBtn");

document.getElementById("createNote").addEventListener("click", () => {
  noteInput.value = "";
  noteModal.style.display = "block";
  noteInput.focus();
});

//save note
saveNoteBtn.addEventListener("click", () => {
  const noteText = noteInput.value.trim();
  if (noteText) {
    notes.push({ text: noteText });
    updateNotesList();
    window.api.saveNotes(notes);
  }
  noteModal.style.display = "none";
});
cancelNoteBtn.addEventListener("click", () => {
  noteModal.style.display = "none";
});
document.getElementById("openSettings").addEventListener("click", () => {
  window.api.openSettings(); // Sends IPC event
});

// Open notes file button
document.getElementById("openNotesFile").addEventListener("click", () => {
  window.api.openNotesFile();
});

function updateNotesList() {
  const notesList = document.getElementById("notesList");
  notesList.innerHTML = "";
  notes.forEach((note) => {
    const li = document.createElement("li");
    li.textContent = note.text;
    notesList.appendChild(li);
  });
}

function loadNotes() {
  notes = notes || [];
  updateNotesList();
}

// window.api.loadNotes(); // Sends IPC event to load notes from file

// Listen for loaded notes
window.api.onNotesLoaded((loadedNotes) => {
  notes = loadedNotes; // Update the local notes array
  updateNotesList();
});

document.getElementById("openNotesFile").addEventListener("click", () => {
  window.api.openNotesFile();
});
