# 과일 및 점수 시스템

## 과일 종류 (11단계)

### 전체 진화 체계

```
체리(1) → 딸기(2) → 포도(3) → 한라봉(4) → 감(5) → 사과(6) → 배(7) → 복숭아(8) → 파인애플(9) → 멜론(10) → 수박(11)
```

### 과일 상세 스펙

| 단계 | 이름 | 영문명 | 크기(반지름) | 드롭 가능 | 색상 (참고) |
|------|------|--------|-------------|-----------|------------|
| 1 | 체리 | Cherry | 25px | O (20%) | #E53935 |
| 2 | 딸기 | Strawberry | 35px | O (20%) | #D81B60 |
| 3 | 포도 | Grape | 48px | O (20%) | #8E24AA |
| 4 | 한라봉 | Dekopon | 60px | O (20%) | #FF9800 |
| 5 | 감 | Persimmon | 75px | O (20%) | #EF6C00 |
| 6 | 사과 | Apple | 88px | X | #C62828 |
| 7 | 배 | Pear | 102px | X | #C0CA33 |
| 8 | 복숭아 | Peach | 118px | X | #FFAB91 |
| 9 | 파인애플 | Pineapple | 135px | X | #FFD54F |
| 10 | 멜론 | Melon | 155px | X | #66BB6A |
| 11 | 수박 | Watermelon | 180px | X | #43A047 |

> 크기는 기준값이며, 게임 밸런스에 따라 조정 가능

### 크기 비율 시각화

```
체리     ●
딸기     ●●
포도     ●●●
한라봉   ●●●●
감       ●●●●●
사과     ●●●●●●
배       ●●●●●●●
복숭아   ●●●●●●●●
파인애플 ●●●●●●●●●
멜론     ●●●●●●●●●●
수박     ●●●●●●●●●●●●
```

## 점수 시스템

### 점수 공식

**n번째 단계로 합성 시 점수 = `n × (n + 1) / 2`** (삼각수)

### 점수표

| 합성 | 결과 | 점수 | 누적 점수 예시 |
|------|------|------|---------------|
| 체리 + 체리 | 딸기 | **1**점 | 1 |
| 딸기 + 딸기 | 포도 | **3**점 | 1+2 |
| 포도 + 포도 | 한라봉 | **6**점 | 1+2+3 |
| 한라봉 + 한라봉 | 감 | **10**점 | 1+2+3+4 |
| 감 + 감 | 사과 | **15**점 | 1+2+3+4+5 |
| 사과 + 사과 | 배 | **21**점 | 1+2+3+4+5+6 |
| 배 + 배 | 복숭아 | **28**점 | 1+2+3+4+5+6+7 |
| 복숭아 + 복숭아 | 파인애플 | **36**점 | 1+2+3+4+5+6+7+8 |
| 파인애플 + 파인애플 | 멜론 | **45**점 | 1+2+3+4+5+6+7+8+9 |
| 멜론 + 멜론 | 수박 | **55**점 | 1+2+3+4+5+6+7+8+9+10 |
| 수박 + 수박 | 소멸 | **66**점 | 1+2+3+4+5+6+7+8+9+10+11 |

### 점수 계산 코드 예시

```typescript
interface Fruit {
  id: string;
  level: number;  // 1 ~ 11
  name: string;
  radius: number;
}

function calculateMergeScore(fruitLevel: number): number {
  // 합성 후 레벨 기준
  const resultLevel = fruitLevel + 1;
  return (resultLevel * (resultLevel + 1)) / 2;
}

// 예: 체리(1) + 체리(1) → 딸기(2) = (2 * 3) / 2 = 3점... 아니, 1점
// 수정: 합성으로 생성되는 과일의 레벨 기준
function calculateMergeScore(resultLevel: number): number {
  return (resultLevel * (resultLevel - 1)) / 2 + resultLevel;
  // 실제로는 level 기반 삼각수
}

// 간단 버전
const SCORES = [0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66];
function getScore(resultLevel: number): number {
  return SCORES[resultLevel] || 0;
}
```

## 데이터 구조 (구현용)

### TypeScript 타입 정의

```typescript
// 과일 레벨 상수
export const FRUIT_LEVELS = {
  CHERRY: 1,
  STRAWBERRY: 2,
  GRAPE: 3,
  DEKOPON: 4,
  PERSIMMON: 5,
  APPLE: 6,
  PEAR: 7,
  PEACH: 8,
  PINEAPPLE: 9,
  MELON: 10,
  WATERMELON: 11,
} as const;

// 과일 설정
export const FRUIT_CONFIG: Record<number, {
  name: string;
  nameKo: string;
  radius: number;
  color: string;
  droppable: boolean;
}> = {
  1: { name: 'cherry', nameKo: '체리', radius: 25, color: '#E53935', droppable: true },
  2: { name: 'strawberry', nameKo: '딸기', radius: 35, color: '#D81B60', droppable: true },
  3: { name: 'grape', nameKo: '포도', radius: 48, color: '#8E24AA', droppable: true },
  4: { name: 'dekopon', nameKo: '한라봉', radius: 60, color: '#FF9800', droppable: true },
  5: { name: 'persimmon', nameKo: '감', radius: 75, color: '#EF6C00', droppable: true },
  6: { name: 'apple', nameKo: '사과', radius: 88, color: '#C62828', droppable: false },
  7: { name: 'pear', nameKo: '배', radius: 102, color: '#C0CA33', droppable: false },
  8: { name: 'peach', nameKo: '복숭아', radius: 118, color: '#FFAB91', droppable: false },
  9: { name: 'pineapple', nameKo: '파인애플', radius: 135, color: '#FFD54F', droppable: false },
  10: { name: 'melon', nameKo: '멜론', radius: 155, color: '#66BB6A', droppable: false },
  11: { name: 'watermelon', nameKo: '수박', radius: 180, color: '#43A047', droppable: false },
};

// 점수 테이블
export const SCORE_TABLE: number[] = [0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66];

// 드롭 가능한 과일 레벨 (1~5)
export const DROPPABLE_LEVELS = [1, 2, 3, 4, 5];

// 랜덤 드롭 과일 생성
export function getRandomDroppableFruit(): number {
  const index = Math.floor(Math.random() * DROPPABLE_LEVELS.length);
  return DROPPABLE_LEVELS[index];
}
```

## 에셋 요구사항

### 이미지

| 과일 | 파일명 | 크기 (권장) |
|------|--------|------------|
| 체리 | cherry.png | 50x50 |
| 딸기 | strawberry.png | 70x70 |
| 포도 | grape.png | 96x96 |
| 한라봉 | dekopon.png | 120x120 |
| 감 | persimmon.png | 150x150 |
| 사과 | apple.png | 176x176 |
| 배 | pear.png | 204x204 |
| 복숭아 | peach.png | 236x236 |
| 파인애플 | pineapple.png | 270x270 |
| 멜론 | melon.png | 310x310 |
| 수박 | watermelon.png | 360x360 |

> 이미지 크기는 반지름 × 2 기준, 실제 렌더링 시 scale 조정

### 사운드 (선택)

- `drop.mp3` - 과일 드롭 시
- `merge.mp3` - 합성 시
- `gameover.mp3` - 게임오버 시
- `bgm.mp3` - 배경 음악
