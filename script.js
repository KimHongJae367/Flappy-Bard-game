/********************************
 * 1) 변수 선언
 ********************************/
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
let pipes = [];           // 파이프 배열
const gap = 125;          // 파이프 사이 간격 (!!!)
const pipeWidth = 50;
const pipeSpeed = 2;

// 점수
let score;
let isGameOver;

// 파이프 스폰 타이머
let spawnTimer;       // 누적 프레임
const spawnInterval = 90; // 매 90프레임마다 새 파이프 1개 생성

/********************************
 * 2) 초기화 함수
 ********************************/
function initGame() {
  birdX = 50;
  birdY = 150;
  velocity = 0;

  score = 0;
  isGameOver = false;

  pipes = [];
  spawnTimer = 0;  // 타이머 초기화

  /*
    필요하다면, 초기 파이프를 여기서 몇 개 생성할 수도 있음:
    예) for (let i = 0; i < 3; i++) {
          createPipe(WIDTH + i * 200);
        }
    여기서는 완전히 타이머에만 의존하도록 일단 생성 안함
  */
}

/********************************
 * 3) 파이프 생성
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
 * 4) 이벤트 설정
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

// 리셋 버튼
resetBtn.addEventListener("click", () => {
  resetGame();
});

function jump() {
  if (!isGameOver) {
    velocity = jumpPower;
  }
}

/********************************
 * 5) 리셋 함수
 ********************************/
function resetGame() {
  initGame();  // 모든 변수 초기화
  // gameLoop는 계속 돌고 있으므로, 상태만 리셋하면
  // 다음 프레임부터 새 게임이 시작됨
}

/********************************
 * 6) 메인 업데이트
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

    // 화면 밖으로 벗어나면 제거
    if (p.x + pipeWidth < 0) {
      pipes.splice(i, 1);
      i--;
      continue;
    }

    // 점수 증가 (새가 파이프의 오른쪽 끝을 지나갈 때)
    if (!p.passed && p.x + pipeWidth < birdX) {
      score++;
      p.passed = true;
    }

    // 충돌 판정
    if (checkCollision(p)) {
      isGameOver = true;
    }
  }

  // 파이프 스폰 (타이머 기반)
  spawnTimer++;
  if (spawnTimer >= spawnInterval) {
    // 새 파이프 생성 (화면 오른쪽 밖에서 생성)
    createPipe(WIDTH + 20);
    spawnTimer = 0;
  }

  // 위/아래 경계 충돌
  if (birdY < 0 || birdY + birdSize > HEIGHT) {
    isGameOver = true;
  }
}

/********************************
 * 7) 충돌 판정
 ********************************/
function checkCollision(pipe) {
  let birdLeft = birdX;
  let birdRight = birdX + birdSize;
  let birdTop = birdY;
  let birdBottom = birdY + birdSize;

  // 위 파이프: 0 ~ pipe.topHeight
  let pipeTopLeft = pipe.x;
  let pipeTopRight = pipe.x + pipeWidth;
  let pipeTopBottom = pipe.topHeight;

  // 아래 파이프: pipe.bottomY ~ canvas.height
  let pipeBottomTop = pipe.bottomY;

  // 위 파이프와 충돌?
  let collideTop =
    birdRight >= pipeTopLeft &&
    birdLeft <= pipeTopRight &&
    birdTop <= pipeTopBottom;

  // 아래 파이프와 충돌?
  let collideBottom =
    birdRight >= pipeTopLeft &&
    birdLeft <= pipeTopRight &&
    birdBottom >= pipeBottomTop;

  return (collideTop || collideBottom);
}

/********************************
 * 8) 그리기
 ********************************/
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // 파이프 그리기
  ctx.fillStyle = "green";
  pipes.forEach((p) => {
    // 위 파이프
    ctx.fillRect(p.x, 0, pipeWidth, p.topHeight);
    // 아래 파이프
    ctx.fillRect(p.x, p.bottomY, pipeWidth, HEIGHT - p.bottomY);
  });

  // 새(노란 사각형)
  ctx.fillStyle = "#ff0";
  ctx.fillRect(birdX, birdY, birdSize, birdSize);

  // 점수 표시
  ctx.fillStyle = "#000";
  ctx.font = "16px Arial";
  ctx.fillText("Score: " + score, 10, 20);

  // 게임오버
  if (isGameOver) {
    // 반투명 막
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 메세지
    ctx.fillStyle = "#fff";
    ctx.font = "24px Arial";
    ctx.fillText("Game Over!", WIDTH / 2 - 60, HEIGHT / 2 - 10);
    ctx.fillText("Score: " + score, WIDTH / 2 - 40, HEIGHT / 2 + 30);
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
initGame();  // 변수 초기화
gameLoop();  // 루프 시작
