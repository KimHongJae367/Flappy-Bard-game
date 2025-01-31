/*****************************************
 * 변수 및 초기 설정 (간략 예시)
 *****************************************/
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;   // 320
const HEIGHT = canvas.height; // 480

const pipeNorthImg = new Image();
pipeNorthImg.src = "pipeNorth.png";
const pipeSouthImg = new Image();
pipeSouthImg.src = "pipeSouth.png";

// 파이프 정보
let pipes = [];
const gap = 100;       // 파이프 사이 간격 "항상" 고정
const pipeWidth = 52;  // 파이프 이미지 폭 (예: 52px)
const pipeSpeed = 2;

// 새
let birdX = 50;
let birdY = 150;
let gravity = 0.5;
let velocity = 0;
let jumpPower = -8;

let score = 0;
let gameOver = false;

/*****************************************
 * 키보드 이벤트 (점프)
 *****************************************/
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    velocity = jumpPower;
  }
});

/*****************************************
 * 파이프 초기화
 *****************************************/
function initPipes() {
  for (let i = 0; i < 3; i++) {
    createPipe(300 + i * 200);
  }
}

function createPipe(xPos) {
  // 위쪽 파이프 높이를 무작위 설정
  let topHeight = Math.floor(Math.random() * 120) + 40; // 40~160 사이
  let bottomY = topHeight + gap; // gap만큼 떨어진 지점부터 아래 파이프 시작

  let pipe = {
    x: xPos,
    topHeight: topHeight,
    bottomY: bottomY,
    passed: false
  };
  pipes.push(pipe);
}

/*****************************************
 * 메인 업데이트
 *****************************************/
function update() {
  if (gameOver) return;

  // 새 물리
  velocity += gravity;
  birdY += velocity;

  // 파이프 이동
  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    p.x -= pipeSpeed;

    // 화면 왼쪽 밖으로 나간 파이프 재생성
    if (p.x + pipeWidth < 0) {
      pipes.splice(i, 1);
      i--;
      createPipe(WIDTH + 50);
      continue;
    }

    // 점수 증가
    if (!p.passed && p.x + pipeWidth < birdX) {
      score++;
      p.passed = true;
    }

    // 충돌 판정
    if (checkCollision(p)) {
      gameOver = true;
    }
  }

  // 화면 위아래 범위
  if (birdY < 0 || birdY + 24 > HEIGHT) { // 새 높이를 24라 가정
    gameOver = true;
  }
}

/*****************************************
 * 파이프 충돌 판정
 *****************************************/
function checkCollision(pipe) {
  // 새의 사각형
  let birdWidth = 34;  // 새 이미지 폭
  let birdHeight = 24; // 새 이미지 높이
  let birdLeft = birdX;
  let birdRight = birdX + birdWidth;
  let birdTop = birdY;
  let birdBottom = birdY + birdHeight;

  // 파이프 상단: 0 ~ pipe.topHeight
  let pipeTopLeft = pipe.x;
  let pipeTopRight = pipe.x + pipeWidth;
  let pipeTopBottom = pipe.topHeight;

  let collideTop =
    birdRight >= pipeTopLeft &&
    birdLeft <= pipeTopRight &&
    birdTop <= pipeTopBottom;

  // 파이프 하단: pipe.bottomY ~ canvas 끝
  let pipeBottomLeft = pipe.x;
  let pipeBottomRight = pipe.x + pipeWidth;
  let pipeBottomTop = pipe.bottomY;

  let collideBottom =
    birdRight >= pipeBottomLeft &&
    birdLeft <= pipeBottomRight &&
    birdBottom >= pipeBottomTop;

  return collideTop || collideBottom;
}

/*****************************************
 * 그리기 (이미지 늘이기 방식)
 *****************************************/
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // 파이프
  pipes.forEach((p) => {
    // 위 파이프
    // - y=0 부터 p.topHeight만큼 늘려서 그림
    ctx.drawImage(pipeNorthImg, p.x, 0, pipeWidth, p.topHeight);
    // 아래 파이프
    // - y=p.bottomY 부터 화면 끝까지
    ctx.drawImage(pipeSouthImg, p.x, p.bottomY, pipeWidth, HEIGHT - p.bottomY);
  });

  // 새 (이미지 대신 노란 사각형 예시)
  // 실제로는 drawImage(birdImg, birdX, birdY, birdWidth, birdHeight);
  ctx.fillStyle = "#ff0";
  ctx.fillRect(birdX, birdY, 34, 24);

  // 점수
  ctx.fillStyle = "#000";
  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, 10, 20);

  // 게임 오버 시
  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#fff";
    ctx.font = "24px Arial";
    ctx.fillText("Game Over", WIDTH / 2 - 60, HEIGHT / 2 - 10);
    ctx.fillText("Score: " + score, WIDTH / 2 - 50, HEIGHT / 2 + 30);
  }
}

/*****************************************
 * 메인 루프
 *****************************************/
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

/*****************************************
 * 초기화
 *****************************************/
initPipes();
gameLoop();
