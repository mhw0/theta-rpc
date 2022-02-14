import test from "tape";
import { checkCallObject, checkReplyObject, checkErrorObject } from "../src";

test("checkCallObject", ({ notOk, ok, end }) => {
  notOk(checkCallObject({ jsonrpc: 2 }));
  notOk(checkCallObject({ jsonrpc: "1.0" }));

  notOk(checkCallObject({ jsonrpc: "2.0", method: 3 }));
  ok(checkCallObject({ jsonrpc: "2.0", method: "method" }));

  notOk(checkCallObject({ jsonrpc: "2.0", method: "method", params: "abc" }));
  ok(checkCallObject({ jsonrpc: "2.0", method: "method", params: [1, 2, 3] }));
  ok(
    checkCallObject({
      jsonrpc: "2.0",
      method: "method",
      params: { a: 1, b: 2, c: 3 },
    })
  );

  notOk(checkCallObject({ jsonrpc: "2.0", method: "method", id: true }));
  ok(checkCallObject({ jsonrpc: "2.0", method: "method", id: 1 }));
  ok(checkCallObject({ jsonrpc: "2.0", method: "method", id: "1" }));

  ok(
    checkCallObject({
      jsonrpc: "2.0",
      method: "method",
      params: [1, 2, 3],
      id: 1,
    })
  );

  end();
});

test("checkReplyObject", ({ notOk, ok, end }) => {
  notOk(checkReplyObject({ jsonrpc: 2 }));
  notOk(checkReplyObject({ jsonrpc: "1.0" }));

  notOk(checkReplyObject({ jsonrpc: "2.0", id: true }));
  notOk(
    checkReplyObject({
      jsonrpc: "2.0",
      result: true,
      error: { code: -32000, message: "message" },
    })
  );

  ok(checkReplyObject({ jsonrpc: "2.0", result: true, id: 1 }));

  end();
});

test("checkErrorObject", ({ notOk, ok, end }) => {
  notOk(checkErrorObject({}));
  notOk(checkErrorObject({ code: "1111" }));

  notOk(checkErrorObject({ code: -32000, message: 1 }));
  ok(checkErrorObject({ code: -32000, message: "my message" }));
  ok(checkErrorObject({ code: -32000, message: "my message", data: "data" }));

  end();
});
