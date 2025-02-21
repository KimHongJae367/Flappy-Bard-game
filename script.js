/********************************
 * 1) 기본 변수 설정
 ********************************/
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const resetBtn = document.getElementById("resetBtn");

const WIDTH = canvas.width;   
const HEIGHT = canvas.height; 

// 새 이미지
const birdImg = new Image();
birdImg.src = "images/bird.png";

// 파이프 이미지
const pipeNorthImg = new Image();
pipeNorthImg.src = "images/north.png";
const pipeSouthImg = new Image();
pipeSouthImg.src = "images/south.png";

// 점프 소리 객체
const jumpSound = new Audio('sounds/jump.mp3');

// 이미지 로드 확인 변수
let imagesLoaded = 0;

/********************************
 * 2) 이미지 로드 완료 후 게임 시작
 ********************************/
birdImg.onload = pipeNorthImg.onload = pipeSouthImg.onload = function() {
  imagesLoaded++;
  if (imagesLoaded === 3) {  // 이미지 3개 모두 로드 완료 시 게임 시작
    initGame();
    gameLoop();
  }
};

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
// 키보드 점프 (Shift 포함)
window.addEventListener("keydown", (e) => {
  if (["Space", "ArrowUp", "ShiftLeft", "ShiftRight"].includes(e.code)) {
    jump();
    e.preventDefault(); // 기본 동작 방지 (Shift 등)
  }
});

// 터치(모바일) 점프
canvas.addEventListener("touchstart", (e) => {
  jump();
  e.preventDefault();
});

// 마우스 클릭 점프
canvas.addEventListener("click", jump);

// 점프 함수
function jump() {
  if (!isGameOver) {
    velocity = jumpPower;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
}

/********************************
 * 5) 리셋 함수
 ********************************/
resetBtn.addEventListener("click", resetGame);

function resetGame() {
  initGame();
}

/********************************
 * 6) 게임 업데이트
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
      isGameOver = true;
    }
  }

  spawnTimer++;
  if (spawnTimer >= spawnInterval) {
    createPipe(WIDTH + 20);
    spawnTimer = 0;
  }

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
