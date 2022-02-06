import test from "tape";
import { RPCError, InvalidRequestError } from "../src";

test("InvalidRequestError", ({ ok, deepEqual, end }) => {
  const invalidRequestError = new InvalidRequestError();

  ok(invalidRequestError instanceof RPCError);
  deepEqual(invalidRequestError.jsonrpcError, {
    code: -32600,
    message: "Invalid Request",
  });

  end();
});
