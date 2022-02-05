import test from 'tape';
import {RPCError, MethodNotFoundError} from '../src';

test('MethodNotFoundError', ({ok, is, end}) => {
  const methodNotFoundError = new MethodNotFoundError();

  ok(methodNotFoundError instanceof RPCError);
  is(methodNotFoundError.code, -32601);
  is(methodNotFoundError.message, "Method not found");

  end();
});
