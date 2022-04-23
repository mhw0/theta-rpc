import { assert } from "chai";
import { encodeArray, MPBuffer } from "../src";

describe("encodeArray", function () {
  it("fixarray15", () => {
    const encbuf = MPBuffer.from([0x91, 1, 0x00, 0x00, 0x00, 0x00]);
    assert.deepEqual(encodeArray([1], MPBuffer.alloc(6), 0, 2), {
      error: null,
      encbuf,
      bytes: 2
    });
  });

  it("array16", () => {
    const arr = new Array(0xffaa).fill(0x01);
    const buf = MPBuffer.alloc(0xffaa + 0x05);

    const encbuf = MPBuffer.alloc(0xffaa + 0x03)
		encbuf.set([0xdc, 0xff, 0xaa, ...arr]);

    const encoded = encodeArray(arr, buf, 0, 2);
    encoded.encbuf = encoded.encbuf.subarray(0, 0xffaa + 0x03);

    assert.deepEqual(encoded, { error: null, encbuf, bytes: 0xffaa + 0x03 });
  });

  it("array32", () => {
    const arr = new Array(0x10000).fill(0x01);
    const buf = MPBuffer.alloc(0x10000 + 0x05);

    const encbuf = MPBuffer.alloc(0x10000 + 0x05)
		encbuf.set([0xdd, 0x00, 0x01, 0x00, 0x00, ...arr]);

    const encoded = encodeArray(arr, buf, 0, 2);
    encoded.encbuf = encoded.encbuf.subarray(0, 0x10000 + 0x05);

    assert.deepEqual(encoded, { error: null, encbuf, bytes: 0x10000 + 0x05 });
  });

  it("MSGPACK_ERR_INVALID_ARRAY", () => {
    const encbuf = MPBuffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    const encoded = encodeArray((1 as unknown) as number[], MPBuffer.alloc(6), 0, 2);

    assert.instanceOf(encoded.error, Error);
    assert.equal(encoded.error!.message, "MSGPACK_ERR_INVALID_ARRAY");
    assert.deepEqual(encoded.encbuf, encbuf);
    assert.equal(encoded.bytes, 0);
  });
});
