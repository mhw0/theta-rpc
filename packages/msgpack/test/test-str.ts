import { assert } from "chai";
import { encodeStr } from "../src";

describe("encodeStr", function () {
  it("str", () => {
    const encoded = encodeStr("🦔 hedgehog", []);
    assert.deepEqual(encoded, {
      error: null,
      bytes: [
        0xad, 0xf0, 0x9f, 0xa6, 0x94, 0x20, 0x68, 0x65, 0x64, 0x67, 0x65, 0x68,
        0x6f, 0x67,
      ],
    });
  });

  it("MSGPACK_STR_INVALID_SURROGATE_PAIRS", () => {
    const encoded = encodeStr("\ud83ek", []);
    assert.instanceOf(encoded.error, Error);
    assert.equal(encoded.error!.message, "MSGPACK_STR_INVALID_SURROGATE_PAIRS");
  });
});
