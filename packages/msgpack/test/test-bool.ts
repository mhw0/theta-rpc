import { assert } from "chai";
import { encodeBool, MPBuffer } from "../src";

describe("encodeBool", function () {
  it("true", () => {
    assert.deepEqual(encodeBool(true, MPBuffer.alloc(1)), {
      error: null,
      encbuf: MPBuffer.from([0xc3]),
      bytes: 1,
    });
  });

  it("false", () => {
    assert.deepEqual(encodeBool(false, MPBuffer.alloc(1)), {
      error: null,
      encbuf: MPBuffer.from([0xc2]),
      bytes: 1,
    });
  });
});
