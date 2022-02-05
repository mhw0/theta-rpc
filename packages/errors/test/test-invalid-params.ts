import test from 'tape';
import {RPCError, InvalidParamsError} from '../src';

test('InvalidParamsError', ({ok, is, end}) => {
  const invalidParamsError = new InvalidParamsError();

  ok(invalidParamsError instanceof RPCError);
  is(invalidParamsError.code, -32602);
  is(invalidParamsError.message, 'Invalid params');

  end();
});
