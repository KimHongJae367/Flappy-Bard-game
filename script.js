/********************************
 * 1) 기본 변수 설정
 ********************************/
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const resetBtn = document.getElementById("resetBtn");

const WIDTH = canvas.width;   // 320
const HEIGHT = canvas.height; // 480

// 새(버드) 이미지 로드
const birdImg = new Image();
birdImg.src = "bird.png";   // 새 이미지 경로

// 파이프 이미지 로드
const pipeNorthImg = new Image();
pipeNorthImg.src = "pipeNorth.png";  // 위쪽 파이프
const pipeSouthImg = new Image();
pipeSouthImg.src = "pipeSouth.png";  // 아래쪽 파이프

// 게임 상태 변수
let birdX, birdY;
let birdSize = 34; // 새 크기 (이미지 기반)
let velocity;
const gravity = 0.5;
const jumpPower = -8;

// 파이프 변수
let pipes = [];
const gap = 100;
const pipeWidth = 52;
const pipeSpeed = 2;

// 점수 & 게임 상태
let score;
let isGameOver;

// 파이프 타이머
let spawnTimer;
const spawnInterval = 90; // 90프레임마다 새 파이프 생성

/********************************
 * 2) 게임 초기화 함수
 ********************************/
function initGame() {
  birdX = 50;
  birdY = HEIGHT / 2 - birdSize / 2;
  velocity = 0;

  score = 0;
  isGameOver = false;

  pipes = [];
  spawnTimer = 0;  // 파이프 타이머 초기화
}

/********************************
 * 3) 파이프 생성 함수
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
 * 4) 키보드 & 터치 이벤트
 ********************************/
// 키보드 점프
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    jump();
  }
});

// 터치(모바일) 점프
canvas.addEventListener("touchstart", (e) => {
  jump();
  e.preventDefault();
});

// 점프 함수
function jump() {
  if (!isGameOver) {
    velocity = jumpPower;
  }
}

/********************************
 * 5) 리셋 함수
 ********************************/
resetBtn.addEventListener("click", () => {
  resetGame();
});

function resetGame() {
  initGame();
}

/********************************
 * 6) 게임 업데이트
 ********************************/
function update() {
  if (isGameOver) return;

  // 새 물리 적용
  velocity += gravity;
  birdY += velocity;

  // 파이프 이동
  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    p.x -= pipeSpeed;

    // 화면 밖으로 나간 파이프 제거
    if (p.x + pipeWidth < 0) {
      pipes.splice(i, 1);
      i--;
      continue;
    }

    // 점수 증가
    if (!p.passed && p.x + pipeWidth < birdX) {
      score++;
      p.passed = true;
    }

    // 충돌 판정
    if (checkCollision(p)) {
      isGameOver = true;
    }
  }

  // 파이프 생성 (타이머 기반)
  spawnTimer++;
  if (spawnTimer >= spawnInterval) {
    createPipe(WIDTH + 20);
    spawnTimer = 0;
  }

  // 화면 위/아래 충돌
  if (birdY < 0 || birdY + birdSize > HEIGHT) {
    isGameOver = true;
  }
}

/********************************
 * 7) 충돌 판정
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
 * 8) 게임 그리기
 ********************************/
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // 파이프 그리기
  pipes.forEach((p) => {
    ctx.drawImage(pipeNorthImg, p.x, 0, pipeWidth, p.topHeight);
    ctx.drawImage(pipeSouthImg, p.x, p.bottomY, pipeWidth, HEIGHT - p.bottomY);
  });

  // 새(이미지)
  ctx.drawImage(birdImg, birdX, birdY, birdSize, birdSize);

  // 점수 표시
  ctx.fillStyle = "#000";
  ctx.font = "16px Arial";
  ctx.fillText("Score: " + score, 10, 20);

  // 게임오버 표시
  if (isGameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#fff";
    ctx.font = "24px Arial";
    ctx.fillText("Game Over!", WIDTH / 2 - 60, HEIGHT / 2 - 10);
  }
}

/********************************
 * 9) 게임 루프
 ********************************/
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

/********************************
 * 10) 게임 시작
 ********************************/
initGame();
gameLoop();
