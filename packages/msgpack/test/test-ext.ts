import { assert } from "chai";
import { encodeExt, MPBuffer } from "../src";

describe("encodeExt", function () {
  it("fixext1", () => {
    const buf = MPBuffer.alloc(1).fill(0xff);
    assert.deepEqual(encodeExt(0x01, buf, MPBuffer.alloc(7)), {
      error: null,
      encbuf: MPBuffer.from([0xd4, 0x01, 0xff, 0x00, 0x00, 0x00, 0x00]),
      bytes: 3,
    });
  });

  it("fixext2", () => {
    const buf = MPBuffer.alloc(2).fill(0xff);
    assert.deepEqual(encodeExt(0x02, buf, MPBuffer.alloc(8)), {
      error: null,
      encbuf: MPBuffer.from([0xd5, 0x02, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00]),
      bytes: 4,
    });
  });

  it("fixext4", () => {
    const buf = MPBuffer.alloc(4).fill(0xff);
    assert.deepEqual(encodeExt(0x03, buf, MPBuffer.alloc(10)), {
      error: null,
      encbuf: MPBuffer.from([
        0xd6, 0x03, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00,
      ]),
      bytes: 6,
    });
  });

  it("fixext8", () => {
    const buf = MPBuffer.alloc(8).fill(0xff);
    assert.deepEqual(encodeExt(0x04, buf, MPBuffer.alloc(14)), {
      error: null,
      encbuf: MPBuffer.from([
        0xd7, 0x04, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00,
        0x00, 0x00,
      ]),
      bytes: 10,
    });
  });

  it("fixext16", () => {
    const buf = MPBuffer.alloc(16).fill(0xff);
    assert.deepEqual(encodeExt(0x05, buf, MPBuffer.alloc(22)), {
      error: null,
      encbuf: MPBuffer.from([
        0xd8, 0x05, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00,
      ]),
      bytes: 18,
    });
  });

  it("ext8", () => {
    const buf = MPBuffer.alloc(0xff).fill(0xff);
    const encbuf = MPBuffer.alloc(0xff + 0x06);
    encbuf.set([0xc7, 0xff, 0x06, ...buf]);

    assert.deepEqual(encodeExt(0x06, buf, MPBuffer.alloc(0xff + 0x6)), {
      error: null,
      encbuf,
      bytes: 0xff + 0x03,
    });
  });

  it("ext16", () => {
    const buf = MPBuffer.alloc(0xffaa).fill(0xff);
    const encbuf = MPBuffer.alloc(0xffaa + 0x06);
    encbuf.set([0xc8, 0xff, 0xaa, 0x07, ...buf]);

    assert.deepEqual(encodeExt(0x07, buf, MPBuffer.alloc(0xffaa + 0x6)), {
      error: null,
      encbuf,
      bytes: 0xffaa + 0x04,
    });
  });

  it("ext32", () => {
    const buf = MPBuffer.alloc(0x1fffe).fill(0xff);
    const encbuf = MPBuffer.alloc(0x1fffe + 0x06);
    encbuf.set([0xc9, 0x00, 0x01, 0xff, 0xfe, 0x08, ...buf]);

    assert.deepEqual(encodeExt(0x08, buf, MPBuffer.alloc(0x1fffe + 0x06)), {
      error: null,
      encbuf,
      bytes: 0x1fffe + 0x06,
    });
  });

  it("MSGPACK_ERR_INVALID_EXT_TYPE", () => {
    const buf = MPBuffer.alloc(1).fill(0xff);
    const encbuf = MPBuffer.alloc(7);
    const encoded = encodeExt(0xffff, buf, encbuf);

    assert.instanceOf(encoded.error, Error);
    assert.equal(encoded.error!.message, "MSGPACK_ERR_INVALID_EXT_TYPE");
    assert.deepEqual(encoded.encbuf, encbuf);
    assert.equal(encoded.bytes, 0);
  });
});
