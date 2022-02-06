import test from "tape";
import { RPCError } from "../src";

test("RPCError", ({ ok, deepEqual, end }) => {
  const rpcError = new RPCError(-32603, "Internal error", "my data");

  ok(rpcError instanceof Error);
  deepEqual(rpcError.jsonrpcError, {
    code: -32603,
    message: "Internal error",
    data: "my data",
  });

  end();
});
