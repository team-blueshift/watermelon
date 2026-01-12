# 물리 엔진 스펙

## 권장 물리 엔진

### Matter.js (권장)

웹 기반 2D 물리 시뮬레이션에 가장 적합한 라이브러리입니다.

```bash
npm install matter-js
npm install @types/matter-js  # TypeScript 사용 시
```

**장점**
- 순수 JavaScript, 의존성 없음
- 활발한 커뮤니티 및 문서화
- 원형 충돌체 지원
- 이벤트 기반 충돌 감지

**대안**
- Planck.js (Box2D 포팅)
- p2.js

## 물리 세계 설정

### 기본 설정값

```typescript
import Matter from 'matter-js';

const { Engine, World, Bodies, Body, Events } = Matter;

// 엔진 생성
const engine = Engine.create({
  gravity: {
    x: 0,
    y: 1,      // 중력 방향 (아래)
    scale: 0.001  // 중력 강도 (조절 가능)
  }
});

// 게임 영역 크기
const GAME_CONFIG = {
  width: 400,       // 게임 영역 너비
  height: 600,      // 게임 영역 높이
  wallThickness: 20, // 벽 두께
  deadlineY: 100,   // 데드라인 Y 좌표
};
```

### 물리 속성 상수

```typescript
const PHYSICS_CONFIG = {
  // 중력
  gravity: 1,
  gravityScale: 0.001,

  // 과일 물리 속성
  fruit: {
    friction: 0.1,        // 마찰력 (0~1)
    frictionAir: 0.01,    // 공기 저항
    restitution: 0.2,     // 반발력/탄성 (0~1, 0=반발없음, 1=완전탄성)
    density: 0.001,       // 밀도 (질량 결정)
    slop: 0.01,           // 충돌 허용 오차
  },

  // 벽 물리 속성
  wall: {
    isStatic: true,       // 정적 객체 (움직이지 않음)
    friction: 0.3,
    restitution: 0.1,
  },
};
```

## 충돌체 (Collision Bodies)

### 과일 - 원형 충돌체

```typescript
function createFruit(x: number, y: number, level: number): Matter.Body {
  const config = FRUIT_CONFIG[level];

  return Bodies.circle(x, y, config.radius, {
    label: `fruit_${level}`,       // 충돌 식별용 라벨
    restitution: PHYSICS_CONFIG.fruit.restitution,
    friction: PHYSICS_CONFIG.fruit.friction,
    frictionAir: PHYSICS_CONFIG.fruit.frictionAir,
    density: PHYSICS_CONFIG.fruit.density,
    render: {
      sprite: {
        texture: `assets/${config.name}.png`,
        xScale: 1,
        yScale: 1,
      }
    },
    // 커스텀 데이터
    plugin: {
      fruitLevel: level,
    }
  });
}
```

### 벽 - 직사각형 정적 충돌체

```typescript
function createWalls(): Matter.Body[] {
  const { width, height, wallThickness } = GAME_CONFIG;

  // 바닥
  const floor = Bodies.rectangle(
    width / 2,
    height + wallThickness / 2,
    width + wallThickness * 2,
    wallThickness,
    { isStatic: true, label: 'floor' }
  );

  // 왼쪽 벽
  const leftWall = Bodies.rectangle(
    -wallThickness / 2,
    height / 2,
    wallThickness,
    height,
    { isStatic: true, label: 'wall_left' }
  );

  // 오른쪽 벽
  const rightWall = Bodies.rectangle(
    width + wallThickness / 2,
    height / 2,
    wallThickness,
    height,
    { isStatic: true, label: 'wall_right' }
  );

  return [floor, leftWall, rightWall];
}
```

## 충돌 감지 및 합성

### 충돌 이벤트 처리

```typescript
// 합성 대기 큐 (동시 충돌 방지)
const mergeQueue: Set<string> = new Set();

Events.on(engine, 'collisionStart', (event) => {
  const pairs = event.pairs;

  for (const pair of pairs) {
    const bodyA = pair.bodyA;
    const bodyB = pair.bodyB;

    // 두 바디 모두 과일인지 확인
    if (!isFruit(bodyA) || !isFruit(bodyB)) continue;

    // 같은 레벨인지 확인
    const levelA = bodyA.plugin?.fruitLevel;
    const levelB = bodyB.plugin?.fruitLevel;

    if (levelA !== levelB) continue;

    // 이미 처리 중인 과일인지 확인 (동시 충돌 방지)
    if (mergeQueue.has(bodyA.id.toString()) ||
        mergeQueue.has(bodyB.id.toString())) {
      continue;
    }

    // 합성 예약
    mergeQueue.add(bodyA.id.toString());
    mergeQueue.add(bodyB.id.toString());

    // 합성 처리
    handleMerge(bodyA, bodyB, levelA);
  }
});

function handleMerge(bodyA: Matter.Body, bodyB: Matter.Body, level: number) {
  // 합성 위치 계산 (두 과일의 중간점)
  const mergeX = (bodyA.position.x + bodyB.position.x) / 2;
  const mergeY = (bodyA.position.y + bodyB.position.y) / 2;

  // 기존 과일 제거
  World.remove(engine.world, [bodyA, bodyB]);

  // 수박+수박은 소멸만 (새 과일 생성 안 함)
  if (level === 11) {
    addScore(SCORE_TABLE[11]); // 66점
    playSound('merge');
    // 합성 큐에서 제거
    mergeQueue.delete(bodyA.id.toString());
    mergeQueue.delete(bodyB.id.toString());
    return;
  }

  // 상위 레벨 과일 생성
  const newLevel = level + 1;
  const newFruit = createFruit(mergeX, mergeY, newLevel);
  World.add(engine.world, newFruit);

  // 점수 추가
  addScore(SCORE_TABLE[newLevel]);

  // 이펙트
  playSound('merge');
  showMergeEffect(mergeX, mergeY);

  // 합성 큐에서 제거
  mergeQueue.delete(bodyA.id.toString());
  mergeQueue.delete(bodyB.id.toString());
}

function isFruit(body: Matter.Body): boolean {
  return body.label?.startsWith('fruit_') ?? false;
}
```

## 게임오버 판정

### 데드라인 체크

```typescript
let deadlineTimer: number | null = null;
const DEADLINE_GRACE_PERIOD = 2000; // 2초 유예

function checkDeadline() {
  const fruits = engine.world.bodies.filter(isFruit);

  const isOverDeadline = fruits.some(fruit => {
    // 과일 상단이 데드라인을 넘었는지
    const fruitTop = fruit.position.y - (fruit.plugin?.fruitLevel
      ? FRUIT_CONFIG[fruit.plugin.fruitLevel].radius
      : 0);
    return fruitTop < GAME_CONFIG.deadlineY;
  });

  if (isOverDeadline) {
    if (deadlineTimer === null) {
      // 타이머 시작
      deadlineTimer = setTimeout(() => {
        gameOver();
      }, DEADLINE_GRACE_PERIOD);
    }
  } else {
    // 데드라인 벗어남 - 타이머 취소
    if (deadlineTimer !== null) {
      clearTimeout(deadlineTimer);
      deadlineTimer = null;
    }
  }
}

// 매 프레임 체크
Events.on(engine, 'afterUpdate', checkDeadline);
```

## 물리 시뮬레이션 루프

### 게임 루프 설정

```typescript
const TARGET_FPS = 60;
const FIXED_DELTA = 1000 / TARGET_FPS;

let lastTime = 0;

function gameLoop(timestamp: number) {
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  // 물리 엔진 업데이트
  Engine.update(engine, FIXED_DELTA);

  // 렌더링
  render();

  // 다음 프레임 예약
  requestAnimationFrame(gameLoop);
}

// 게임 시작
requestAnimationFrame(gameLoop);
```

## 튜닝 가이드

### 게임 느낌 조절

| 속성 | 낮은 값 | 높은 값 | 권장 |
|------|---------|---------|------|
| gravity | 느린 낙하 | 빠른 낙하 | 1.0 |
| restitution | 덜 튕김 | 많이 튕김 | 0.2 |
| friction | 미끄러움 | 뻑뻑함 | 0.1 |
| frictionAir | 빠른 이동 | 공기 저항 | 0.01 |

### 성능 최적화

```typescript
// 수면 상태 활성화 (움직이지 않는 과일 CPU 절약)
const engine = Engine.create({
  enableSleeping: true,
});

// 특정 거리 이하 충돌만 계산
engine.positionIterations = 6;  // 기본값
engine.velocityIterations = 4;  // 기본값
```
