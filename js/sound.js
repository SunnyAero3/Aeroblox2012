// Create the audio object with your specific file name
// Using encodeURI ensures spaces and hyphens don't break the path
const bgMusic = new Audio(encodeURI('/audio/DJ Glejs - Better Off Alone (Remix).mp3'));
bgMusic.loop = true; // Loops the song automatically

document.addEventListener('click', (event) => {
  // Check if what was clicked (or its parent) is a link, button, or input
  const isInteractive = event.target.closest('a, button, input, select, textarea');

  // If it's NOT an interactive element, and the music is paused, play it
  if (!isInteractive && bgMusic.paused) {
    bgMusic.play().catch(error => {
      console.error("Playback failed:", error);
    });
  }
});
