import test from "tape";
import { RPCError, InvalidParamsError } from "../src";

test("InvalidParamsError", ({ ok, deepEqual, end }) => {
  const invalidParamsError = new InvalidParamsError();

  ok(invalidParamsError instanceof RPCError);
  deepEqual(invalidParamsError.jsonrpcError, {
    code: -32602,
    message: "Invalid params",
  });

  end();
});
