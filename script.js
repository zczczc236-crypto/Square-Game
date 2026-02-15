// =========================
// ▶ 게임/로그인 데이터
// =========================
let username = "";
let coins = 0;
let highScore = 0;
let currentSkin = "cyan";
let ownedSkins = ["cyan"];

let score = 0;
let gameRunning = false;
let speed = 3;

// =========================
// ▶ UI DOM 가져오기
// =========================
const loginScreen = document.getElementById("loginScreen");
const mainUI = document.getElementById("mainUI");
const welcomeText = document.getElementById("welcomeText");
const coinsText = document.getElementById("coins");
const highScoreText = document.getElementById("highScore");

const player = document.getElementById("player");
const gameArea = document.getElementById("gameArea");

const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");

// =========================
// ▶ 로컬 저장/불러오기
// =========================
function saveData() {
  localStorage.setItem(
    "neonDodgeData",
    JSON.stringify({
      username,
      coins,
      highScore,
      currentSkin,
      ownedSkins,
    })
  );
}

function loadData() {
  const data = JSON.parse(localStorage.getItem("neonDodgeData"));
  if (data) {
    username = data.username;
    coins = data.coins;
    highScore = data.highScore;
    currentSkin = data.currentSkin;
    ownedSkins = data.ownedSkins;
  }
}

// =========================
// ▶ 로그인 처리
// =========================
function login() {
  const input = document.getElementById("usernameInput").value.trim();
  if (!input) return alert("닉네임을 입력하세요.");

  loadData();  
  username = input;

  welcomeText.innerText = `${username} 님!`;
  coinsText.innerText = coins;
  highScoreText.innerText = highScore;

  player.style.background = currentSkin;

  loginScreen.classList.add("hidden");
  mainUI.classList.remove("hidden");

  saveData();
}

// =========================
// ▶ 게임 시작
// =========================
function startGame() {
  score = 0;
  speed = 3;
  gameRunning = true;

  updateScoreDisplay();
  hideGameOver();
  gameLoop();
}

// =========================
// ▶ 메인 게임 루프
// =========================
function gameLoop() {
  if (!gameRunning) return;

  score++;
  if (score % 150 === 0) speed += 0.5;

  if (Math.random() < 0.03) createEnemy();
  updateScoreDisplay();

  requestAnimationFrame(gameLoop);
}

function updateScoreDisplay() {
  document.getElementById("score").innerText = score;
}

// =========================
// ▶ 적 생성/이동
// =========================
function createEnemy() {
  const enemy = document.createElement("div");
  enemy.classList.add("enemy");

  enemy.style.left = Math.random() * (gameArea.clientWidth - 40) + "px";
  enemy.style.top = "0px";

  gameArea.appendChild(enemy);

  function move() {
    if (!gameRunning) return;

    enemy.style.top = parseFloat(enemy.style.top) + speed + "px";

    if (parseFloat(enemy.style.top) > gameArea.clientHeight - 40) {
      enemy.remove();
      return;
    }

    if (checkCollision(enemy)) {
      enemy.remove();
      endGame();
      return;
    }

    requestAnimationFrame(move);
  }
  requestAnimationFrame(move);
}

function checkCollision(enemy) {
  const p = player.getBoundingClientRect();
  const e = enemy.getBoundingClientRect();

  return !(
    p.right < e.left ||
    p.left > e.right ||
    p.bottom < e.top ||
    p.top > e.bottom
  );
}

// =========================
// ▶ 게임 종료 처리
// =========================
function endGame() {
  gameRunning = false;

  coins += Math.floor(score / 10);
  if (score > highScore) highScore = score;

  coinsText.innerText = coins;
  highScoreText.innerText = highScore;
  finalScore.innerText = `점수: ${score}`;

  saveData();
  showGameOver();
}

// =========================
// ▶ 상점열기/닫기
// =========================
function openShop() {
  document.getElementById("shopModal").classList.remove("hidden");
}

function closeShop() {
  document.getElementById("shopModal").classList.add("hidden");
}

// =========================
// ▶ 스킨 구매/적용
// =========================
function buySkin(color) {
  let price = 0;
  if (color === "lime") price = 100;
  if (color === "magenta") price = 200;
  if (color === "gold") price = 500;

  if (ownedSkins.includes(color)) {
    currentSkin = color;
  } else {
    if (coins < price) {
      alert("코인이 부족합니다!");
      return;
    }
    coins -= price;
    ownedSkins.push(color);
    currentSkin = color;
  }

  player.style.background = currentSkin;
  coinsText.innerText = coins;

  saveData();
  closeShop();
}

// =========================
// ▶ UI 표시/숨김
// =========================
function showGameOver() {
  gameOverScreen.classList.remove("hidden");
}

function hideGameOver() {
  gameOverScreen.classList.add("hidden");
}

// =========================
// ▶ 플레이어 이동 (마우스 + 터치)
// =========================
gameArea.addEventListener("mousemove", (e) => {
  const rect = gameArea.getBoundingClientRect();
  let x = e.clientX - rect.left - 20;
  x = Math.max(0, Math.min(x, gameArea.clientWidth - 40));
  player.style.left = x + "px";
});

gameArea.addEventListener("touchmove", (e) => {
  const rect = gameArea.getBoundingClientRect();
  let x = e.touches[0].clientX - rect.left - 20;
  x = Math.max(0, Math.min(x, gameArea.clientWidth - 40));
  player.style.left = x + "px";
});

// =========================
// ▶ PWA 서비스워커 등록
// =========================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
