import test from 'tape';
import {RPCError, ParseError} from '../src';

test('ParseError', ({ok, is, end}) => {
  const parseError = new ParseError();

  ok(parseError instanceof RPCError);
  is(parseError.code, -32700);
  is(parseError.message, 'Parse error');

  end();
});
