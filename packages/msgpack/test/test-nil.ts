import { assert } from "chai";
import { MPBuffer, encodeNil } from "../src";

describe("encodeNil", function () {
  it("nil", () => {
    assert.deepEqual(encodeNil(MPBuffer.alloc(1)), {
      error: null,
      encbuf: MPBuffer.from([0xc0]),
      bytes: 1
    });
  });
});
