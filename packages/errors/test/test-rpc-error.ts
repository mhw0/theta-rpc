import test from 'tape';
import {RPCError} from '../src';

test('RPCError', ({ok, is, end}) => {
  const rpcError = new RPCError(-32603, "Internal error", 'my data');

  ok(rpcError instanceof Error);
  is(rpcError.code, -32603);
  is(rpcError.message, 'Internal error');
  is(rpcError.data, 'my data');

  end();
});
