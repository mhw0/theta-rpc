import test from "tape";
import { RPCError, ParseError } from "../src";

test("ParseError", ({ ok, deepEqual, end }) => {
  const parseError = new ParseError();

  ok(parseError instanceof RPCError);
  deepEqual(parseError.jsonrpcError, {
    code: -32700,
    message: "Parse error",
  });

  end();
});
