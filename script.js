/* =========================
   NEON SQUARE GAME - FULL
   로그인(오프라인) + 자동저장
   스킨상점 + 점수저장
   ========================= */

/* =========================
   기본 상태
   ========================= */

let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let player = {
  x: 180,
  y: 180,
  size: 30,
  color: "cyan"
};

let obstacles = [];
let score = 0;
let coins = 0;
let gameOver = false;
let gameStarted = false;
let playerName = "";

/* =========================
   로컬 저장
   ========================= */

function saveGame() {
  localStorage.setItem("squareSave", JSON.stringify({
    coins,
    selectedSkin: player.color,
    name: playerName
  }));
}

function loadGame() {
  let data = JSON.parse(localStorage.getItem("squareSave"));
  if (data) {
    coins = data.coins || 0;
    player.color = data.selectedSkin || "cyan";
    playerName = data.name || "";
    document.getElementById("playerName").value = playerName;
  }
}

/* =========================
   로그인
   ========================= */

function login() {
  let input = document.getElementById("playerName").value.trim();
  if (!input) return alert("이름 입력");

  playerName = input;
  localStorage.setItem("squareUser", playerName);
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("mainMenu").style.display = "block";
  saveGame();
}

window.onload = function () {
  loadGame();
  let savedUser = localStorage.getItem("squareUser");
  if (savedUser) {
    playerName = savedUser;
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("mainMenu").style.display = "block";
  }
};

/* =========================
   게임 시작
   ========================= */

function startGame() {
  score = 0;
  obstacles = [];
  gameOver = false;
  gameStarted = true;
  document.getElementById("mainMenu").style.display = "none";
  requestAnimationFrame(update);
}

function endGame() {
  gameOver = true;
  gameStarted = false;
  coins += Math.floor(score / 10);
  saveGame();
  alert("게임오버\n점수: " + score);
  document.getElementById("mainMenu").style.display = "block";
}

/* =========================
   입력
   ========================= */

document.addEventListener("keydown", (e) => {
  if (!gameStarted) return;

  if (e.key === "ArrowUp") player.y -= 20;
  if (e.key === "ArrowDown") player.y += 20;
  if (e.key === "ArrowLeft") player.x -= 20;
  if (e.key === "ArrowRight") player.x += 20;
});

/* =========================
   장애물 생성
   ========================= */

function spawnObstacle() {
  obstacles.push({
    x: Math.random() * (canvas.width - 20),
    y: -20,
    size: 20,
    speed: 2 + Math.random() * 3
  });
}

/* =========================
   충돌 체크
   ========================= */

function checkCollision(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.size > b.x &&
    a.y < b.y + b.size &&
    a.y + a.size > b.y
  );
}

/* =========================
   업데이트 루프
   ========================= */

function update() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 플레이어
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // 장애물
  if (Math.random() < 0.02) spawnObstacle();

  obstacles.forEach((obs, index) => {
    obs.y += obs.speed;
    ctx.fillStyle = "red";
    ctx.fillRect(obs.x, obs.y, obs.size, obs.size);

    if (checkCollision(player, obs)) {
      endGame();
    }

    if (obs.y > canvas.height) {
      obstacles.splice(index, 1);
      score++;
    }
  });

  // 점수 표시
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Score: " + score, 10, 20);
  ctx.fillText("Coins: " + coins, 10, 40);

  requestAnimationFrame(update);
}

/* =========================
   상점
   ========================= */

function openShop() {
  document.getElementById("shopModal").classList.remove("hidden");
}

function closeShop() {
  document.getElementById("shopModal").classList.add("hidden");
}

function buySkin(type) {
  if (type === "default") {
    player.color = "cyan";
  }

  if (type === "lime" && coins >= 100) {
    coins -= 100;
    player.color = "lime";
  }

  if (type === "magenta" && coins >= 200) {
    coins -= 200;
    player.color = "magenta";
  }

  if (type === "gold" && coins >= 500) {
    coins -= 500;
    player.color = "gold";
  }

  saveGame();
  closeShop();
}

/* =========================
   PWA 등록
   ========================= */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js");
}
