document.addEventListener("DOMContentLoaded", () => {
  // 1) 캔버스/컨텍스트 가져오기
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) {
    console.error("Canvas element with id='gameCanvas' not found!");
    return;
  }
  const ctx = canvas.getContext("2d");

  // 2) 기본 변수
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;

  let birdX = 50;
  let birdY = 150;
  const birdSize = 20;
  let velocity = 0;
  const gravity = 0.5;
  const jumpPower = -8;

  let pipes = [];
  const gap = 100;
  const pipeWidth = 50;
  const pipeSpeed = 2;

  let score = 0;
  let isGameOver = false;

  // 3) 키보드 이벤트
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
      velocity = jumpPower;
    }
  });

  // 4) 파이프 관련 함수
  function initPipes() {
    for (let i = 0; i < 3; i++) {
      createPipe(300 + i * 200);
    }
  }

  function createPipe(xPos) {
    const topHeight = Math.floor(Math.random() * 120) + 40;
    const bottomY = topHeight + gap;

    pipes.push({
      x: xPos,
      topHeight: topHeight,
      bottomY: bottomY,
      passed: false,
    });
  }

  // 5) 메인 업데이트
  function update() {
    if (isGameOver) return;

    // 새 물리 계산
    velocity += gravity;
    birdY += velocity;

    // 파이프 이동
    for (let i = 0; i < pipes.length; i++) {
      let p = pipes[i];
      p.x -= pipeSpeed;

      // 화면 왼쪽 밖으로 사라진 파이프 처리
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

    // 화면 위/아래 경계 충돌
    if (birdY < 0 || birdY + birdSize > HEIGHT) {
      isGameOver = true;
    }
  }

  // 6) 충돌 판정
  function checkCollision(pipe) {
    const birdLeft = birdX;
    const birdRight = birdX + birdSize;
    const birdTop = birdY;
    const birdBottom = birdY + birdSize;

    // 위 파이프
    const pipeTopLeft = pipe.x;
    const pipeTopRight = pipe.x + pipeWidth;
    const pipeTopBottom = pipe.topHeight;
    const collideTop =
      birdRight >= pipeTopLeft &&
      birdLeft <= pipeTopRight &&
      birdTop <= pipeTopBottom;

    // 아래 파이프
    const pipeBottomTop = pipe.bottomY;
    const collideBottom =
      birdRight >= pipeTopLeft &&
      birdLeft <= pipeTopRight &&
      birdBottom >= pipeBottomTop;

    return collideTop || collideBottom;
  }

  // 7) 그리기
  function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // 파이프 (초록색)
    ctx.fillStyle = "green";
    pipes.forEach((p) => {
      // 위
      ctx.fillRect(p.x, 0, pipeWidth, p.topHeight);
      // 아래
      ctx.fillRect(p.x, p.bottomY, pipeWidth, HEIGHT - p.bottomY);
    });

    // 새 (노란 사각형)
    ctx.fillStyle = "#ff0";
    ctx.fillRect(birdX, birdY, birdSize, birdSize);

    // 점수 표시
    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.fillText(`Score: ${score}`, 10, 20);

    // 게임 오버 상태 표시
    if (isGameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = "#fff";
      ctx.font = "24px Arial";
      ctx.fillText("Game Over!", WIDTH / 2 - 60, HEIGHT / 2 - 10);
      ctx.fillText(`Score: ${score}`, WIDTH / 2 - 40, HEIGHT / 2 + 30);
    }
  }

  // 8) 메인 루프
  function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  // 9) 초기화 & 시작
  initPipes();
  gameLoop();
});
