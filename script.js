const character = document.querySelector("#character");
const characterMotion = document.querySelector("#characterMotion");

const HOLD_TIME = 300;
const SHRINK_TIME = 220;

const MOVE_X = 45;
const MOVE_Y = 30;
const MOVE_SPEED = 0.00045;

let animationFrame = null;
let holdTimer = null;
let resumeTimer = null;

let isInside = false;
let elapsed = 0;
let previousTime = null;

// 움직임 계산
function moveCharacter(timestamp) {
  if (isInside) {
    animationFrame = null;
    return;
  }

  if (previousTime === null) {
    previousTime = timestamp;
  }

  const delta = timestamp - previousTime;
  previousTime = timestamp;

  elapsed += delta;

  const x = Math.sin(elapsed * MOVE_SPEED) * MOVE_X;
  const y = Math.cos(elapsed * MOVE_SPEED * 0.8) * MOVE_Y;

  characterMotion.style.transform = `translate3d(${x}px, ${y}px, 0)`;

  animationFrame = requestAnimationFrame(moveCharacter);
}

// 움직임 정지
function pauseMovement() {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}

// 움직임 재개
function resumeMovement() {
  if (isInside) return;

  previousTime = null;

  if (animationFrame === null) {
    animationFrame = requestAnimationFrame(moveCharacter);
  }
}

// 타이머 초기화
function clearTimers() {
  clearTimeout(holdTimer);
  clearTimeout(resumeTimer);

  holdTimer = null;
  resumeTimer = null;
}

// 마우스 진입
function handleEnter() {
  isInside = true;

  clearTimers();

  pauseMovement();

  character.classList.add("is-expanded");
}

// 마우스 이탈
function handleLeave() {
  isInside = false;

  clearTimers();

  // 0.3초 동안 확대 상태 유지
  holdTimer = setTimeout(() => {
    character.classList.remove("is-expanded");

    // 축소 완료 후 이동 재개
    resumeTimer = setTimeout(() => {
      resumeMovement();
    }, SHRINK_TIME);
  }, HOLD_TIME);
}

// 마우스 이벤트
character.addEventListener("pointerenter", handleEnter);
character.addEventListener("pointerleave", handleLeave);

// 키보드 이벤트
character.addEventListener("focus", handleEnter);
character.addEventListener("blur", handleLeave);

// 최초 움직임 시작
resumeMovement();
