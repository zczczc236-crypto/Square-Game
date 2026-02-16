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
const nameInput = document.getElementById("nameInput");

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
  }).catch(() => {});

  document.removeEventListener("click", initAudio);
  document.removeEventListener("touchstart", initAudio);
}

document.addEventListener("click", initAudio, { once: true });
document.addEventListener("touchstart", initAudio, { once: true });

// ===========================
//  ❗ 게임 데이터
// ===========================
let playerName = "";
let coins = 0;
let highScore = 0;
let currentSkin = "default";

let gameRunning = false;
let score = 0;

let difficulty = "normal";
let spawnRate = 0.03;
let speedMultiplier = 1;

let player = { x: 180, y: 550, size: 30, speed: 6 };
let obstacles = [];

// ===========================
//  ❗ 초기 화면 설정
// ===========================
window.onload = () => {
  loginScreen.style.display = "block";
  menuScreen.style.display = "none";
  canvas.style.display = "none";
  shopModal.style.display = "none";
};

// ===========================
//  ❗ 로그인
// ===========================
function login() {
  if (!nameInput.value.trim()) return alert("닉네임 입력");

  playerName = nameInput.value.trim();

  let save = JSON.parse(localStorage.getItem("save_" + playerName));
  if (save) {
    coins = save.coins || 0;
    highScore = save.highScore || 0;
    currentSkin = save.skin || "default";
  }

  loginScreen.style.display = "none";
  menuScreen.style.display = "block";

  updateMenu();
  saveGame();
}

// ===========================
//  ❗ 저장
// ===========================
function saveGame() {
  if (!playerName) return;
  localStorage.setItem("save_" + playerName, JSON.stringify({
    coins,
    highScore,
    skin: currentSkin
  }));
}

function updateMenu() {
  coinText.innerText = "코인: " + coins;
  highScoreText.innerText = "최고점수: " + highScore;
}

// ===========================
//  ❗ 난이도 설정
// ===========================
function setDifficulty(mode) {
  difficulty = mode;

  switch(mode) {
    case "easy":
      spawnRate = 0.02;
      speedMultiplier = 0.8;
      break;
    case "normal":
      spawnRate = 0.03;
      speedMultiplier = 1;
      break;
    case "hard":
      spawnRate = 0.05;
      speedMultiplier = 1.4;
      break;
  }

  alert("난이도: " + mode);
}

// ===========================
//  ❗ 게임 시작
// ===========================
function startGame() {
  menuScreen.style.display = "none";
  canvas.style.display = "block";

  score = 0;
  obstacles = [];
  player.x = canvas.width / 2 - player.size / 2;

  gameRunning = true;
  requestAnimationFrame(gameLoop);
}

// ===========================
//  ❗ 게임 루프
// ===========================
function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPlayer();
  updateObstacles();
  drawObstacles();

  score++;
  if (score > highScore) highScore = score;

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 25);

  requestAnimationFrame(gameLoop);
}

// ===========================
//  ❗ 플레이어 그리기
// ===========================
function drawPlayer() {
  ctx.fillStyle = getSkinColor();
  ctx.fillRect(player.x, player.y, player.size, player.size);
}

function getSkinColor() {
  switch(currentSkin) {
    case "lime": return "lime";
    case "magenta": return "magenta";
    case "gold": return "gold";
    default: return "cyan";
  }
}

// ===========================
//  ❗ 장애물
// ===========================
function updateObstacles() {
  if (Math.random() < spawnRate) {
    obstacles.push({
      x: Math.random() * (canvas.width - 30),
      y: -30,
      size: 30,
      speed: (4 + score * 0.002) * speedMultiplier
    });
  }

  for (let o of obstacles) {
    o.y += o.speed;

    if (collision(player, o)) {
      endGame();
      return;
    }
  }

  obstacles = obstacles.filter(o => o.y < canvas.height);
}

function drawObstacles() {
  ctx.fillStyle = "red";
  obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.size, o.size));
}

function collision(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.size > b.x &&
    a.y < b.y + b.size &&
    a.y + a.size > b.y
  );
}

// ===========================
//  ❗ 게임 종료
// ===========================
function endGame() {
  gameRunning = false;
  canvas.style.display = "none";
  menuScreen.style.display = "block";

  coins += Math.floor(score / 10);
  saveGame();
  updateMenu();
}

// ===========================
//  ❗ 이동 (PC)
– ===========================
document.addEventListener("keydown", e => {
  if (!gameRunning) return;

  if (e.key === "ArrowLeft") player.x -= player.speed;
  if (e.key === "ArrowRight") player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
});

// ===========================
//  ❗ 이동 (모바일 터치)
– ===========================
canvas.addEventListener("touchmove", e => {
  if (!gameRunning) return;

  let rect = canvas.getBoundingClientRect();
  let x = e.touches[0].clientX - rect.left;
  player.x = x - player.size / 2;
});

// ===========================
//  ❗ 상점
// ===========================
function openShop() {
  shopModal.style.display = "block";
}

function closeShop() {
  shopModal.style.display = "none";
}

function buySkin(type) {
  let costMap = {
    lime: 100,
    blue: 150,
    magenta: 200,
    orange: 250,
    cyan: 300,
    red: 350,
    purple: 400,
    gold: 500
  };
  
  let cost = costMap[type] || 0;

  if (type !== "default" && coins < cost) {
    alert("코인 부족");
    return;
  }

  if (type !== "default") coins -= cost;

  currentSkin = type;
  saveGame();
  updateMenu();
  closeShop();
}

// ===========================
//  ❗ 버튼 이벤트 연결
// ===========================
gameStartBtn.addEventListener("click", startGame);
shopBtn.addEventListener("click", openShop);
closeShopBtn.addEventListener("click", closeShop);
startBtn.addEventListener("click", login);
