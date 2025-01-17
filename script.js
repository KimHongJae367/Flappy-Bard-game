/*****************************************
 * 1) 캔버스 및 기본 변수 설정
 *****************************************/
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 캔버스 크기
const WIDTH = canvas.width;    // 320
const HEIGHT = canvas.height;  // 480

// 새(버드) 관련
let birdX = 50;         // 새의 X좌표 (거의 고정)
let birdY = 150;        // 새의 Y좌표
let birdSize = 20;      // 새의 크기(사각형 한 변)
let velocity = 0;       // 수직 속도
let gravity = 0.5;      // 중력
let jumpPower = -8;     // 점프 힘(음수값으로 위로 이동)

// 파이프 관련
let pipes = [];         // 파이프 정보 배열
const gap = 100;        // 파이프 사이 빈 공간
const pipeWidth = 50;   // 파이프 폭
const pipeSpeed = 2;    // 파이프 이동 속도

// 점수
let score = 0;

// 게임 상태
let isGameOver = false;

/*****************************************
 * 2) 키보드 입력 (점프)
 *****************************************/
document.addEventListener("keydown", onKeyDown);

function onKeyDown(e) {
  // 스페이스바, 위 방향키 시 새 점프
  if (e.code === "Space" || e.code === "ArrowUp") {
    velocity = jumpPower;
  }
}

/*****************************************
 * 3) 파이프 초기 세팅
 *****************************************/
function initPipes() {
  // 화면 바깥쪽부터 시작해서 일정 간격으로 여러 개 생성
  for (let i = 0; i < 3; i++) {
    let pipeX = 300 + i * 200;  // 200픽셀 간격
    createPipe(pipeX);
  }
}

function createPipe(x) {
  // 위 파이프 높이 무작위 설정
  let topHeight = Math.floor(Math.random() * 120) + 40;
  // 아래 파이프 시작점 = topHeight + gap
  let bottomY = topHeight + gap;

  let pipe = {
    x: x,                  // 파이프의 현재 X좌표
    topHeight: topHeight,  // 위 파이프 높이
    bottomY: bottomY,      // 아래 파이프 시작 y좌표
    passed: false          // 점수 획득 여부 체크
  };
  pipes.push(pipe);
}

/*****************************************
 * 4) 메인 업데이트 로직
 *****************************************/
function update() {
  if (isGameOver) return;

  // 새 물리 적용
  velocity += gravity;  // 중력 가속
  birdY += velocity;    // 새 위치 업데이트

  // 파이프 이동 및 충돌 판정
  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    p.x -= pipeSpeed;

    // 화면 왼쪽을 벗어난 파이프는 제거 & 새 파이프 생성
    if (p.x + pipeWidth < 0) {
      pipes.splice(i, 1);
      i--;
      createPipe(WIDTH + 50);
      continue;
    }

    // 새가 파이프 중앙(혹은 끝)을 통과했는지 체크
    if (!p.passed && p.x + pipeWidth < birdX) {
      score++;
      p.passed = true;
    }

    // 충돌 체크
    if (checkCollision(p)) {
      isGameOver = true;
    }
  }

  // 화면 위/아래 경계 충돌
  if (birdY < 0 || birdY + birdSize > HEIGHT) {
    isGameOver = true;
  }
}

/*****************************************
 * 5) 충돌 판정 함수
 *****************************************/
function checkCollision(pipe) {
  // 새의 사각형 범위
  let birdLeft = birdX;
  let birdRight = birdX + birdSize;
  let birdTop = birdY;
  let birdBottom = birdY + birdSize;

  // 파이프 위쪽 범위
  let pipeTopLeft = pipe.x;
  let pipeTopRight = pipe.x + pipeWidth;
  let pipeTopBottom = pipe.topHeight;

  // 파이프 아래쪽 범위
  let pipeBottomTop = pipe.bottomY;

  // 위 파이프 충돌 조건
  let collideTop =
    birdRight >= pipeTopLeft &&
    birdLeft <= pipeTopRight &&
    birdTop <= pipeTopBottom;

  // 아래 파이프 충돌 조건
  let collideBottom =
    birdRight >= pipeTopLeft &&
    birdLeft <= pipeTopRight &&
    birdBottom >= pipeBottomTop;

  return collideTop || collideBottom;
}

/*****************************************
 * 6) 그리기 함수
 *****************************************/
function draw() {
  // 화면 지우기
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // 새(노란 사각형)
  ctx.fillStyle = "#ff0";
  ctx.fillRect(birdX, birdY, birdSize, birdSize);

  // 파이프(초록 사각형)
  ctx.fillStyle = "green";
  pipes.forEach((p) => {
    // 위 파이프
    ctx.fillRect(p.x, 0, pipeWidth, p.topHeight);
    // 아래 파이프
    ctx.fillRect(p.x, p.bottomY, pipeWidth, HEIGHT - p.bottomY);
  });

  // 점수 표시
  ctx.fillStyle = "#000";
  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, 10, 20);

  // 게임오버 시 표시
  if (isGameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#fff";
    ctx.font = "24px Arial";
    ctx.fillText("Game Over!", WIDTH / 2 - 60, HEIGHT / 2 - 10);
    ctx.fillText("Score: " + score, WIDTH / 2 - 50, HEIGHT / 2 + 30);
  }
}

/*****************************************
 * 7) 게임 루프
 *****************************************/
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

/*****************************************
 * 8) 초기화 & 시작
 *****************************************/
initPipes();
gameLoop();
