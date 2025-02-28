/********************************
 * 1) 기본 변수 설정
 ********************************/
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const resetBtn = document.getElementById("resetBtn");

const WIDTH = canvas.width;   
const HEIGHT = canvas.height; 

// 배경 이미지 로드 (변경됨)
const bgImg = new Image();
bgImg.src = "images/background.png";
bgImg.onload = function() {
  console.log("배경 이미지 로드 완료");
};

/********************************
 * 2) 새 및 파이프 이미지 로드
 ********************************/
const birdImg = new Image();
birdImg.src = "images/bird.png";

const pipeNorthImg = new Image();
pipeNorthImg.src = "images/north.png";

const pipeSouthImg = new Image();
pipeSouthImg.src = "images/south.png";

/********************************
 * 3) 점프 소리 & 배경 음악
 ********************************/
const jumpSound = new Audio('sound/jump.mp3');
jumpSound.volume = 0.1;

const bgm = new Audio('sound/bgm.mp3');
bgm.loop = true;
bgm.volume = 0.5;

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
 * 11) 게임 그리기 (배경 정상 표시)
 ********************************/
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // (배경 고정) 배경 이미지가 로드된 후에만 그리기
  if (bgImg.complete) {
    ctx.drawImage(bgImg, 0, 0, WIDTH, HEIGHT);
  } else {
    console.log("배경 이미지 로딩 중...");
  }

  // 기존 게임 요소 그리기 유지
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
