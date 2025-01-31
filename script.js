// 캔버스 및 기본 설정
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;   // 320
const HEIGHT = canvas.height; // 480

// 새 변수
let birdX = 50;
let birdY = 150;
const birdSize = 20;
let velocity = 0;
const gravity = 0.5;
const jumpPower = -8;

// 파이프
let pipes = [];
const gap = 100;
const pipeWidth = 50;
const pipeSpeed = 2;

// 점수 & 상태
let score = 0;
let isGameOver = false;

/***************************************
 * 키보드 & 터치 이벤트 (점프)
 ***************************************/
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    jump();
  }
});

// 추가: 모바일 터치 시에도 점프
document.addEventListener("touchstart", (e) => {
  jump();
  // e.preventDefault(); // 필요 시 기본 터치 동작(스크롤 등) 방지
});

function jump() {
  if (!isGameOver) {
    velocity = jumpPower;
  }
}

/***************************************
 * 파이프 초기화 & 생성
 ***************************************/
function initPipes() {
  for (let i = 0; i < 3; i++) {
    createPipe(300 + i * 200);
  }
}

function createPipe(xPos) {
  let topHeight = Math.floor(Math.random() * 120) + 40;
  let bottomY = topHeight + gap;
  pipes.push({
    x: xPos,
    topHeight: topHeight,
    bottomY: bottomY,
    passed: false,
  });
}

/***************************************
 * 메인 업데이트 함수
 ***************************************/
function update() {
  if (isGameOver) return;

  // 새 물리
  velocity += gravity;
  birdY += velocity;

  // 파이프 이동
  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    p.x -= pipeSpeed;

    // 화면 밖으로 사라지면
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
      isGameOver = true;
    }
  }

  // 화면 위/아래 범위 체크
  if (birdY < 0 || birdY + birdSize > HEIGHT) {
    isGameOver = true;
  }
}

/***************************************
 * 충돌 판정
 ***************************************/
function checkCollision(pipe) {
  let birdLeft = birdX;
  let birdRight = birdX + birdSize;
  let birdTop = birdY;
  let birdBottom = birdY + birdSize;

  // 위 파이프
  let pipeTopLeft = pipe.x;
  let pipeTopRight = pipe.x + pipeWidth;
  let pipeTopBottom = pipe.topHeight;
  let collideTop =
    birdRight >= pipeTopLeft &&
    birdLeft <= pipeTopRight &&
    birdTop <= pipeTopBottom;

  // 아래 파이프
  let pipeBottomTop = pipe.bottomY;
  let collideBottom =
    birdRight >= pipeTopLeft &&
    birdLeft <= pipeTopRight &&
    birdBottom >= pipeBottomTop;

  return collideTop || collideBottom;
}

/***************************************
 * 그리기 함수
 ***************************************/
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // 파이프
  ctx.fillStyle = "green";
  pipes.forEach((p) => {
    // 위 파이프
    ctx.fillRect(p.x, 0, pipeWidth, p.topHeight);
    // 아래 파이프
    ctx.fillRect(p.x, p.bottomY, pipeWidth, HEIGHT - p.bottomY);
  });

  // 새 (노란 사각형)
  ctx.fillStyle = "#ff0";
  ctx.fillRect(birdX, birdY, birdSize, birdSize);

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
    ctx.fillText("Score: " + score, WIDTH / 2 - 40, HEIGHT / 2 + 30);
  }
}

/***************************************
 * 메인 루프
 ***************************************/
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

/***************************************
 * 초기화 & 실행
 ***************************************/
initPipes();
gameLoop();
