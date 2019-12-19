import { MyPromise } from '../src/index';

function init() {
  let p = new MyPromise((resolve, reject) => {});
  return p;
}

test('promise should be constructed correctly', () => {
  expect(init).not.toThrow();
});

test('state should equl FULLFILLED when function resolve been invoked', () => {
  let p = init();
  p.resolve();
  expect(p.state).toEqual('FULLFILLED');
});

test('state should equl REJECTED when function resolve been invoked', () => {
  let p = init();
  p.reject();
  expect(p.state).toEqual('REJECTED');
});
