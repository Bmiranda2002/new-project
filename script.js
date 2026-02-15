const counterElement = document.querySelector("#counter");
const yearElement = document.querySelector("#year");
const toggleButton = document.querySelector("#sound-toggle");
const playlistInput = document.querySelector("#playlist-input");
const playlistButton = document.querySelector("#load-playlist");
const playlistFrame = document.querySelector("#playlist-frame");

const visitCount = Number(localStorage.getItem("visitCount") || "0") + 1;
localStorage.setItem("visitCount", String(visitCount));

if (counterElement) {
  counterElement.textContent = String(visitCount).padStart(6, "0");
}

if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}

let synthEnabled = false;

if (toggleButton) {
  toggleButton.addEventListener("click", () => {
    synthEnabled = !synthEnabled;
    document.body.classList.toggle("hyper", synthEnabled);
    toggleButton.textContent = synthEnabled ? "synth mode: ON" : "toggle synth mode";
  });
}

function extractPlaylistId(value) {
  if (!value) return "";

  const raw = value.trim();

  if (!raw) return "";

  if (!raw.includes("http")) {
    return raw;
  }

  try {
    const url = new URL(raw);
    return url.searchParams.get("list") || "";
  } catch {
    return "";
  }
}

if (playlistButton && playlistInput && playlistFrame) {
  playlistButton.addEventListener("click", () => {
    const playlistId = extractPlaylistId(playlistInput.value);

    if (!playlistId) {
      playlistInput.focus();
      return;
    }

    playlistFrame.src = `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}`;
  });
}
