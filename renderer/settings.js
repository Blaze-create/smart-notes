// Add an event listener to the button with id 'closeSettings'
document.getElementById('closeSettings').addEventListener('click', () => {
  // Call the exposed API function to send an IPC event to the Main process
  window.api.closeSettings();
});
