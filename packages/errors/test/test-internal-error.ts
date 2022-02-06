import test from "tape";
import { RPCError, InternalError } from "../src";

test("InternalError", ({ ok, deepEqual, end }) => {
  const internalError = new InternalError();

  ok(internalError instanceof RPCError);
  deepEqual(internalError.jsonrpcError, {
    code: -32603,
    message: "Internal error",
  });

  end();
});
