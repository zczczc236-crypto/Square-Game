// ==========================
// 전역 변수
// ==========================
let player;
let score = 0;
let coins = 0;
let difficulty = "normal";
let gameInterval;
let autoSaveInterval;

let skins = {
  default: { price: 0, color: "white" },
  lime: { price: 100, color: "lime" },
  magenta: { price: 200, color: "magenta" },
  gold: { price: 500, color: "gold" },
  cyan: { price: 300, color: "cyan" },
  red: { price: 300, color: "red" },
  purple: { price: 400, color: "purple" },
  rainbow: { price: 800, color: "linear-gradient(45deg, red, orange, yellow, green, blue)" }
};

let ownedSkins = ["default"];
let currentSkin = "default";

// ==========================
// 오디오
// ==========================
const bgm = new Audio("assets/audio/bgm.mp3");
bgm.loop = true;
bgm.volume = 0.4;

const scoreSound = new Audio("assets/audio/score.wav");
const gameoverSound = new Audio("assets/audio/gameover.wav");
const buySound = new Audio("assets/audio/buy.wav");

// ==========================
// 시작
// ==========================
window.onload = () => {
  loadGame();
  document.getElementById("nicknameModal").classList.remove("hidden");
};

// ==========================
// 닉네임 설정
// ==========================
function setNickname() {
  const name = document.getElementById("nicknameInput").value;
  if (!name) return alert("닉네임 입력해라");
  localStorage.setItem("nickname", name);
  document.getElementById("nicknameModal").classList.add("hidden");
  startGame();
}

// ==========================
// 게임 시작
// ==========================
function startGame() {
  player = document.getElementById("player");
  bgm.play();
  applyDifficulty();
  gameInterval = setInterval(gameLoop, 100);
  autoSaveInterval = setInterval(saveGame, 5000);
}

// ==========================
// 난이도 설정
// ==========================
function setDifficulty(level) {
  difficulty = level;
  applyDifficulty();
}

function applyDifficulty() {
  const body = document.body;

  if (difficulty === "easy") {
    body.style.background = "linear-gradient(#87CEEB, #ffffff)";
  } else if (difficulty === "normal") {
    body.style.background = "linear-gradient(#333, #111)";
  } else {
    body.style.background = "linear-gradient(#300000, #000000)";
  }
}

// ==========================
// 게임 루프
// ==========================
function gameLoop() {
  score++;
  coins += 1;
  document.getElementById("score").innerText = score;
  document.getElementById("coins").innerText = coins;

  if (score % 50 === 0) {
    scoreSound.play();
  }

  if (difficulty === "hard" && score > 500) {
    gameOver();
  }
}

// ==========================
// 게임오버
// ==========================
function gameOver() {
  clearInterval(gameInterval);
  clearInterval(autoSaveInterval);
  gameoverSound.play();
  saveGame();
  alert("게임 오버!");
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

function buySkin(name) {
  if (ownedSkins.includes(name)) {
    currentSkin = name;
    applySkin();
    closeShop();
    return;
  }

  if (coins >= skins[name].price) {
    coins -= skins[name].price;
    ownedSkins.push(name);
    currentSkin = name;
    buySound.play();
    applySkin();
    closeShop();
  } else {
    alert("코인 부족");
  }
}

function applySkin() {
  if (skins[currentSkin].color.includes("linear-gradient")) {
    player.style.background = skins[currentSkin].color;
  } else {
    player.style.background = skins[currentSkin].color;
  }
}

// ==========================
// 저장 / 불러오기
// ==========================
function saveGame() {
  localStorage.setItem("coins", coins);
  localStorage.setItem("ownedSkins", JSON.stringify(ownedSkins));
  localStorage.setItem("currentSkin", currentSkin);
  localStorage.setItem("difficulty", difficulty);
}

function loadGame() {
  coins = parseInt(localStorage.getItem("coins")) || 0;
  ownedSkins = JSON.parse(localStorage.getItem("ownedSkins")) || ["default"];
  currentSkin = localStorage.getItem("currentSkin") || "default";
  difficulty = localStorage.getItem("difficulty") || "normal";
}

// ==========================
// 초기 UI 업데이트
// ==========================
setInterval(() => {
  document.getElementById("coins").innerText = coins;
}, 500);
