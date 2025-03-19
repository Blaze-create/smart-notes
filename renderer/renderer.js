document.getElementById('createNote').addEventListener('click', () => {
    alert('New Note Button Clicked!');
});

document.getElementById('openSettings').addEventListener('click', () => {
    window.api.openSettings(); // Sends IPC event
});
