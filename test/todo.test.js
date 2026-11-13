const { test, beforeEach } = require('node:test');
const assert = require('node:assert');

const todo = require('../src/todo');

const texts = () => todo.list().map((item) => item.text);

beforeEach(() => {
  // 모듈 상태가 프로세스 메모리에 있으므로 매 테스트 전에 비운다
  while (todo.list().length > 0) {
    todo.remove(0);
  }
});

test('add: id(UUID)와 text를 가진 항목을 추가하고 반환한다', () => {
  const item = todo.add('a');
  assert.strictEqual(item.text, 'a');
  assert.match(
    item.id,
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
  );
  assert.deepStrictEqual(todo.list(), [item]);
});

test('add: 항목마다 서로 다른 id가 부여된다', () => {
  const a = todo.add('same');
  const b = todo.add('same');
  assert.notStrictEqual(a.id, b.id);
});

test('add: 문자열이 아닌 입력은 TypeError를 던진다', () => {
  for (const bad of [undefined, null, 1, {}, []]) {
    assert.throws(() => todo.add(bad), TypeError);
  }
  assert.strictEqual(todo.list().length, 0);
});

test('list/add: 반환값을 수정해도 내부 상태에 영향이 없다', () => {
  const added = todo.add('a');
  added.text = 'changed';
  todo.list()[0].text = 'changed';
  todo.list().push({ id: 'x', text: 'x' });
  assert.deepStrictEqual(texts(), ['a']);
});

test('remove: 지정한 인덱스의 항목을 삭제하고 반환한다', () => {
  todo.add('a');
  const b = todo.add('b');
  todo.add('c');
  assert.deepStrictEqual(todo.remove(1), b);
  assert.deepStrictEqual(texts(), ['a', 'c']);
});

test('remove: 잘못된 인덱스는 TypeError를 던진다', () => {
  todo.add('a');
  for (const bad of [-1, 1, 0.5, '0', NaN, undefined]) {
    assert.throws(() => todo.remove(bad), TypeError);
  }
  assert.deepStrictEqual(texts(), ['a']);
});
