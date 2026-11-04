const character = document.querySelector("#character");
const characterMotion = document.querySelector("#characterMotion");
const visual = document.querySelector(".visual");

// 인터랙션 시간
const HOLD_TIME = 600;
const SHRINK_TIME = 220;

// 기본 이동 범위
const MOVE_X = 45;
const MOVE_Y = 30;

// 기본 이동 속도
const MOVE_SPEED = 0.00045;

// 부스트 설정
const BOOST_DURATION = 7000;
const BOOST_MULTIPLIER = 10;

// 마우스 회피 설정
const AVOID_RADIUS = 500;
const AVOID_DISTANCE = 200;
const AVOID_SMOOTHNESS = 0.12;

// 상태 관리
let animationFrame = null;
let holdTimer = null;
let resumeTimer = null;

let isInside = false;

let elapsed = 0;
let previousTime = null;

let boostStartTime = null;

// 마우스 위치
let mouseX = 0;
let mouseY = 0;
let hasPointer = false;

// 회피 이동값
let avoidX = 0;
let avoidY = 0;

// ==============================
// 마우스 위치 추적
// ==============================

window.addEventListener("pointermove", (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;

  hasPointer = true;
});

// ==============================
// 움직임 계산
// ==============================

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

  // ------------------------------
  // 부스트 속도 계산
  // ------------------------------

  let speedMultiplier = 1;
  let boostProgress = 1;

  if (boostStartTime !== null) {
    boostProgress = Math.min((timestamp - boostStartTime) / BOOST_DURATION, 1);

    // 처음에는 빠르고 점차 원래 속도로 감속
    const remaining = 1 - boostProgress;

    speedMultiplier = 1 + (BOOST_MULTIPLIER - 1) * remaining;

    // 부스트 종료
    if (boostProgress >= 1) {
      boostStartTime = null;
    }
  }

  // ------------------------------
  // 기본 이동 계산
  // ------------------------------

  elapsed += delta * MOVE_SPEED * speedMultiplier;

  const baseX = Math.sin(elapsed) * MOVE_X;
  const baseY = Math.cos(elapsed * 0.8) * MOVE_Y;

  // ------------------------------
  // 마우스 회피 계산
  // ------------------------------

  let targetAvoidX = 0;
  let targetAvoidY = 0;

  const isBoosting = boostStartTime !== null;

  if (isBoosting && hasPointer) {
    const visualRect = visual.getBoundingClientRect();

    // 캐릭터의 기본 중심 위치
    const centerX = visualRect.left + visualRect.width / 2 + baseX;

    const centerY = visualRect.top + visualRect.height / 2 + baseY;

    // 마우스와 캐릭터 사이의 거리
    const dx = centerX - mouseX;
    const dy = centerY - mouseY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    // 회피 범위 안에 마우스가 있을 때
    if (distance < AVOID_RADIUS && distance > 0) {
      const influence = 1 - distance / AVOID_RADIUS;

      // 가까울수록 강하게 밀려남
      const force = influence * influence * AVOID_DISTANCE;

      targetAvoidX = (dx / distance) * force;
      targetAvoidY = (dy / distance) * force;
    }
  }

  // ------------------------------
  // 회피 움직임 부드럽게 적용
  // ------------------------------

  avoidX += (targetAvoidX - avoidX) * AVOID_SMOOTHNESS;

  avoidY += (targetAvoidY - avoidY) * AVOID_SMOOTHNESS;

  // ------------------------------
  // 최종 위치 적용
  // ------------------------------

  const finalX = baseX + avoidX;
  const finalY = baseY + avoidY;

  characterMotion.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`;

  // 다음 프레임
  animationFrame = requestAnimationFrame(moveCharacter);
}

// ==============================
// 움직임 정지
// ==============================

function pauseMovement() {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  boostStartTime = null;
}

// ==============================
// 움직임 재개
// ==============================

function resumeMovement() {
  if (isInside) return;

  previousTime = null;

  // 부스트 시작
  boostStartTime = performance.now();

  if (animationFrame === null) {
    animationFrame = requestAnimationFrame(moveCharacter);
  }
}

// ==============================
// 타이머 초기화
// ==============================

function clearTimers() {
  clearTimeout(holdTimer);
  clearTimeout(resumeTimer);

  holdTimer = null;
  resumeTimer = null;
}

// ==============================
// 마우스 진입
// ==============================

function handleEnter() {
  isInside = true;

  clearTimers();

  pauseMovement();

  character.classList.add("is-expanded");
}

// ==============================
// 마우스 이탈
// ==============================

function handleLeave() {
  isInside = false;

  clearTimers();

  // 0.3초 동안 확대 상태 유지
  holdTimer = setTimeout(() => {
    character.classList.remove("is-expanded");

    // 축소 완료 후 부스트 시작
    resumeTimer = setTimeout(() => {
      resumeMovement();
    }, SHRINK_TIME);
  }, HOLD_TIME);
}

// ==============================
// 마우스 이벤트
// ==============================

character.addEventListener("pointerenter", handleEnter);
character.addEventListener("pointerleave", handleLeave);

// ==============================
// 키보드 이벤트
// ==============================

character.addEventListener("focus", handleEnter);
character.addEventListener("blur", handleLeave);

// ==============================
// 최초 실행
// ==============================

resumeMovement();
