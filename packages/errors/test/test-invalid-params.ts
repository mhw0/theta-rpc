import test from 'tape';
import {BaseError, InvalidParamsError} from '../src';

test('InvalidParamsError', ({ok, is, end}) => {
  const invalidParamsError = new InvalidParamsError();

  ok(invalidParamsError instanceof BaseError);
  is(invalidParamsError.code, -32602);
  is(invalidParamsError.message, 'Invalid params');

  end();
});
