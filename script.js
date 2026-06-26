const treeButton = document.querySelector("#treeButton");
const startLayer = document.querySelector("#startLayer");
const dialog = document.querySelector("#dialog");
const reveal = document.querySelector("#reveal");
const confetti = document.querySelector("#confetti");

const firstBg = document.querySelector("#firstBg");
const lastBg = document.querySelector("#lastBg");
const dialogSound = document.querySelector("#dialogSound");
const lastSound = document.querySelector("#lastSound");

const dialogs = ["assets/dial-first.png", "assets/dial-second.png"];
const colors = ["#ff2f75", "#47ff89", "#ffe64d", "#38d7ff", "#ff7d2d", "#b14cff"];

let step = 0;
let busy = false;
let sceneStarted = false;
let firstMusicStarted = false;
let inputUnlocked = false;

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

async function playAudio(audio, volume = 1) {
  audio.volume = volume;
  try {
    audio.currentTime = 0;
    await audio.play();
  } catch {
    // Mobile browsers may wait for the next direct tap before allowing audio.
  }
}

function startScene() {
  if (sceneStarted) return;
  sceneStarted = true;
  window.setTimeout(() => treeButton.classList.add("visible"), 520);
}

async function startFirstMusic() {
  if (firstMusicStarted || !lastBg.paused) return;
  firstBg.volume = 0.7;

  try {
    await firstBg.play();
    firstMusicStarted = true;
    return true;
  } catch {
    // Browsers usually allow this after the first real tap.
    return false;
  }
}

async function unlockExperience() {
  startScene();
  const musicStarted = await startFirstMusic();
  inputUnlocked = true;
  startLayer.classList.add("hidden");
  return musicStarted;
}

async function showDialog(src) {
  busy = true;
  treeButton.disabled = true;
  dialog.src = src;
  dialog.className = "dialog show";
  await playAudio(dialogSound, 0.95);
  await wait(1000);
  dialog.className = "dialog hide";
  await wait(900);
  dialog.className = "dialog";
  dialog.removeAttribute("src");
  treeButton.disabled = false;
  busy = false;
}

function makeConfetti(originX, originY) {
  confetti.textContent = "";

  for (let index = 0; index < 74; index += 1) {
    const piece = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 250;
    const size = 6 + Math.random() * 10;

    piece.className = "piece";
    piece.style.setProperty("--x", `${originX}px`);
    piece.style.setProperty("--y", `${originY}px`);
    piece.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    piece.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    piece.style.setProperty("--size", `${size}px`);
    piece.style.setProperty("--angle", `${Math.random() * 180}deg`);
    piece.style.setProperty("--color", colors[index % colors.length]);
    piece.style.animationDelay = `${Math.random() * 120}ms`;
    confetti.append(piece);
  }

  window.setTimeout(() => {
    confetti.textContent = "";
  }, 1300);
}

async function finalReveal(event) {
  busy = true;
  treeButton.disabled = true;
  treeButton.classList.remove("visible");
  firstBg.pause();
  firstBg.currentTime = 0;
  await playAudio(lastBg, 0.78);
  await playAudio(lastSound, 1);
  makeConfetti(event.clientX || window.innerWidth / 2, event.clientY || window.innerHeight / 2);
  await wait(170);
  reveal.classList.add("show");
  reveal.setAttribute("aria-hidden", "false");
}

treeButton.addEventListener("click", async (event) => {
  startScene();
  if (!inputUnlocked) {
    await unlockExperience();
    return;
  }

  await startFirstMusic();
  if (busy) return;

  if (step < dialogs.length) {
    const dialogSrc = dialogs[step];
    step += 1;
    await showDialog(dialogSrc);
    return;
  }

  step += 1;
  await finalReveal(event);
});

startLayer.addEventListener("click", unlockExperience);

window.addEventListener("load", () => {
  startScene();
  startFirstMusic().then((musicStarted) => {
    if (musicStarted) {
      inputUnlocked = true;
      startLayer.classList.add("hidden");
    }
  });
});
