import test from 'tape';
import {BaseError, InvalidRequestError} from '../src';

test('InvalidRequestError', ({ok, is, end}) => {
  const invalidRequestError = new InvalidRequestError();

  ok(invalidRequestError instanceof BaseError);
  is(invalidRequestError.code, -32600);
  is(invalidRequestError.message, 'Invalid Request');

  end();
});
