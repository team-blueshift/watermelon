# 수박게임 (Suika Game) 스펙 문서

웹 개발자를 위한 수박게임 구현 스펙 문서입니다.

## 문서 목차

| 문서 | 설명 |
|------|------|
| [game-rules.md](./game-rules.md) | 게임 규칙 및 메커닉 |
| [fruits-and-scoring.md](./fruits-and-scoring.md) | 과일 종류, 크기, 점수 시스템 |
| [physics-spec.md](./physics-spec.md) | 물리 엔진 및 충돌 처리 |
| [implementation-guide.md](./implementation-guide.md) | 웹 구현 가이드 |

## 게임 요약

- **장르**: 낙하 + 합성 퍼즐 게임
- **목표**: 과일을 합성하여 수박을 만들고 최고 점수 달성
- **게임오버 조건**: 과일이 상단 경계선을 초과

## 빠른 참조

```
과일 진화: 체리 → 딸기 → 포도 → 한라봉 → 감 → 사과 → 배 → 복숭아 → 파인애플 → 멜론 → 수박
드롭 가능: 체리 ~ 감 (1~5단계)
점수 공식: n번째 과일 합성 시 n*(n+1)/2
```
