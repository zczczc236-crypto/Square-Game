let username = "";
let coins = 0;
let highScore = 0;
let currentSkin = "cyan";
let ownedSkins = ["cyan"];

let score = 0;
let gameRunning = false;
let speed = 3;

const loginScreen = document.getElementById("loginScreen");
const mainUI = document.getElementById("mainUI");
const welcomeText = document.getElementById("welcomeText");
const coinsText = document.getElementById("coins");
const highScoreText = document.getElementById("highScore");
const player = document.getElementById("player");
const gameArea = document.getElementById("gameArea");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");

function saveData(){
  localStorage.setItem("userData", JSON.stringify({
    username, coins, highScore, currentSkin, ownedSkins
  }));
}

function loadData(){
  const data = JSON.parse(localStorage.getItem("userData"));
  if(data){
    username = data.username;
    coins = data.coins;
    highScore = data.highScore;
    currentSkin = data.currentSkin;
    ownedSkins = data.ownedSkins;
  }
}

function login(){
  const input = document.getElementById("usernameInput").value.trim();
  if(!input) return alert("닉네임 입력");
  username = input;
  loadData();
  welcomeText.innerText = username + " 님";
  coinsText.innerText = coins;
  highScoreText.innerText = highScore;
  player.style.background = currentSkin;
  loginScreen.classList.add("hidden");
  mainUI.classList.remove("hidden");
  saveData();
}

function startGame(){
  score = 0;
  speed = 3;
  gameRunning = true;
  gameOverScreen.classList.add("hidden");
  gameLoop();
}

function gameLoop(){
  if(!gameRunning) return;
  score++;
  if(score % 200 === 0) speed += 0.5;
  if(Math.random() < 0.03) createEnemy();
  requestAnimationFrame(gameLoop);
}

function createEnemy(){
  const enemy = document.createElement("div");
  enemy.classList.add("enemy");
  enemy.style.left = Math.random()*(gameArea.clientWidth-40)+"px";
  enemy.style.top = "0px";
  gameArea.appendChild(enemy);

  function fall(){
    if(!gameRunning) return;
    enemy.style.top = parseFloat(enemy.style.top)+speed+"px";

    if(parseFloat(enemy.style.top)>gameArea.clientHeight-40){
      enemy.remove();
      return;
    }

    if(checkCollision(enemy)){
      endGame();
      enemy.remove();
      return;
    }

    requestAnimationFrame(fall);
  }
  requestAnimationFrame(fall);
}

function checkCollision(enemy){
  const p = player.getBoundingClientRect();
  const e = enemy.getBoundingClientRect();
  return !(p.right<e.left||p.left>e.right||p.bottom<e.top||p.top>e.bottom);
}

function endGame(){
  gameRunning=false;
  coins += Math.floor(score/10);
  if(score>highScore) highScore=score;
  coinsText.innerText=coins;
  highScoreText.innerText=highScore;
  finalScore.innerText="점수: "+score;
  gameOverScreen.classList.remove("hidden");
  saveData();
}

function buySkin(color,price){
  if(ownedSkins.includes(color)){
    currentSkin=color;
  } else {
    if(coins<price) return alert("코인 부족");
    coins-=price;
    ownedSkins.push(color);
    currentSkin=color;
  }
  player.style.background=color;
  coinsText.innerText=coins;
  saveData();
}

function toggleShop(){
  document.getElementById("shop").classList.toggle("hidden");
}

gameArea.addEventListener("mousemove", e=>{
  const rect=gameArea.getBoundingClientRect();
  let x=e.clientX-rect.left-20;
  x=Math.max(0,Math.min(x,gameArea.clientWidth-40));
  player.style.left=x+"px";
});

gameArea.addEventListener("touchmove", e=>{
  const rect=gameArea.getBoundingClientRect();
  let x=e.touches[0].clientX-rect.left-20;
  x=Math.max(0,Math.min(x,gameArea.clientWidth-40));
  player.style.left=x+"px";
});

// PWA 등록
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("service-worker.js");
}
