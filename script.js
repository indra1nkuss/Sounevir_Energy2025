// -------------------------
// script.js
// Navigasi + robust audio handling (safe for iOS/Android/Desktop)
// -------------------------

function goToWinners() {
  window.location.href = "winners.html";
}

function goBack() {
  window.location.href = "index.html";
}

// Robust audio initializer used by both pages.
// - Tries autoplay on load
// - If rejected, waits for first user gesture (pointerdown/touchstart/click), then unmute+play
// - Provides a toggle button with id "audioToggle" (if present)
(function initBackgroundAudio() {
  const music = document.getElementById("bgMusic");
  const toggle = document.getElementById("audioToggle");
  if (!music) return; // page without audio

  const isiOS = /iP(hone|od|ad)/.test(navigator.platform) || (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
  if (toggle && isiOS) {
    try { toggle.remove(); } catch(e) { toggle.style.display = 'none'; }
  }

  // start muted initially to avoid autoplay issues in some browsers
  // but we won't keep it muted forever; the user gesture will unmute + play
  music.muted = true;

  // helper to unmute then play
  function unmuteAndPlay() {
    // Unmute first (some browsers require unmute before play if action is user gesture)
    try { music.muted = false; } catch(e){ /* ignore */ }
    // attempt to play
    const p = music.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => { /* ignore */ });
    }
  }

  // Try to autoplay on load (many browsers will reject; catch that and fallback)
  window.addEventListener("load", () => {
    const playPromise = music.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // If autoplay succeeded, ensure muted state is false
        music.muted = false;
        if (toggle) toggle.textContent = '🔊';
        toggle && toggle.setAttribute('aria-pressed', 'false');
      }).catch(() => {
        // Autoplay rejected: listen for a single user gesture to start audio
        const startOnGesture = () => {
          unmuteAndPlay();
          // remove listeners after first activation
          window.removeEventListener('pointerdown', startOnGesture);
          window.removeEventListener('touchstart', startOnGesture);
          window.removeEventListener('click', startOnGesture);
          window.removeEventListener('scroll', startOnGesture);
        };
        window.addEventListener('pointerdown', startOnGesture, { once: true });
        window.addEventListener('touchstart', startOnGesture, { once: true });
        window.addEventListener('click', startOnGesture, { once: true });
        window.addEventListener('scroll', startOnGesture, { once: true });
      });
    }
  });

  // Also ensure a fallback: if autoplay rejected and page never got a load gesture,
  // but user later clicks anywhere, start then (extra safety)
  const fallbackStart = () => {
    if (music.paused) {
      unmuteAndPlay();
    }
  };
  window.addEventListener('click', fallbackStart, { once: true });
  window.addEventListener('touchstart', fallbackStart, { once: true });
  window.addEventListener('touchend', fallbackStart, { once: true });
  window.addEventListener('touchmove', fallbackStart, { once: true });
  window.addEventListener('keydown', fallbackStart, { once: true });
  
  window.addEventListener('scroll', fallbackStart, { once: true });

  // Toggle button support (if present)
  if (toggle) {
    // reflect current state
    toggle.textContent = music.muted ? '🔇' : '🔊';
    toggle.setAttribute('aria-pressed', String(music.muted));

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (music.muted) {
        // unmute & play
        music.muted = false;
        music.play().catch(()=>{});
        toggle.textContent = '🔊';
        toggle.setAttribute('aria-pressed', 'false');
      } else {
        // mute
        try { music.pause(); } catch(e) { /* ignore */ }
        music.muted = true;
        toggle.textContent = '🔇';
        toggle.setAttribute('aria-pressed', 'true');
      }
    });
  }
})();
