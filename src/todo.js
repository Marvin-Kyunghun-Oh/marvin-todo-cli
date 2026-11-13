const todos = [];
function add(t){ todos.push(t) }
function list(){ return todos }
module.exports = { add, list };
