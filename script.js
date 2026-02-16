// ==========================
// 전역 변수
// ==========================
let player;
let score = 0;
let coins = 0;
let difficulty = "normal";
let speed = 5;
let gameInterval;
let autoSaveInterval;
let unlockedSkins = ["default"];
let currentSkin = "default";

// ==========================
// 오디오
// ==========================
let bgm;
let scoreSound;
let gameoverSound;
let buySound;

function initAudio() {
  bgm = new Audio("assets/audio/bgm.mp3");
  bgm.loop = true;
  bgm.volume = 0.4;

  scoreSound = new Audio("assets/audio/score.wav");
  gameoverSound = new Audio("assets/audio/gameover.wav");
  buySound = new Audio("assets/audio/buy.wav");

  document.removeEventListener("click", initAudio);
}

// ==========================
// 시작시 실행
// ==========================
window.onload = () => {
  loadGame();
  document.getElementById("nicknameModal").classList.remove("hidden");
  document.addEventListener("click", initAudio, { once: true });
};

// ==========================
// 닉네임 시작
// ==========================
function startWithNickname() {
  const nickname = document.getElementById("nicknameInput").value;
  if (!nickname) return alert("닉네임 입력");

  localStorage.setItem("nickname", nickname);
  document.getElementById("nicknameModal").classList.add("hidden");

  startGame();
}

// ==========================
// 게임 시작
// ==========================
function startGame() {
  player = document.getElementById("player");

  if (bgm) bgm.play().catch(()=>{});

  applyDifficulty();

  gameInterval = setInterval(gameLoop, 100);
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

  if (score % 50 === 0 && scoreSound) {
    scoreSound.currentTime = 0;
    scoreSound.play().catch(()=>{});
  }

  if (score >= 1000) {
    gameOver();
  }
}

// ==========================
// 게임오버
// ==========================
function gameOver() {
  clearInterval(gameInterval);
  clearInterval(autoSaveInterval);

  if (gameoverSound) gameoverSound.play().catch(()=>{});

  alert("게임 오버!");
}

// ==========================
// 난이도 설정
// ==========================
function setDifficulty(mode) {
  difficulty = mode;
  applyDifficulty();
}

function applyDifficulty() {
  const game = document.getElementById("game");

  if (difficulty === "easy") {
    speed = 3;
    game.style.background = "linear-gradient(to bottom, #1e3c72, #2a5298)";
  } else if (difficulty === "normal") {
    speed = 5;
    game.style.background = "linear-gradient(to bottom, #000000, #434343)";
  } else {
    speed = 8;
    game.style.background = "linear-gradient(to bottom, #200122, #6f0000)";
  }
}

// ==========================
// 상점 열기/닫기
// ==========================
function openShop() {
  document.getElementById("shopModal").classList.remove("hidden");
}

function closeShop() {
  document.getElementById("shopModal").classList.add("hidden");
}

// ==========================
// 스킨 구매
// ==========================
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
    return;
  }

  if (coins >= skinPrices[name]) {
    coins -= skinPrices[name];
    unlockedSkins.push(name);
    currentSkin = name;

    if (buySound) buySound.play().catch(()=>{});

    applySkin();
    saveGame();
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
  const data = {
    score,
    coins,
    difficulty,
    unlockedSkins,
    currentSkin
  };

  localStorage.setItem("gameSave", JSON.stringify(data));
}

function loadGame() {
  const save = localStorage.getItem("gameSave");
  if (!save) return;

  const data = JSON.parse(save);

  score = data.score || 0;
  coins = data.coins || 0;
  difficulty = data.difficulty || "normal";
  unlockedSkins = data.unlockedSkins || ["default"];
  currentSkin = data.currentSkin || "default";

  document.getElementById("score").innerText = score;
  document.getElementById("coins").innerText = coins;
}

// ==========================
// 키보드 이동
// ==========================
document.addEventListener("keydown", (e) => {
  if (!player) return;

  const left = player.offsetLeft;

  if (e.key === "ArrowLeft" && left > 0) {
    player.style.left = left - speed + "px";
  }

  if (e.key === "ArrowRight" && left < 350) {
    player.style.left = left + speed + "px";
  }
});

// ==========================
// 모바일 터치 이동
// ==========================
const gameArea = document.getElementById("game");

function movePlayerTo(x) {
  if (!player) return;

  const rect = gameArea.getBoundingClientRect();
  let newX = x - rect.left - (player.offsetWidth / 2);

  if (newX < 0) newX = 0;
  if (newX > rect.width - player.offsetWidth)
    newX = rect.width - player.offsetWidth;

  player.style.left = newX + "px";
}

// 터치 시작
gameArea.addEventListener("touchstart", (e) => {
  movePlayerTo(e.touches[0].clientX);
});

// 터치 드래그
gameArea.addEventListener("touchmove", (e) => {
  movePlayerTo(e.touches[0].clientX);
});

// 마우스 클릭도 지원
gameArea.addEventListener("mousedown", (e) => {
  movePlayerTo(e.clientX);
});

