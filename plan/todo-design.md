# todo.js 설계 개선 명세

상태: 초안 (구현 보류, 승인 대기)
대상: `src/todo.js`, `test/todo.test.js`

## 1. 배경
- `src/todo.js`는 메모리 기반 todo 모듈이며 `add`, `list`, `remove`를 제공한다.
- 직전 커밋(`fc9b97e`)에서 항목에 `id`(`crypto.randomUUID()`)를 도입했지만, 삭제는 아직 index 기반이다.
- 향후 CLI 계층이 추가될 예정이다. 그 전에 상태 관리와 식별 방식을 정리한다.

## 2. 현재 구조
| 항목 | 현재 동작 |
|---|---|
| 상태 | 모듈 전역 `const todos = []` |
| `add(text)` | 문자열이 아니면 `TypeError`. `{id, text}` 추가 후 복사본 반환 |
| `list()` | 항목 복사본 배열 반환 |
| `remove(index)` | 정수가 아니거나 범위 밖이면 `TypeError`. `splice`한 내부 객체를 그대로 반환 |
| 테스트 정리 | `beforeEach`에서 `remove(0)`를 반복 호출해 목록을 비움 |

## 3. 문제점과 개선 요구사항

### 3.1 id 기반 삭제 (우선순위 1)
**문제**
- index는 앞 항목이 삭제되면 가리키는 대상이 바뀐다. CLI에서 "본 목록 기준으로 삭제"할 때 오삭제 위험이 있다.
- `remove`가 내부 객체를 그대로 반환해 "내부 상태는 복사본 반환" 규칙과 어긋난다.

**요구사항**
- R1-1. 삭제 키를 `id`로 한다: `remove(id)` 또는 `removeById(id)`.
- R1-2. `id`가 문자열이 아니거나 존재하지 않으면 `TypeError`를 던진다.
- R1-3. 삭제된 항목은 복사본(`{ ...removed }`)으로 반환한다.
- R1-4. `remove` 시그니처를 바꿀지 `removeById`를 추가하고 기존 `remove(index)`를 유지할지 결정한다 (6절 질문 1).

### 3.2 상태 캡슐화: 팩토리 분리 (우선순위 2)
**문제**
- 전역 상태 때문에 테스트가 `remove(0)` 반복으로 목록을 비운다. 이 정리 코드가 테스트 대상(`remove`)에 의존하므로 `remove`가 깨지면 모든 테스트가 연쇄 실패한다.
- 인스턴스를 분리할 수 없어 CLI 등 다른 호출부에서 재사용하기 어렵다.

**요구사항**
- R2-1. `createTodoList()`를 추가한다. 반환값은 `{ add, list, remove }`이고 각 호출은 독립된 상태를 가진다.
- R2-2. 기존 `require('../src/todo')`의 `add/list/remove` 호출이 계속 동작하도록 기본 인스턴스를 함께 export한다.
- R2-3. 테스트는 `beforeEach`에서 새 인스턴스를 만들어 쓰고, `remove(0)` 반복 정리를 제거한다.
- R2-4. 영속화는 이 변경 범위에 넣지 않는다. 필요하면 CLAUDE.md에 따라 방식을 먼저 제안하고 확인받는다.

### 3.3 입력 검증과 에러 의미 (우선순위 3)
**문제**
- `add('')`와 `add('   ')`가 통과한다.
- 타입 오류와 값 범위 오류가 모두 `TypeError`다.

**요구사항**
- R3-1. `add`는 `text.trim()`이 빈 문자열이면 `TypeError`를 던진다. 저장할 text에 `trim()`을 적용할지 원문을 유지할지 결정한다 (6절 질문 2).
- R3-2. 3.1을 적용하면 범위 오류가 "존재하지 않는 id"로 바뀌므로 `RangeError` 분리는 하지 않고 `TypeError`를 유지한다. 이것이 CLAUDE.md의 "잘못된 입력은 `TypeError`" 규칙에도 맞는다.

### 3.4 부수 정리 (선택)
- R4-1. 항목 복사를 `copyTodo(item)` 헬퍼로 모은다. 필드가 늘어도 복사 방식이 어긋나지 않게 한다.
- R4-2. JSDoc에 `@typedef {{id: string, text: string}} Todo`를 정의해 반복되는 타입 표기를 줄인다.

## 4. 테스트 명세 (`test/todo.test.js`에 추가·수정)
- `remove(id)`: 지정한 id의 항목을 삭제하고 복사본을 반환한다.
- `remove(id)`: 삭제 후 나머지 항목의 순서가 유지된다.
- `remove(id)`: 존재하지 않는 id와 `undefined`, `null`, 숫자, 객체 입력은 `TypeError`를 던지고 목록은 변하지 않는다.
- `remove(id)`: 반환값을 수정해도 내부 상태에 영향이 없다.
- `createTodoList`: 두 인스턴스가 서로 상태를 공유하지 않는다.
- `createTodoList`: 기본 export의 `add/list/remove`가 기존처럼 동작한다.
- `add`: `''`와 공백만 있는 문자열은 `TypeError`를 던지고 목록은 변하지 않는다.
- 기존 테스트 6개는 새 구조에 맞게 수정하되 검증 의도는 유지한다.

## 5. 비범위
- 영속화(파일, DB), CLI 계층, `done` 상태와 토글 등 신규 기능
- 코드 스타일 일괄 변경 (CLAUDE.md: 요청 없이 기존 스타일을 일괄 수정하지 않음)

## 6. 확정이 필요한 질문
1. 기존 `remove(index)`를 `remove(id)`로 교체해도 되는가, 아니면 `removeById`를 추가하고 `remove(index)`는 유지하는가? (현재 외부 호출부는 테스트뿐이라 교체 비용이 낮다.)
2. 저장하는 `text`에 `trim()`을 적용할 것인가, 원문을 유지하고 검증에만 `trim()`을 쓸 것인가?
3. 3.4 선택 항목(헬퍼, typedef)을 이번 범위에 포함할 것인가?

## 7. 작업 방식과 검증
- `master`에서 `feat/<주제>` 브랜치를 만들어 작업한다. 예: `feat/todo-id-remove`
- 항목별로 커밋을 나눈다. 순서는 3.1 → 3.2 → 3.3이고 Conventional Commits를 쓰며 본문은 한국어로 쓴다.
- 새로 쓰거나 수정하는 함수에는 JSDoc을 단다.
- 각 단계 후 `npm test`로 전체 통과를 확인한다.
