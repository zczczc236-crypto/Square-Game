// ==========================
// 오디오 세팅 & 잠금 해제
// ==========================
let bgm, sfxScore, sfxBuy, sfxGameOver;
let audioUnlocked = false;

function initAudio() {
  bgm = new Audio("assets/audio/bgm.mp3");
  bgm.loop = true;
  bgm.volume = 0.4;

  sfxScore = new Audio("assets/audio/score.wav");
  sfxBuy = new Audio("assets/audio/buy.wav");
  sfxGameOver = new Audio("assets/audio/gameover.wav");

  document.removeEventListener("click", initAudio);
  document.removeEventListener("touchstart", initAudio);

  audioUnlocked = true;
  console.log("🔊 Audio initialized");
}

document.addEventListener("click", initAudio, { once: true });
document.addEventListener("touchstart", initAudio, { once: true });

// ==========================
// 전역 게임 변수
// ==========================
let player;
let gameArea;
let score = 0;
let coins = 0;
let difficulty = "normal";
let gameLoopInterval;
let autoSaveInterval;

let unlockedSkins = ["default"];
let currentSkin = "default";

// ==========================
// 난이도 색상 + 속도
// ==========================
function applyDifficulty() {
  const body = document.body;
  if (difficulty === "easy") {
    body.style.background = "linear-gradient(to bottom, #87CEEB, #ffffff)";
  } else if (difficulty === "normal") {
    body.style.background = "linear-gradient(to bottom, #333, #111)";
  } else {
    body.style.background = "linear-gradient(to bottom, #200122, #6f0000)";
  }
}

// ==========================
// 로그인 / 닉네임
// ==========================
function login() {
  const nameInput = document.getElementById("nameInput");
  if (!nameInput.value.trim()) return alert("닉네임 입력!");

  localStorage.setItem("nickname", nameInput.value.trim());
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("menuScreen").style.display = "block";

  loadGame();
  updateMenu();
}

// ==========================
// 게임 시작
// ==========================
function startGame() {
  gameArea = document.getElementById("gameArea");
  player = document.getElementById("player");

  document.getElementById("menuScreen").style.display = "none";
  document.getElementById("gameArea").style.display = "block";

  score = 0;
  applyDifficulty();

  if (audioUnlocked) bgm.play().catch(() => {});

  gameLoopInterval = setInterval(gameLoop, 100);
  autoSaveInterval = setInterval(saveGame, 5000);
}

// ==========================
// 게임 루프
// ==========================
function gameLoop() {
  score++;
  coins++;

  document.getElementById("score").innerText = score;
  document.getElementById("coins").innerText = coins;

  if (score % 50 === 0 && sfxScore) {
    sfxScore.currentTime = 0;
    sfxScore.play().catch(() => {});
  }

  if (score >= 1000 && difficulty === "hard") {
    endGame();
  }
}

// ==========================
// 게임 종료
// ==========================
function endGame() {
  clearInterval(gameLoopInterval);
  clearInterval(autoSaveInterval);

  if (sfxGameOver) {
    sfxGameOver.currentTime = 0;
    sfxGameOver.play().catch(() => {});
  }

  alert("💥 게임 오버!");
  document.getElementById("gameArea").style.display = "none";
  document.getElementById("menuScreen").style.display = "block";
  saveGame();
  updateMenu();
}

// ==========================
// 상점
// ==========================
function openShop() {
  document.getElementById("shopModal").classList.remove("hidden");
}

function closeShop() {
  document.getElementById("shopModal").classList.add("hidden");
}

const skinPrices = {
  default: 0,
  lime: 100,
  magenta: 200,
  gold: 500,
  cyan: 300,
  orange: 250,
  purple: 400,
  red: 350,
  blue: 150
};

function buySkin(name) {
  if (unlockedSkins.includes(name)) {
    currentSkin = name;
    applySkin();
    closeShop();
    return;
  }

  if (coins >= skinPrices[name]) {
    coins -= skinPrices[name];
    unlockedSkins.push(name);
    currentSkin = name;
    if (sfxBuy) {
      sfxBuy.currentTime = 0;
      sfxBuy.play().catch(() => {});
    }
    applySkin();
    saveGame();
    updateMenu();
    closeShop();
  } else {
    alert("코인 부족");
  }
}

function applySkin() {
  player.style.background = currentSkin;
}

// ==========================
// 자동 저장
// ==========================
function saveGame() {
  const saveData = {
    score,
    coins,
    difficulty,
    unlockedSkins,
    currentSkin
  };
  localStorage.setItem("neonDodgeSave", JSON.stringify(saveData));
}

function loadGame() {
  const data = JSON.parse(localStorage.getItem("neonDodgeSave"));
  if (!data) return;

  score = data.score || 0;
  coins = data.coins || 0;
  difficulty = data.difficulty || "normal";
  unlockedSkins = data.unlockedSkins || ["default"];
  currentSkin = data.currentSkin || "default";

  document.getElementById("score").innerText = score;
  document.getElementById("coins").innerText = coins;
  applySkin();
}

// ==========================
// 메뉴 UI
// ==========================
function updateMenu() {
  document.getElementById("coinText").innerText = coins;
  document.getElementById("highScoreText").innerText = score;
}

// ==========================
// 모바일 터치 이동
// ==========================
function movePlayerTo(x) {
  if (!player) return;
  const rect = gameArea.getBoundingClientRect();
  let newX = x - rect.left - player.offsetWidth / 2;
  newX = Math.max(0, Math.min(rect.width - player.offsetWidth, newX));
  player.style.left = newX + "px";
}

document.getElementById("gameArea").addEventListener("touchmove", (e) => {
  movePlayerTo(e.touches[0].clientX);
});

document.getElementById("gameArea").addEventListener("mousedown", (e) => {
  movePlayerTo(e.clientX);
});
