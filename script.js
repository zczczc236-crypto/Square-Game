// ===============================
// NEON DODGE - MOBILE + DIFFICULTY
// ===============================

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

let player = {
  x: 150,
  y: 350,
  size: 30,
  speed: 6
};

let obstacles = [];

// ===============================
// 초기화
// ===============================

window.onload = function () {
  document.getElementById("loginScreen").style.display = "block";
  document.getElementById("menuScreen").style.display = "none";
  document.getElementById("gameCanvas").style.display = "none";

  const shop = document.getElementById("shopModal");
  if (shop) shop.classList.add("hidden");
};

// ===============================
// 로그인
// ===============================

function login() {
  const nameInput = document.getElementById("nameInput");
  if (!nameInput.value.trim()) return alert("닉네임 입력");

  playerName = nameInput.value.trim();

  const save = JSON.parse(localStorage.getItem("squareSave_" + playerName));

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

// ===============================
// 난이도 설정
// ===============================

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

  alert("난이도: " + mode.toUpperCase());
}

// ===============================
// 저장
// ===============================

function saveGame() {
  if (!playerName) return;

  const saveData = {
    coins: coins,
    highScore: highScore,
    skin: currentSkin
  };

  localStorage.setItem("squareSave_" + playerName, JSON.stringify(saveData));
}

function updateMenu() {
  document.getElementById("coinText").innerText = "코인: " + coins;
  document.getElementById("highScoreText").innerText = "최고점수: " + highScore;
}

// ===============================
// 게임 시작
// ===============================

function startGame() {
  document.getElementById("menuScreen").style.display = "none";
  canvas.style.display = "block";

  resetGame();
  gameRunning = true;
  requestAnimationFrame(gameLoop);
}

function resetGame() {
  score = 0;
  player.x = canvas.width / 2 - player.size / 2;
  obstacles = [];
}

// ===============================
// 게임 루프
// ===============================

function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPlayer();
  updateObstacles();
  drawObstacles();

  score += difficulty === "hard" ? 2 : 1;

  if (score > highScore) highScore = score;

  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 10, 20);

  requestAnimationFrame(gameLoop);
}

// ===============================
// 플레이어
// ===============================

function drawPlayer() {
  ctx.fillStyle = getSkinColor();
  ctx.fillRect(player.x, player.y, player.size, player.size);
}

function getSkinColor() {
  switch (currentSkin) {
    case "lime": return "lime";
    case "magenta": return "magenta";
    case "gold": return "gold";
    default: return "cyan";
  }
}

// ===============================
// 장애물
// ===============================

function updateObstacles() {
  if (Math.random() < spawnRate) {
    obstacles.push({
      x: Math.random() * (canvas.width - 30),
      y: -30,
      size: 30,
      speed: (4 + score * 0.002) * speedMultiplier
    });
  }

  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].y += obstacles[i].speed;

    if (collision(player, obstacles[i])) {
      endGame();
      return;
    }
  }

  obstacles = obstacles.filter(o => o.y < canvas.height);
}

function drawObstacles() {
  ctx.fillStyle = "red";
  obstacles.forEach(o => {
    ctx.fillRect(o.x, o.y, o.size, o.size);
  });
}

function collision(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.size > b.x &&
    a.y < b.y + b.size &&
    a.y + a.size > b.y
  );
}

// ===============================
// 게임 종료
// ===============================

function endGame() {
  gameRunning = false;
  canvas.style.display = "none";
  document.getElementById("menuScreen").style.display = "block";

  coins += Math.floor(score / 10);
  saveGame();
  updateMenu();
}

// ===============================
// PC 키보드 이동
// ===============================

document.addEventListener("keydown", e => {
  if (!gameRunning) return;

  if (e.key === "ArrowLeft") player.x -= player.speed;
  if (e.key === "ArrowRight") player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
});

// ===============================
// 📱 모바일 터치 이동
// ===============================

canvas.addEventListener("touchstart", moveTouch);
canvas.addEventListener("touchmove", moveTouch);

function moveTouch(e) {
  if (!gameRunning) return;

  let touchX = e.touches[0].clientX;
  let rect = canvas.getBoundingClientRect();
  let x = touchX - rect.left;

  player.x = x - player.size / 2;
  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
}

// ===============================
// 상점
// ===============================

function openShop() {
  document.getElementById("shopModal").classList.remove("hidden");
}

function closeShop() {
  document.getElementById("shopModal").classList.add("hidden");
}

function buySkin(type) {
  let cost = 0;

  if (type === "lime") cost = 100;
  if (type === "magenta") cost = 200;
  if (type === "gold") cost = 500;

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

// ===============================
// PWA 등록
// ===============================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .catch(err => console.log("SW 오류:", err));
  });
}
