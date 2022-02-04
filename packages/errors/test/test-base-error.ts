import test from 'tape';
import {BaseError} from '../src';

test('BaseError', ({ok, is, end}) => {
  const baseError = new BaseError(-32603, "Internal error", 'my data');

  ok(baseError instanceof Error);
  is(baseError.code, -32603);
  is(baseError.message, 'Internal error');
  is(baseError.data, 'my data');

  end();
});
