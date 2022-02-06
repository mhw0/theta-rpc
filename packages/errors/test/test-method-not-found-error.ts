import test from "tape";
import { RPCError, MethodNotFoundError } from "../src";

test("MethodNotFoundError", ({ ok, deepEqual, end }) => {
  const methodNotFoundError = new MethodNotFoundError();

  ok(methodNotFoundError instanceof RPCError);
  deepEqual(methodNotFoundError.jsonrpcError, {
    code: -32601,
    message: "Method not found",
  });

  end();
});
