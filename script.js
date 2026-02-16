// ==========================
// 기본 변수
// ==========================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score=0, coins=0, highScore=0;
let difficulty="normal";
let gameRunning=false;
let animationId;

let unlockedSkins=["default"];
let currentSkin="default";

let player={x:180,y:550,size:30};

const skinColors={
 default:"#ffffff",
 lime:"#00ff00",
 magenta:"#ff00ff",
 gold:"#ffd700",
 cyan:"#00ffff",
 orange:"#ff8800",
 purple:"#aa00ff",
 red:"#ff0000",
 blue:"#0088ff"
};

const skinPrices={
 default:0,
 lime:100,
 magenta:200,
 gold:500,
 cyan:300,
 orange:250,
 purple:400,
 red:350,
 blue:150
};

// ==========================
// 오디오 (CSP 안전버전)
// ==========================
const bgm=new Audio("assets/audio/bgm.mp3");
const sfxScore=new Audio("assets/audio/score.wav");
const sfxBuy=new Audio("assets/audio/buy.wav");
const sfxGameOver=new Audio("assets/audio/gameover.wav");

bgm.loop=true;
bgm.volume=0.4;

let audioReady=false;

function unlockAudio(){
 if(audioReady) return;
 bgm.play().then(()=>{
   bgm.pause();
   bgm.currentTime=0;
   audioReady=true;
 }).catch(()=>{});
}

document.addEventListener("click",unlockAudio,{once:true});
document.addEventListener("touchstart",unlockAudio,{once:true});

function playBGM(){ if(audioReady) bgm.play().catch(()=>{}); }
function playScore(){ if(audioReady){ sfxScore.currentTime=0; sfxScore.play().catch(()=>{});} }
function playBuy(){ if(audioReady){ sfxBuy.currentTime=0; sfxBuy.play().catch(()=>{});} }
function playGameOver(){ if(audioReady){ sfxGameOver.currentTime=0; sfxGameOver.play().catch(()=>{});} }

// ==========================
// 로그인
// ==========================
document.getElementById("startBtn").onclick=()=>{
 const name=document.getElementById("nameInput").value.trim();
 if(!name) return alert("닉네임 입력");
 localStorage.setItem("nickname",name);
 document.getElementById("loginScreen").classList.add("hidden");
 document.getElementById("menuScreen").classList.remove("hidden");
 loadGame();
 updateMenu();
};

// ==========================
// 난이도
// ==========================
document.querySelectorAll("[data-diff]").forEach(btn=>{
 btn.onclick=()=>{
   difficulty=btn.dataset.diff;
   applyDifficulty();
 };
});

function applyDifficulty(){
 if(difficulty==="easy")
   document.body.style.background="linear-gradient(#87CEEB,#fff)";
 else if(difficulty==="hard")
   document.body.style.background="linear-gradient(#200122,#6f0000)";
 else
   document.body.style.background="linear-gradient(#333,#111)";
}

// ==========================
// 게임 시작
// ==========================
document.getElementById("gameStartBtn").onclick=startGame;

function startGame(){
 score=0;
 gameRunning=true;
 document.getElementById("menuScreen").classList.add("hidden");
 canvas.style.display="block";
 playBGM();
 gameLoop();
}

// ==========================
// 게임 루프
// ==========================
function gameLoop(){
 if(!gameRunning) return;

 ctx.clearRect(0,0,canvas.width,canvas.height);

 // 플레이어
 ctx.fillStyle=skinColors[currentSkin];
 ctx.fillRect(player.x,player.y,player.size,player.size);

 score++;
 coins++;

 if(score%50===0) playScore();

 animationId=requestAnimationFrame(gameLoop);
}

// ==========================
// 게임 종료
// ==========================
function endGame(){
 gameRunning=false;
 cancelAnimationFrame(animationId);
 canvas.style.display="none";
 document.getElementById("menuScreen").classList.remove("hidden");

 if(score>highScore) highScore=score;
 playGameOver();
 saveGame();
 updateMenu();
}

// ==========================
// 상점
// ==========================
const shop=document.getElementById("shopModal");
document.getElementById("shopBtn").onclick=()=>shop.classList.remove("hidden");
document.getElementById("closeShopBtn").onclick=()=>shop.classList.add("hidden");

function renderShop(){
 const list=document.getElementById("skinList");
 list.innerHTML="";
 Object.keys(skinPrices).forEach(name=>{
   const btn=document.createElement("button");
   btn.textContent=`${name} (${skinPrices[name]})`;
   btn.onclick=()=>buySkin(name);
   list.appendChild(btn);
 });
}

function buySkin(name){
 if(unlockedSkins.includes(name)){
   currentSkin=name;
   shop.classList.add("hidden");
   return;
 }
 if(coins>=skinPrices[name]){
   coins-=skinPrices[name];
   unlockedSkins.push(name);
   currentSkin=name;
   playBuy();
   saveGame();
   updateMenu();
   shop.classList.add("hidden");
 }else alert("코인 부족");
}

// ==========================
// 저장
// ==========================
function saveGame(){
 localStorage.setItem("neonSave",JSON.stringify({
   coins,highScore,unlockedSkins,currentSkin
 }));
}

function loadGame(){
 const data=JSON.parse(localStorage.getItem("neonSave"));
 if(!data) return;
 coins=data.coins||0;
 highScore=data.highScore||0;
 unlockedSkins=data.unlockedSkins||["default"];
 currentSkin=data.currentSkin||"default";
}

function updateMenu(){
 document.getElementById("coinText").innerText="코인: "+coins;
 document.getElementById("highScoreText").innerText="최고점수: "+highScore;
 renderShop();
}

// ==========================
// 모바일 터치 이동
// ==========================
canvas.addEventListener("touchmove",e=>{
 const rect=canvas.getBoundingClientRect();
 player.x=e.touches[0].clientX-rect.left-player.size/2;
});

canvas.addEventListener("mousemove",e=>{
 const rect=canvas.getBoundingClientRect();
 player.x=e.clientX-rect.left-player.size/2;
});
