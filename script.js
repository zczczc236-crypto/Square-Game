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
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

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

// =========================
// 강제 초기화 (캐시 문제 방지)
// =========================
window.onload = () => {
  document.getElementById("loginScreen").style.display = "block";
  document.getElementById("menuScreen").style.display = "none";
  document.getElementById("gameCanvas").style.display = "none";
  document.getElementById("shopModal").style.display = "none";
};

// =========================
// 로그인
// =========================
function login() {
  let input = document.getElementById("nameInput");
  if (!input.value.trim()) return alert("닉네임 입력");

  playerName = input.value.trim();

  let save = JSON.parse(localStorage.getItem("save_" + playerName));
  if (save) {
    coins = save.coins;
    highScore = save.highScore;
    currentSkin = save.skin;
  }

  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("menuScreen").style.display = "block";

  updateMenu();
  saveGame();
}

// =========================
// 저장
// =========================
function saveGame() {
  localStorage.setItem("save_" + playerName,
    JSON.stringify({ coins, highScore, skin: currentSkin })
  );
}

function updateMenu() {
  document.getElementById("coinText").innerText = "코인: " + coins;
  document.getElementById("highScoreText").innerText = "최고점수: " + highScore;
}

// =========================
// 난이도
// =========================
function setDifficulty(mode) {
  difficulty = mode;

  if (mode === "easy") {
    spawnRate = 0.02;
    speedMultiplier = 0.8;
  }
  if (mode === "normal") {
    spawnRate = 0.03;
    speedMultiplier = 1;
  }
  if (mode === "hard") {
    spawnRate = 0.05;
    speedMultiplier = 1.4;
  }

  alert("난이도: " + mode);
}

// =========================
// 게임 시작
// =========================
function startGame() {
  document.getElementById("menuScreen").style.display = "none";
  canvas.style.display = "block";

  score = 0;
  obstacles = [];
  player.x = 180;

  gameRunning = true;
  requestAnimationFrame(gameLoop);
}

// =========================
// 루프
// =========================
function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  drawPlayer();
  updateObstacles();
  drawObstacles();

  score++;
  if (score > highScore) highScore = score;

  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 10, 20);

  requestAnimationFrame(gameLoop);
}

// =========================
// 플레이어
// =========================
function drawPlayer() {
  ctx.fillStyle = getSkinColor();
  ctx.fillRect(player.x, player.y, player.size, player.size);
}

function getSkinColor() {
  if (currentSkin === "lime") return "lime";
  if (currentSkin === "magenta") return "magenta";
  if (currentSkin === "gold") return "gold";
  return "cyan";
}

// =========================
// 장애물
// =========================
function updateObstacles() {
  if (Math.random() < spawnRate) {
    obstacles.push({
      x: Math.random() * (canvas.width - 30),
      y: -30,
      size: 30,
      speed: (4 + score*0.002) * speedMultiplier
    });
  }

  for (let o of obstacles) {
    o.y += o.speed;

    if (collision(player,o)) {
      endGame();
      return;
    }
  }

  obstacles = obstacles.filter(o => o.y < canvas.height);
}

function drawObstacles() {
  ctx.fillStyle = "red";
  for (let o of obstacles) {
    ctx.fillRect(o.x,o.y,o.size,o.size);
  }
}

function collision(a,b){
  return (
    a.x < b.x+b.size &&
    a.x+a.size > b.x &&
    a.y < b.y+b.size &&
    a.y+a.size > b.y
  );
}

// =========================
// 종료
// =========================
function endGame(){
  gameRunning=false;
  canvas.style.display="none";
  document.getElementById("menuScreen").style.display="block";

  coins += Math.floor(score/10);
  saveGame();
  updateMenu();
}

// =========================
// 이동 (PC)
// =========================
document.addEventListener("keydown", e=>{
  if(!gameRunning) return;

  if(e.key==="ArrowLeft") player.x-=player.speed;
  if(e.key==="ArrowRight") player.x+=player.speed;

  player.x=Math.max(0,Math.min(canvas.width-player.size,player.x));
});

// =========================
// 모바일 터치
// =========================
canvas.addEventListener("touchmove", e=>{
  if(!gameRunning) return;

  let rect=canvas.getBoundingClientRect();
  let x=e.touches[0].clientX-rect.left;
  player.x=x-player.size/2;
});

// =========================
// 상점
// =========================
function openShop(){
  document.getElementById("shopModal").style.display="block";
}

function closeShop(){
  document.getElementById("shopModal").style.display="none";
}

function buySkin(type){
  let cost=0;
  if(type==="lime") cost=100;
  if(type==="blue") cost=150;
  if(type==="magenta") cost=200;
  if(type==="orange") cost=250;
  if(type==="cyan") cost=300;
  if(type==="red") cost=350;
  if(type==="purple") cost=400;
  if(type==="gold") cost=500;
  

  if(type!=="default" && coins<cost){
    alert("코인 부족");
    return;
  }

  if(type!=="default") coins-=cost;

  currentSkin=type;
  saveGame();
  updateMenu();
  closeShop();
}
