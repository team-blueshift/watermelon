# 웹 구현 가이드

## 기술 스택 권장사항

### 최소 구성

```
├── HTML5 Canvas
├── Matter.js (물리 엔진)
├── Vanilla JavaScript/TypeScript
└── Vite (빌드 도구)
```

### 권장 구성

```
├── React / Vue / Svelte (선택)
├── TypeScript
├── Matter.js
├── Vite
├── Tailwind CSS (UI)
└── Howler.js (사운드)
```

## 프로젝트 구조

```
watermelon/
├── public/
│   ├── assets/
│   │   ├── fruits/           # 과일 이미지
│   │   │   ├── cherry.png
│   │   │   ├── strawberry.png
│   │   │   └── ...
│   │   ├── sounds/           # 효과음
│   │   │   ├── drop.mp3
│   │   │   ├── merge.mp3
│   │   │   └── gameover.mp3
│   │   └── background.png
│   └── index.html
├── src/
│   ├── config/
│   │   ├── fruits.ts         # 과일 설정
│   │   ├── physics.ts        # 물리 설정
│   │   └── game.ts           # 게임 설정
│   ├── engine/
│   │   ├── PhysicsEngine.ts  # Matter.js 래퍼
│   │   ├── CollisionHandler.ts
│   │   └── GameLoop.ts
│   ├── entities/
│   │   ├── Fruit.ts
│   │   └── Wall.ts
│   ├── managers/
│   │   ├── GameManager.ts    # 게임 상태 관리
│   │   ├── ScoreManager.ts
│   │   └── InputManager.ts
│   ├── renderer/
│   │   ├── CanvasRenderer.ts
│   │   └── UIRenderer.ts
│   ├── utils/
│   │   ├── random.ts
│   │   └── audio.ts
│   ├── types/
│   │   └── index.ts
│   └── main.ts
├── specs/                     # 스펙 문서 (현재 위치)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 핵심 모듈 구현

### 1. 게임 상태 관리 (GameManager.ts)

```typescript
type GameState = 'READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

interface GameContext {
  state: GameState;
  score: number;
  currentFruit: number;  // 현재 드롭할 과일 레벨
  nextFruit: number;     // 다음 과일 레벨
  canDrop: boolean;      // 드롭 가능 여부
}

class GameManager {
  private context: GameContext;
  private dropCooldown = 500; // ms

  constructor() {
    this.context = {
      state: 'READY',
      score: 0,
      currentFruit: this.getRandomDroppable(),
      nextFruit: this.getRandomDroppable(),
      canDrop: true,
    };
  }

  start() {
    this.context.state = 'PLAYING';
  }

  drop(x: number): Fruit | null {
    if (!this.context.canDrop || this.context.state !== 'PLAYING') {
      return null;
    }

    // 쿨다운 시작
    this.context.canDrop = false;
    setTimeout(() => {
      this.context.canDrop = true;
    }, this.dropCooldown);

    // 과일 생성
    const fruit = createFruit(x, DROP_Y, this.context.currentFruit);

    // 다음 과일로 전환
    this.context.currentFruit = this.context.nextFruit;
    this.context.nextFruit = this.getRandomDroppable();

    return fruit;
  }

  addScore(points: number) {
    this.context.score += points;
  }

  gameOver() {
    this.context.state = 'GAME_OVER';
  }

  private getRandomDroppable(): number {
    return Math.floor(Math.random() * 5) + 1; // 1~5
  }
}
```

### 2. 입력 처리 (InputManager.ts)

```typescript
class InputManager {
  private canvas: HTMLCanvasElement;
  private dropX: number;
  private onDrop: (x: number) => void;

  constructor(canvas: HTMLCanvasElement, onDrop: (x: number) => void) {
    this.canvas = canvas;
    this.dropX = canvas.width / 2;
    this.onDrop = onDrop;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // 마우스 이동
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.dropX = e.clientX - rect.left;
      this.clampDropX();
    });

    // 클릭 (드롭)
    this.canvas.addEventListener('click', () => {
      this.onDrop(this.dropX);
    });

    // 키보드
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        this.onDrop(this.dropX);
      }
      if (e.code === 'ArrowLeft') {
        this.dropX -= 10;
        this.clampDropX();
      }
      if (e.code === 'ArrowRight') {
        this.dropX += 10;
        this.clampDropX();
      }
    });

    // 터치 (모바일)
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.dropX = touch.clientX - rect.left;
      this.clampDropX();
    });

    this.canvas.addEventListener('touchend', () => {
      this.onDrop(this.dropX);
    });
  }

  private clampDropX() {
    const minX = FRUIT_CONFIG[5].radius; // 가장 큰 드롭 과일 기준
    const maxX = this.canvas.width - minX;
    this.dropX = Math.max(minX, Math.min(maxX, this.dropX));
  }

  getDropX(): number {
    return this.dropX;
  }
}
```

### 3. 렌더러 (CanvasRenderer.ts)

```typescript
class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private images: Map<number, HTMLImageElement> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.loadImages();
  }

  private async loadImages() {
    const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    await Promise.all(levels.map(async (level) => {
      const img = new Image();
      img.src = `assets/fruits/${FRUIT_CONFIG[level].name}.png`;
      await img.decode();
      this.images.set(level, img);
    }));
  }

  render(engine: Matter.Engine, gameContext: GameContext) {
    const { ctx } = this;
    const { width, height } = ctx.canvas;

    // 배경 클리어
    ctx.fillStyle = '#FFF8E1';
    ctx.fillRect(0, 0, width, height);

    // 데드라인 표시
    ctx.strokeStyle = '#FF5252';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(0, GAME_CONFIG.deadlineY);
    ctx.lineTo(width, GAME_CONFIG.deadlineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 과일들 렌더링
    const bodies = engine.world.bodies;
    for (const body of bodies) {
      if (body.label?.startsWith('fruit_')) {
        const level = body.plugin?.fruitLevel;
        if (level) {
          this.renderFruit(body, level);
        }
      }
    }

    // 드롭 가이드라인
    this.renderDropGuide(gameContext);

    // 다음 과일 미리보기
    this.renderNextFruit(gameContext.nextFruit);

    // 점수
    this.renderScore(gameContext.score);
  }

  private renderFruit(body: Matter.Body, level: number) {
    const { ctx } = this;
    const { x, y } = body.position;
    const radius = FRUIT_CONFIG[level].radius;
    const img = this.images.get(level);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(body.angle);

    if (img) {
      ctx.drawImage(img, -radius, -radius, radius * 2, radius * 2);
    } else {
      // 이미지 없으면 원으로 대체
      ctx.fillStyle = FRUIT_CONFIG[level].color;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderDropGuide(context: GameContext) {
    // 구현: 현재 드롭 위치에 가이드라인 표시
  }

  private renderNextFruit(level: number) {
    // 구현: 화면 우상단에 다음 과일 미리보기
  }

  private renderScore(score: number) {
    const { ctx } = this;
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
  }
}
```

## 구현 체크리스트

### Phase 1: 기본 구조
- [ ] 프로젝트 초기화 (Vite + TypeScript)
- [ ] Matter.js 설치 및 설정
- [ ] Canvas 렌더링 기본 설정
- [ ] 게임 영역 및 벽 생성

### Phase 2: 과일 시스템
- [ ] 과일 데이터 구조 정의
- [ ] 과일 생성 함수 구현
- [ ] 과일 이미지 로딩
- [ ] 과일 렌더링

### Phase 3: 게임 메커닉
- [ ] 드롭 시스템 구현
- [ ] 마우스/터치 입력 처리
- [ ] 충돌 감지 설정
- [ ] 합성 로직 구현
- [ ] 점수 시스템

### Phase 4: 게임 흐름
- [ ] 게임 상태 관리
- [ ] 데드라인 체크 및 게임오버
- [ ] 재시작 기능
- [ ] 일시정지 기능

### Phase 5: 마무리
- [ ] 사운드 효과
- [ ] 애니메이션 (합성 이펙트)
- [ ] 최고 점수 저장 (localStorage)
- [ ] 모바일 반응형 처리
- [ ] 성능 최적화

## 테스트 체크리스트

### 기능 테스트
- [ ] 과일 정상 낙하
- [ ] 같은 과일 충돌 시 합성
- [ ] 다른 과일 충돌 시 합성 안 됨
- [ ] 점수 정확히 계산
- [ ] 데드라인 초과 시 게임오버
- [ ] 수박 + 수박 소멸

### 엣지 케이스
- [ ] 동시 다중 충돌 처리
- [ ] 연쇄 합성 처리
- [ ] 빠른 연속 드롭 방지
- [ ] 화면 밖으로 나가는 과일 없음

### 크로스 브라우저
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari
- [ ] Chrome Android

## 참고 자료

- [Matter.js 공식 문서](https://brm.io/matter-js/docs/)
- [daxigua 원본 레포](https://github.com/liyupi/daxigua)
- [Matter.js 수박게임 클론](https://github.com/moonfloof/suika-game)
- [Suika Game Wikipedia](https://en.wikipedia.org/wiki/Suika_Game)
