<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NEON DODGE</title>
<style>
  body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: black;
    color: white;
    overflow: hidden;
  }

  /* ------------------- 로그인 화면 ------------------- */
  #loginScreen {
    position: absolute;
    width: 100%;
    height: 100%;
    background: #000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  #loginScreen input {
    padding: 10px;
    margin: 10px 0;
    width: 200px;
    font-size: 16px;
  }

  #loginScreen button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }

  /* ------------------- 메인 UI ------------------- */
  #mainUI {
    display: none;
    position: relative;
    width: 100%;
    height: 100%;
  }

  #gameArea {
    position: relative;
    width: 100%;
    height: 100%;
    background: #111;
    overflow: hidden;
  }

  #player {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 40px;
    background: cyan;
    border-radius: 8px;
  }

  .enemy {
    position: absolute;
    width: 40px;
    height: 40px;
    background: red;
    border-radius: 4px;
  }

  /* ------------------- 점수/코인 UI ------------------- */
  #scoreboard {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 18px;
    z-index: 10;
  }

  #scoreboard span {
    display: block;
    margin: 2px 0;
  }

  /* ------------------- 게임오버 ------------------- */
  #gameOverScreen {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.85);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    display: none;
    z-index: 20;
  }

  #gameOverScreen button {
    padding: 10px 20px;
    margin-top: 10px;
    font-size: 16px;
    cursor: pointer;
  }

  /* ------------------- 스킨 상점 ------------------- */
  #shopModal {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #222;
    padding: 20px;
    border-radius: 10px;
    display: none;
    z-index: 30;
    text-align: center;
  }

  #shopModal button {
    display: block;
    margin: 10px auto;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 16px;
  }

  .hidden {
    display: none !important;
  }
</style>
</head>
<body>

<!-- ------------------- 로그인 화면 ------------------- -->
<div id="loginScreen">
  <h1>NEON DODGE</h1>
  <input type="text" id="usernameInput" placeholder="닉네임 입력">
  <button onclick="login()">로그인</button>
</div>

<!-- ------------------- 메인 UI ------------------- -->
<div id="mainUI">
  <div id="scoreboard">
    <span>점수: <span id="score">0</span></span>
    <span>코인: <span id="coins">0</span></span>
    <span>최고점수: <span id="highScore">0</span></span>
    <button onclick="startGame()">게임 시작</button>
    <button onclick="openShop()">스킨 상점</button>
  </div>

  <div id="gameArea">
    <div id="player"></div>
  </div>

  <!-- ------------------- 게임오버 ------------------- -->
  <div id="gameOverScreen">
    <h2 id="finalScore">점수: 0</h2>
    <button onclick="startGame(); hideGameOver()">다시하기</button>
  </div>

  <!-- ------------------- 스킨 상점 ------------------- -->
  <div id="shopModal">
    <h2>스킨 상점</h2>
    <button onclick="buySkin('cyan')">기본 (무료)</button>
    <button onclick="buySkin('lime')">라임 (100)</button>
    <button onclick="buySkin('magenta')">마젠타 (200)</button>
    <button onclick="buySkin('gold')">골드 (500)</button>
    <button onclick="closeShop()" style="background: cyan;">닫기</button>
  </div>
</div>

<script>
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
  let enemyId = 0;

  // =========================
  // ▶ DOM
  // =========================
  const loginScreen = document.getElementById("loginScreen");
  const mainUI = document.getElementById("mainUI");
  const welcomeText = document.getElementById("welcomeText");
  const coinsText = document.getElementById("coins");
  const highScoreText = document.getElementById("highScore");
  const scoreText = document.getElementById("score");

  const player = document.getElementById("player");
  const gameArea = document.getElementById("gameArea");
  const gameOverScreen = document.getElementById("gameOverScreen");
  const finalScore = document.getElementById("finalScore");
  const shopModal = document.getElementById("shopModal");

  // =========================
  // ▶ 저장/불러오기
  // =========================
  function saveData() {
    if(!username) return;
    localStorage.setItem("neonDodgeData",
      JSON.stringify({username, coins, highScore, currentSkin, ownedSkins})
    );
  }

  function loadData(name) {
    const data = JSON.parse(localStorage.getItem("neonDodgeData"));
    if(data && data.username === name){
      coins = data.coins;
      highScore = data.highScore;
      currentSkin = data.currentSkin;
      ownedSkins = data.ownedSkins;
    }
  }

  // =========================
  // ▶ 로그인
  // =========================
  function login() {
    const input = document.getElementById("usernameInput").value.trim();
    if(!input) return alert("닉네임을 입력하세요.");
    username = input;
    loadData(username);
    coinsText.innerText = coins;
    highScoreText.innerText = highScore;
    scoreText.innerText = score;
    player.style.background = currentSkin;
    loginScreen.classList.add("hidden");
    mainUI.classList.remove("hidden");
    closeShop();
    saveData();
  }

  // =========================
  // ▶ 게임 시작
  // =========================
  function startGame() {
    if(gameRunning) return;
    score = 0;
    speed = 3;
    gameRunning = true;
    scoreText.innerText = score;
    hideGameOver();
    gameLoop();
  }

  function gameLoop() {
    if(!gameRunning) return;
    score++;
    if(score % 150 === 0) speed += 0.5;
    scoreText.innerText = score;
    if(Math.random() < 0.03) createEnemy();
    requestAnimationFrame(gameLoop);
  }

  function createEnemy() {
    const enemy = document.createElement("div");
    const id = `enemy-${enemyId++}`;
    enemy.id = id;
    enemy.className = "enemy";
    enemy.style.left = Math.random()*(gameArea.clientWidth-40)+"px";
    enemy.style.top = "0px";
    gameArea.appendChild(enemy);

    function move() {
      if(!gameRunning || !document.getElementById(id)){
        enemy.remove(); return;
      }
      const top = parseFloat(enemy.style.top) + speed;
      enemy.style.top = top+"px";
      if(top > gameArea.clientHeight-40){ enemy.remove(); return; }
      if(checkCollision(enemy)){ endGame(); enemy.remove(); return; }
      requestAnimationFrame(move);
    }
    requestAnimationFrame(move);
  }

  function checkCollision(enemy){
    const p = player.getBoundingClientRect();
    const e = enemy.getBoundingClientRect();
    return !(p.right < e.left || p.left > e.right || p.bottom < e.top || p.top > e.bottom);
  }

  function endGame(){
    if(!gameRunning) return;
    gameRunning=false;
    coins += Math.floor(score/10);
    if(score>highScore) highScore=score;
    coinsText.innerText=coins;
    highScoreText.innerText=highScore;
    finalScore.innerText=`점수: ${score}`;
    saveData();
    showGameOver();
  }

  function showGameOver(){ gameOverScreen.style.display="flex"; }
  function hideGameOver(){ gameOverScreen.style.display="none"; }

  function openShop(){ shopModal.style.display="block"; }
  function closeShop(){ shopModal.style.display="none"; }

  function buySkin(color){
    const prices={lime:100, magenta:200, gold:500};
    const price = prices[color] || 0;
    if(ownedSkins.includes(color)){ currentSkin=color; }
    else{
      if(coins<price){ alert("코인이 부족합니다!"); return; }
      coins-=price; ownedSkins.push(color); currentSkin=color;
    }
    player.style.background=currentSkin;
    coinsText.innerText=coins;
    saveData();
    closeShop();
  }

  function movePlayer(x){
    const rect = gameArea.getBoundingClientRect();
    x = Math.max(0, Math.min(x-rect.left-20, gameArea.clientWidth-40));
    player.style.left=x+"px";
  }

  gameArea.addEventListener("mousemove", e=>movePlayer(e.clientX));
  gameArea.addEventListener("touchmove", e=>{
    e.preventDefault(); movePlayer(e.touches[0].clientX);
  }, {passive:false});
</script>
</body>
</html>
