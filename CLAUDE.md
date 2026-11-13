# CLAUDE.md

## 개요
- 메모리 기반 할 일(todo) 관리 모듈. CLI 계층은 아직 없음 (추가 예정)
- Node.js >= 22 (`package.json`의 `engines` 참고), CommonJS, 외부 의존성 없음

## 명령어
- 테스트 전체: `npm test` (= `node --test`)
- 테스트 단일 파일: `node --test test/todo.test.js`
- 빌드·린트·개발 서버: 없음

## 구조
- `src/` — 기능 모듈 (`todo.js`: 할 일 상태와 add/list)
- `test/` — `node:test` 기반 테스트, 파일명 `<모듈>.test.js`

## 코딩 규칙
- CommonJS(`require` / `module.exports`), 2칸 들여쓰기, 세미콜론 사용, 함수·변수는 camelCase
- 새로 작성하거나 수정하는 함수에는 JSDoc 주석을 단다. 요청 없이 기존 코드 스타일을 일괄 수정하지 않는다
- 잘못된 입력은 `TypeError`를 던진다 (조용히 무시하지 않음)
- 내부 상태를 반환할 때는 복사본을 반환한다
- 함수에는 JSDoc 주석을 단다

## 작업 규칙
- 동작을 바꾸면 `test/`에 테스트를 함께 추가하고 `npm test` 통과를 확인한다
- 커밋 메시지: Conventional Commits (`feat:`, `fix:`, `test:`, `chore:`, `docs:`), 본문은 한국어
- 브랜치: `master`에서 `feat/<주제>` 브랜치를 만들어 작업

## 주의사항
- `.env`는 읽거나 출력하지 않는다 (settings의 `permissions.deny`로도 차단됨)
- 상태는 프로세스 메모리에만 있다. 영속화가 필요하면 먼저 방식을 제안하고 확인받는다
- 모든 문서작성, 답변은 한국어로 한다.