function goToWinners() {
  window.location.href = "winners.html";
}

function goBack() {
  window.location.href = "index.html";
}

// ==== FIX AUDIO PLAY ON USER INTERACTION ====
document.addEventListener("click", function () {
  const music = document.getElementById("bgMusic");
  if (music && music.paused) {
    music.play().catch(() => {});
  }
}, { once: true });

// ==== FIX: PLAY AUDIO OTOMATIS SAAT LOAD ====
window.addEventListener("load", () => {
  const music = document.getElementById("bgMusic");
  if (!music) return;

  const playPromise = music.play();

  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // tunggu sekali klik user kalau autoplay ditolak
      document.addEventListener("click", () => music.play(), { once: true });
    });
  }
});
