import test from 'tape';
import { getMsg } from '../src';

test('say_hi', ({ equal, end }) => {
  equal(getMsg(), 'hi');
  end();
});
