const { randomUUID } = require('node:crypto');

const todos = [];

/**
 * 할 일을 추가한다. 각 항목에는 고유한 id가 부여된다.
 * @param {string} text - 할 일 내용
 * @returns {{id: string, text: string}} 추가된 할 일의 복사본
 * @throws {TypeError} text가 문자열이 아닌 경우
 */
function add(text) {
  if (typeof text !== 'string') {
    throw new TypeError('text must be a string');
  }
  const item = { id: randomUUID(), text };
  todos.push(item);
  return { ...item };
}

/**
 * 모든 할 일의 복사본 목록을 반환한다.
 * @returns {Array<{id: string, text: string}>} 할 일 목록 복사본
 */
function list() {
  return todos.map((item) => ({ ...item }));
}

/**
 * 지정한 인덱스의 할 일을 삭제하고 삭제된 항목을 반환한다.
 * @param {number} index - 삭제할 할 일의 0 기반 인덱스
 * @returns {{id: string, text: string}} 삭제된 할 일
 * @throws {TypeError} 인덱스가 정수가 아니거나 범위를 벗어난 경우
 */
function remove(index) {
  if (!Number.isInteger(index) || index < 0 || index >= todos.length) {
    throw new TypeError('index must be an integer within the todo list range');
  }
  return todos.splice(index, 1)[0];
}

module.exports = { add, list, remove };
