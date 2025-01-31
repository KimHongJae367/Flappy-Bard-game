/****************************************
 * 기본 설정
 ****************************************/
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const resetBtn = document.getElementById("resetBtn");

const WIDTH = canvas.width;   // 320
const HEIGHT = canvas.height; // 480

// 새(버드) 관련
let birdX, birdY;
let birdSize = 20;
let velocity;
const gravity = 0.5;
const jumpPower = -8;

// 파이프 관련
let pipes = [];
const gap = 100;
const pipeWidth = 50;
const pipeSpeed = 2;

// 점수 & 상태
let score;
let isGameOver;
let spawnTimer;       // 파이프 생성 간격 조절용 타이머
const spawnInterval = 90; // 이 값(frame 수)마다 새 파이프 생성

// 초기화 함수
function initGame() {
  birdX = 50;
  birdY = 150;
  velocity = 0;
  score = 0;
  isGameOver = false;
  
  pipes = [];      // 파이프 배열 리셋
  spawnTimer = 0;  // 파이프 생성 타이머
  
  // 초기 파이프 몇 개 배치(선택사항)
  for (let i = 0; i < 3; i++) {
    createPipe(WIDTH + i * 200);
  }
}

// 파이프 생성 함수 (x 좌표를 인자로)
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

// 키보드 이벤트: 점프
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    jump();
  }
});

// 터치 이벤트: 모바일 지원
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

/****************************************
 * 업데이트 로직
 ****************************************/
function update() {
  if (isGameOver) return;

  // 새 물리 계산
  velocity += gravity;
  birdY += velocity;

  // 파이프 이동
  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    p.x -= pipeSpeed;

    // 화면 밖으로 벗어난 파이프 제거
    if (p.x + pipeWidth < 0) {
      pipes.splice(i, 1);
      i--;
      continue;
    }

    // 점수 증가 (새가 파이프를 완전히 지난 시점)
    if (!p.passed && p.x + pipeWidth < birdX) {
      score++;
      p.passed = true;
    }

    // 충돌 판정
    if (checkCollision(p)) {
      isGameOver = true;
    }
  }

  // 일정 시간이 지날 때마다 새 파이프 생성 (spawnTimer 사용)
  spawnTimer++;
  if (spawnTimer >= spawnInterval) {
    createPipe(WIDTH + 50);
    spawnTimer = 0;
  }

  // 화면 위/아래 범위
  if (birdY < 0 || birdY + birdSize > HEIGHT) {
    isGameOver = true;
  }
}

/****************************************
 * 충돌 판정
 ****************************************/
function checkCollision(pipe) {
  // 새 사각형
  let birdLeft = birdX;
  let birdRight = birdX + birdSize;
  let birdTop = birdY;
  let birdBottom = birdY + birdSize;

  // 위 파이프 영역: (0 ~ pipe.topHeight)
  let pipeTopLeft = pipe.x;
  let pipeTopRight = pipe.x + pipeWidth;
  let pipeTopBottom = pipe.topHeight;

  // 아래 파이프 영역: (pipe.bottomY ~ canvas 끝)
  let pipeBottomTop = pipe.bottomY;

  // 위 파이프 충돌?
  let collideTop =
    birdRight >= pipeTopLeft &&
    birdLeft <= pipeTopRight &&
    birdTop <= pipeTopBottom;

  // 아래 파이프 충돌?
  let collideBottom =
    birdRight >= pipeTopLeft &&
    birdLeft <= pipeTopRight &&
    birdBottom >= pipeBottomTop;

  return collideTop || collideBottom;
}

/****************************************
 * 그리기
 ****************************************/
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

  // 새 (노란 사각형 예시)
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

/****************************************
 * 메인 루프
 ****************************************/
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

/****************************************
 * 리셋 버튼
 ****************************************/
resetBtn.addEventListener("click", () => {
  resetGame();
});

function resetGame() {
  // 게임 상태를 다시 초기화
  initGame();
  // isGameOver가 false가 되면, 다음 frame부터 자연스럽게 진행
  // 만약 gameLoop를 멈췄다면 다시 시작해야 하나,
  // 우리는 loop를 계속 돌리고 있으므로, state만 리셋하면 된다.
}

/****************************************
 * 초기화 & 시작
 ****************************************/
initGame();
gameLoop();
