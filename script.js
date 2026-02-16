// ===============================
// NEON DODGE - CLEAN START VERSION
// ===============================

let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let playerName = "";
let coins = 0;
let highScore = 0;
let currentSkin = "default";

let gameRunning = false;
let score = 0;

let player = {
  x: 150,
  y: 350,
  size: 30,
  speed: 6
};

let obstacles = [];

// ===============================
// 🔥 페이지 로드시 강제 초기화
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
  if (!nameInput.value.trim()) {
    alert("닉네임 입력");
    return;
  }

  playerName = nameInput.value.trim();

  const save = JSON.parse(localStorage.getItem("squareSave_" + playerName));

  if (save) {
    coins = save.coins;
    highScore = save.highScore;
    currentSkin = save.skin;
  } else {
    coins = 0;
    highScore = 0;
    currentSkin = "default";
  }

  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("menuScreen").style.display = "block";

  updateMenu();
  saveGame();
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

// ===============================
// 메뉴
// ===============================

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

  score++;
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
  if (Math.random() < 0.03) {
    obstacles.push({
      x: Math.random() * (canvas.width - 30),
      y: -30,
      size: 30,
      speed: 4 + score * 0.002
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
// 키보드 이동
// ===============================

document.addEventListener("keydown", e => {
  if (!gameRunning) return;

  if (e.key === "ArrowLeft") player.x -= player.speed;
  if (e.key === "ArrowRight") player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
});

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
