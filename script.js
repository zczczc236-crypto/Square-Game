// ==========================
// 오디오 세팅 (GitHub Pages 안전버전)
// ==========================
let bgm = new Audio("assets/audio/bgm.mp3");
let sfxScore = new Audio("assets/audio/score.wav");
let sfxBuy = new Audio("assets/audio/buy.wav");
let sfxGameOver = new Audio("assets/audio/gameover.wav");

bgm.loop = true;
bgm.volume = 0.4;

function unlockAudio() {
  bgm.play().then(() => {
    bgm.pause();
    bgm.currentTime = 0;
  }).catch(()=>{});
}

document.addEventListener("click", unlockAudio, { once: true });
document.addEventListener("touchstart", unlockAudio, { once: true });

// ==========================
// 🎮 기본 변수
// ==========================
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let score = 0;
let coins = 0;
let difficulty = "normal";
let gameInterval;

let unlockedSkins = ["default"];
let currentSkin = "default";

let player = {
  x: 180,
  y: 500,
  size: 20,
  color: "cyan"
};

// ==========================
// 🎨 난이도 배경
// ==========================
function applyDifficulty() {
  if (difficulty === "easy") {
    document.body.style.background = "linear-gradient(#87CEEB, #ffffff)";
  } else if (difficulty === "hard") {
    document.body.style.background = "linear-gradient(#200122, #6f0000)";
  } else {
    document.body.style.background = "linear-gradient(#111, #333)";
  }
}

// ==========================
// 로그인
// ==========================
document.getElementById("startBtn").addEventListener("click", () => {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) return alert("닉네임 입력!");

  localStorage.setItem("nickname", name);
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("menuScreen").style.display = "block";

  loadGame();
  updateMenu();
});

// ==========================
// 게임 시작
// ==========================
document.getElementById("gameStartBtn").addEventListener("click", () => {
  document.getElementById("menuScreen").style.display = "none";
  canvas.style.display = "block";

  score = 0;
  applyDifficulty();

  if (audioReady) bgm.play().catch(()=>{});

  gameInterval = setInterval(gameLoop, 100);
});

// ==========================
// 게임 루프
// ==========================
function gameLoop() {
  score++;
  coins++;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = currentSkin;
  ctx.fillRect(player.x, player.y, player.size, player.size);

  if (score % 50 === 0 && sfxScore) {
    sfxScore.currentTime = 0;
    sfxScore.play().catch(()=>{});
  }

  updateMenu();
  saveGame();
}

// ==========================
// 상점
// ==========================
document.getElementById("shopOpenBtn").addEventListener("click", () => {
  document.getElementById("shopModal").style.display = "flex";
});

document.getElementById("closeShopBtn").addEventListener("click", () => {
  document.getElementById("shopModal").style.display = "none";
});

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

document.querySelectorAll(".skinBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    const name = btn.dataset.skin;

    if (unlockedSkins.includes(name)) {
      currentSkin = name;
      return;
    }

    if (coins >= skinPrices[name]) {
      coins -= skinPrices[name];
      unlockedSkins.push(name);
      currentSkin = name;

      if (sfxBuy) {
        sfxBuy.currentTime = 0;
        sfxBuy.play().catch(()=>{});
      }

      saveGame();
      updateMenu();
    } else {
      alert("코인 부족");
    }
  });
});

// ==========================
// 난이도 버튼
// ==========================
document.querySelectorAll(".diffBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    difficulty = btn.dataset.diff;
    applyDifficulty();
    saveGame();
  });
});

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
  localStorage.setItem("neonDodgeSave", JSON.stringify(data));
}

function loadGame() {
  const data = JSON.parse(localStorage.getItem("neonDodgeSave"));
  if (!data) return;

  score = data.score || 0;
  coins = data.coins || 0;
  difficulty = data.difficulty || "normal";
  unlockedSkins = data.unlockedSkins || ["default"];
  currentSkin = data.currentSkin || "default";
}

// ==========================
// 메뉴 업데이트
// ==========================
function updateMenu() {
  document.getElementById("coinText").innerText = "코인: " + coins;
  document.getElementById("highScoreText").innerText = "최고점수: " + score;
}

// ==========================
// 모바일 터치 이동
// ==========================
canvas.addEventListener("touchmove", e => {
  const rect = canvas.getBoundingClientRect();
  player.x = e.touches[0].clientX - rect.left - player.size/2;
});

canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  player.x = e.clientX - rect.left - player.size/2;
});
