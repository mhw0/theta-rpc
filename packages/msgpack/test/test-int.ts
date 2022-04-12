import { assert } from "chai";
import { MPBuffer, encodeInt } from "../src";

describe("encodeInt", function () {
  it("fixuint", () => {
    assert.deepEqual(encodeInt(0x73, MPBuffer.alloc(5)), {
      error: null,
      encbuf: MPBuffer.from([0x73, 0x00, 0x00, 0x00, 0x00]),
      bytes: 1,
    });
  });

  it("fixint", () => {
    assert.deepEqual(encodeInt(-0x12, MPBuffer.alloc(5)), {
      error: null,
      encbuf: MPBuffer.from([0xee, 0x00, 0x00, 0x00, 0x00]),
      bytes: 1,
    });
  });

  it("uint8", () => {
    assert.deepEqual(encodeInt(0xfb, MPBuffer.alloc(5)), {
      error: null,
      encbuf: MPBuffer.from([0xcc, 0xfb, 0x00, 0x00, 0x00]),
      bytes: 2,
    });
  });

  it("uint16", () => {
    assert.deepEqual(encodeInt(0xffaa, MPBuffer.alloc(5)), {
      error: null,
      encbuf: MPBuffer.from([0xcd, 0xff, 0xaa, 0x00, 0x00]),
      bytes: 3,
    });
  });

  it("uint32", () => {
    assert.deepEqual(encodeInt(0xffffccaa, MPBuffer.alloc(5)), {
      error: null,
      encbuf: MPBuffer.from([0xce, 0xff, 0xff, 0xcc, 0xaa]),
      bytes: 5,
    });
  });

  it("int8", () => {
    assert.deepEqual(encodeInt(-0x27, MPBuffer.alloc(5)), {
      error: null,
      encbuf: MPBuffer.from([0xd0, 0xd9, 0x00, 0x00, 0x00]),
      bytes: 2,
    });
  });

  it("int16", () => {
    assert.deepEqual(encodeInt(-0x18a, MPBuffer.alloc(5)), {
      error: null,
      encbuf: MPBuffer.from([0xd1, 0xfe, 0x76, 0x00, 0x00]),
      bytes: 3,
    });
  });

  it("int32", () => {
    assert.deepEqual(encodeInt(-0x9a3a, MPBuffer.alloc(5)), {
      error: null,
      encbuf: MPBuffer.from([0xd2, 0xff, 0xff, 0x65, 0xc6]),
      bytes: 5,
    });
  });
});
