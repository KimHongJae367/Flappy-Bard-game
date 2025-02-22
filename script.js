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

// 점프 소리
const jumpSound = new Audio('sound/jump.mp3');

// (추가) 배경 음악
const bgm = new Audio('sound/bgm.mp3');
bgm.loop = true;
bgm.volume = 0.5;  // 볼륨 50%

// 이미지 로딩 확인
let imagesLoaded = 0;
const totalImages = 3;  // 전체 이미지 개수

birdImg.onload = pipeNorthImg.onload = pipeSouthImg.onload = function() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    initGame();
    gameLoop();
  }
};

/********************************
 * 2) 게임 상태 변수
 ********************************/
let birdX, birdY;
let birdSize = 34;
let velocity;
const gravity = 0.5;
const jumpPower = -8;

let pipes = [];
const gap = 200;
const pipeWidth = 52;
const pipeSpeed = 2;

let score;
let isGameOver;

let spawnTimer;
const spawnInterval = 90;

/********************************
 * 3) 게임 초기화 함수
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
 * 4) 점프 함수
 ********************************/
function jump() {
  if (!isGameOver) {
    velocity = jumpPower;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
}

/********************************
 * 5) 게임 종료 시 BGM 정지 또는 서서히 낮추기
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

        // 게임이 끝나면 BGM을 줄이면서 멈추기
        let fadeOut = setInterval(() => {
          if (bgm.volume > 0.05) {
            bgm.volume -= 0.05;
          } else {
            clearInterval(fadeOut);
            bgm.pause();
          }
        }, 200);
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
  }
}

/********************************
 * 6) 리셋 시 BGM 다시 재생
 ********************************/
function resetGame() {
  initGame();
  bgm.currentTime = 0;
  bgm.play();
}

/********************************
 * 7) 게임 루프
 ********************************/
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
