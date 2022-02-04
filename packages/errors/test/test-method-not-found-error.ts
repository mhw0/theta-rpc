import test from 'tape';
import {BaseError, MethodNotFoundError} from '../src';

test('MethodNotFoundError', ({ok, is, end}) => {
  const methodNotFoundError = new MethodNotFoundError();

  ok(methodNotFoundError instanceof BaseError);
  is(methodNotFoundError.code, -32601);
  is(methodNotFoundError.message, "Method not found");

  end();
});
