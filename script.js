// ===========================
//  ❗ 기본 DOM 요소 로딩
// ===========================
const loginScreen = document.getElementById("loginScreen");
const menuScreen = document.getElementById("menuScreen");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const shopModal = document.getElementById("shopModal");

const startBtn = document.getElementById("startBtn");
const gameStartBtn = document.getElementById("gameStartBtn");
const shopBtn = document.getElementById("shopBtn");
const closeShopBtn = document.getElementById("closeShopBtn");
const coinText = document.getElementById("coinText");
const highScoreText = document.getElementById("highScoreText");

// ===========================
//  ❗ 오디오 안전 재생 준비
// ===========================
let bgm, sfxScore, sfxBuy, sfxGameOver;
let audioReady = false;

function initAudio() {
  if (audioReady) return;

  bgm = new Audio("assets/audio/bgm.mp3");
  bgm.loop = true;
  bgm.volume = 0.4;

  sfxScore = new Audio("assets/audio/score.wav");
  sfxBuy = new Audio("assets/audio/buy.wav");
  sfxGameOver = new Audio("assets/audio/gameover.wav");

  bgm.play().then(() => {
    bgm.pause();
    bgm.currentTime = 0;
    audioReady = true;
    console.log("Audio unlocked!");
  }).catch(()=>{});

  document.removeEventListener("click", initAudio);
  document.removeEventListener("touchstart", initAudio);
}

document.addEventListener("click", initAudio, { once: true });
document.addEventListener("touchstart", initAudio, { once: true });

// ===========================
//  ❗ 게임 상태 변수
// ===========================
let score = 0;
let coins = 0;
let highScore = 0;
let difficulty = "normal";
let gameLoopId = null;

let unlockedSkins = ["default"];
let currentSkin = "default";

let player = { x: 180, y: 550, size: 30 };

// ===========================
//  ❗ 난이도와 배경
// ===========================
function setDifficulty(mode) {
  difficulty = mode;
  if (mode === "easy") document.body.style.background = "linear-gradient(#87CEEB,#fff)";
  if (mode === "normal") document.body.style.background = "linear-gradient(#333,#111)";
  if (mode === "hard") document.body.style.background = "linear-gradient(#200122,#6f0000)";
}

menuScreen.querySelectorAll("[data-diff]").forEach(btn => {
  btn.onclick = () => setDifficulty(btn.dataset.diff);
});

// ===========================
//  ❗ 로그인 처리
// ===========================
startBtn.onclick = function() {
  const nameInput = document.getElementById("nameInput");
  if (!nameInput.value.trim()) return alert("닉네임 입력");

  localStorage.setItem("nickname", nameInput.value.trim());

  loginScreen.classList.add("hidden");
  menuScreen.classList.remove("hidden");

  loadGame();
  updateMenu();
};

// ===========================
//  ❗ 게임 시작
// ===========================
gameStartBtn.onclick = function() {
  menuScreen.classList.add("hidden");
  canvas.style.display = "block";

  score = 0;
  if (audioReady) bgm.play().catch(() => {});
  gameLoop();
};

// ===========================
//  ❗ 게임 루프
// ===========================
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // player
  ctx.fillStyle = currentSkin;
  ctx.fillRect(player.x, player.y, player.size, player.size);

  score++;
  coins++;

  coinText.innerText = coins;
  highScoreText.innerText = highScore;

  if (audioReady && sfxScore && score % 50 === 0) {
    sfxScore.currentTime = 0;
    sfxScore.play().catch(()=>{});
  }

  gameLoopId = requestAnimationFrame(gameLoop);
}

// ===========================
//  ❗ 게임 종료
// ===========================
function endGame() {
  cancelAnimationFrame(gameLoopId);
  canvas.style.display = "none";
  menuScreen.classList.remove("hidden");

  if (audioReady && sfxGameOver) {
    sfxGameOver.play().catch(()=>{});
  }

  if (score > highScore) highScore = score;
  saveGame();
  updateMenu();
}

// ===========================
//  ❗ 상점 모달
// ===========================
shopBtn.onclick = function(){ shopModal.classList.remove("hidden"); };
closeShopBtn.onclick = function(){ shopModal.classList.add("hidden"); };

function buySkin(name, price) {
  if (unlockedSkins.includes(name)) {
    currentSkin = name;
    shopModal.classList.add("hidden");
    return;
  }
  if (coins >= price) {
    coins -= price;
    unlockedSkins.push(name);
    currentSkin = name;
    if (audioReady && sfxBuy) sfxBuy.play().catch(()=>{});
    saveGame();
    updateMenu();
    shopModal.classList.add("hidden");
  } else alert("코인 부족");
}

document.getElementById("skinList").innerHTML = `
<button onclick="buySkin('default', 0)">기본 (0)</button>
<button onclick="buySkin('lime', 100)">라임 (100)</button>
<button onclick="buySkin('magenta', 200)">마젠타 (200)</button>
<button onclick="buySkin('gold', 500)">골드 (500)</button>
<button onclick="buySkin('cyan', 300)">시안 (300)</button>
<button onclick="buySkin('orange', 250)">오렌지 (250)</button>
<button onclick="buySkin('purple', 400)">퍼플 (400)</button>
<button onclick="buySkin('red', 350)">레드 (350)</button>
<button onclick="buySkin('blue', 150)">블루 (150)</button>
`;

// ===========================
//  ❗ 저장
// ===========================
function saveGame() {
  localStorage.setItem("neonDodgeSave", JSON.stringify({
    coins, highScore, unlockedSkins, currentSkin, difficulty
  }));
}

function loadGame() {
  const data = JSON.parse(localStorage.getItem("neonDodgeSave"));
  if (!data) return;
  coins = data.coins || 0;
  highScore = data.highScore || 0;
  unlockedSkins = data.unlockedSkins || ["default"];
  currentSkin = data.currentSkin || "default";
  difficulty = data.difficulty || "normal";
  setDifficulty(difficulty);
}

function updateMenu() {
  coinText.innerText = coins;
  highScoreText.innerText = highScore;
}
