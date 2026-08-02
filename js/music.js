// Remove the leading slash so it works correctly on GitHub Pages subpaths
const audioPath = 'audio/DJ Glejs - Better Off Alone (Remix).mp3'; 
const bgMusic = new Audio(encodeURI(audioPath));
bgMusic.loop = true;

document.addEventListener('click', (event) => {
  const isInteractive = event.target.closest('a, button, input, select, textarea');

  if (!isInteractive && bgMusic.paused) {
    bgMusic.play()
      .then(() => {
        console.log("Music started playing!");
      })
      .catch(error => {
        console.error("Playback error:", error);
      });
  }
});
