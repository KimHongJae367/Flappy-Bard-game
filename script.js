/********************************
 * 1) 기본 변수 설정
 ********************************/
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const resetBtn = document.getElementById("resetBtn");

const WIDTH = canvas.width;   
const HEIGHT = canvas.height; 

// 이미지 로드
const birdImg = new Image();
birdImg.src = "images/bird.png";

const pipeNorthImg = new Image();
pipeNorthImg.src = "images/north.png";
const pipeSouthImg = new Image();
pipeSouthImg.src = "images/south.png";

// 점프 소리
const jumpSound = new Audio('sound/jump.mp3');
jumpSound.volume = 0.1;  // 점프 소리를 조절

// 배경 음악 (BGM)
const bgm = new Audio('sound/bgm.mp3');
bgm.loop = true;
bgm.volume = 1.0;

// 로딩 완료 체크
let imagesLoaded = 0;
let audiosLoaded = 0;
const totalAssets = 4;  // 이미지 3개 + BGM 1개

// 로딩 완료 체크 함수
function checkAssetsLoaded() {
  if (imagesLoaded + audiosLoaded === totalAssets) {
    initGame();
    gameLoop();
  }
}

/********************************
 * 2) 이미지 로딩 완료 확인
 ********************************/
birdImg.onload = pipeNorthImg.onload = pipeSouthImg.onload = function() {
  imagesLoaded++;
  checkAssetsLoaded();
};

/********************************
 * 3) 오디오 로딩 완료 확인
 ********************************/
bgm.addEventListener('canplaythrough', function() {
  audiosLoaded++;
  checkAssetsLoaded();
}, false);

/********************************
 * 4) 게임 상태 변수
 ********************************/
let birdX, birdY;
let birdSize = 34;
let velocity;
const gravity = 0.5;
const jumpPower = -8;

let pipes = [];
const gap = 170;
const pipeWidth = 52;
const pipeSpeed = 2;

let score;
let isGameOver;

let spawnTimer;
const spawnInterval = 90;

/********************************
 * 5) 게임 초기화 함수
 ********************************/
function initGame() {
  birdX = 50;
  birdY = HEIGHT / 2 - birdSize / 2;
  velocity = 0;

  score = 0;
  isGameOver = false;

  pipes = [];
  spawnTimer = 0;

  // 배경 음악 재생
  bgm.currentTime = 0;
  bgm.play();
}

/********************************
 * 6) 점프 함수
 ********************************/
function jump() {
  if (!isGameOver) {
    velocity = jumpPower;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
}

/********************************
 * 7) 이벤트 처리
 ********************************/
window.addEventListener("keydown", (e) => {
  if (["Space", "ArrowUp", "ShiftLeft", "ShiftRight"].includes(e.code)) {
    jump();
    e.preventDefault();
  }
});

canvas.addEventListener("touchstart", (e) => {
  jump();
  e.preventDefault();
});

canvas.addEventListener("click", jump);

resetBtn.addEventListener("click", resetGame);

function resetGame() {
  initGame();
}

/********************************
 * 8) 게임 업데이트
 ********************************/
function update() {
  if (isGameOver) return;

  velocity += gravity;
  birdY += velocity;

  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    p.x -= pipeSpeed;

    if (p.x + pipeWidth < 0) {
      pipes.splice(i, 1);
      i--;
      continue;
    }

    if (!p.passed && p.x + pipeWidth < birdX) {
      score++;
      p.passed = true;
    }

    if (checkCollision(p)) {
      if (!isGameOver) {
        isGameOver = true;
        bgm.pause();
      }
    }
  }

  spawnTimer++;
  if (spawnTimer >= spawnInterval) {
    createPipe(WIDTH + 20);
    spawnTimer = 0;
  }

  if (birdY < 0 || birdY + birdSize > HEIGHT) {
    isGameOver = true;
    bgm.pause();
  }
}

/********************************
 * 9) 파이프 생성 함수
 ********************************/
function createPipe(xPos) {
  const topHeight = Math.floor(Math.random() * 120) + 40;
  const bottomY = topHeight + gap;

  pipes.push({
    x: xPos,
    topHeight: topHeight,
    bottomY: bottomY,
    passed: false
  });
}

/********************************
 * 10) 충돌 판정
 ********************************/
function checkCollision(pipe) {
  let birdTop = birdY;
  let birdBottom = birdY + birdSize;
  let birdLeft = birdX;
  let birdRight = birdX + birdSize;

  let pipeTopLeft = pipe.x;
  let pipeTopRight = pipe.x + pipeWidth;
  let pipeTopBottom = pipe.topHeight;
  let pipeBottomTop = pipe.bottomY;

  let collideTop =
    birdRight >= pipeTopLeft &&
    birdLeft <= pipeTopRight &&
    birdTop <= pipeTopBottom;

  let collideBottom =
    birdRight >= pipeTopLeft &&
    birdLeft <= pipeTopRight &&
    birdBottom >= pipeBottomTop;

  return collideTop || collideBottom;
}

/********************************
 * 11) 게임 그리기
 ********************************/
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  pipes.forEach((p) => {
    ctx.drawImage(pipeNorthImg, p.x, 0, pipeWidth, p.topHeight);
    ctx.drawImage(pipeSouthImg, p.x, p.bottomY, pipeWidth, HEIGHT - p.bottomY);
  });

  ctx.drawImage(birdImg, birdX, birdY, birdSize, birdSize);

  ctx.fillStyle = "#000";
  ctx.font = "16px Arial";
  ctx.fillText("Score: " + score, 10, 20);

  if (isGameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#fff";
    ctx.font = "24px Arial";
    ctx.fillText("Game Over!", WIDTH / 2 - 60, HEIGHT / 2 - 10);
  }
}

/********************************
 * 12) 게임 루프
 ********************************/
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
