import { assert } from "chai";
import { encodeBin, MPBuffer } from "../src";

describe("encodeBin", function () {
  it("bin8", () => {
    const buf = MPBuffer.alloc(4).fill(0xff);
    assert.deepEqual(encodeBin(buf, MPBuffer.alloc(9)), {
      error: null,
      encbuf: MPBuffer.from([0xc4, 0x04, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00]),
      bytes: 6,
    });
  });

  it ("bin16", () => {
    const buf = MPBuffer.alloc(0xffff).fill(0xff);
    const encbuf = MPBuffer.alloc(0xffff + 0x05);
    encbuf.set([0xc5, 0xff, 0xff, ...buf]);

    assert.deepEqual(encodeBin(buf, MPBuffer.alloc(0xffff + 0x05)), {
      error: null,
      encbuf,
      bytes: 0xffff + 0x03
    });
  });

  it ("bin32", () => {
    const buf = MPBuffer.alloc(0x1000000).fill(0xff);
    const encbuf = MPBuffer.alloc(0x1000000 + 0x05);
    encbuf.set([0xc5, 0x01, 0x00, 0x00, 0x00, ...buf]);

    assert.deepEqual(encodeBin(buf, MPBuffer.alloc(0x1000000 + 0x05)), {
      error: null,
      encbuf,
      bytes: 0x1000000 + 0x05
    });
  });
});
