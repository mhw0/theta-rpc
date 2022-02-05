import test from 'tape';
import {RPCError, InternalError} from '../src';

test('InternalError', ({ok, is, end}) => {
  const internalError = new InternalError();

  ok(internalError instanceof RPCError);
  is(internalError.code, -32603);
  is(internalError.message, 'Internal error');

  end();
});
