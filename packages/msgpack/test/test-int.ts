import { assert } from "chai";
import { encodeInt } from "../src";

describe("encodeInt", function() {
  it ("fixuint", () => {
    assert.deepEqual(encodeInt(0x73, []), { error: null, bytes: [0x73] });
  });

  it ("fixint", () => {
    assert.deepEqual(encodeInt(-0x12, []), { error: null, bytes: [0xee] });
  });

  it ("uin8", () => {
    assert.deepEqual(encodeInt(0xfb, []), { error: null, bytes: [0xcc, 0xfb] });
  });

  it ("uin16", () => {
    assert.deepEqual(encodeInt(0xffaa, []), { error: null, bytes: [0xcd, 0xff, 0xaa] });
  });

  it ("uin32", () => {
    assert.deepEqual(encodeInt(0xffffccaa, []), { error: null, bytes: [0xce, 0xff, 0xff, 0xcc, 0xaa] });
  });

  it ("int8", () => {
    assert.deepEqual(encodeInt(-0x27, []), { error: null, bytes: [0xd0, 0xd9] });
  });

  it ("int16", () => {
    assert.deepEqual(encodeInt(-0x18a, []), { error: null, bytes: [0xd1, 0xfe, 0x76] });
  });

  it ("int32", () => {
    assert.deepEqual(encodeInt(-0x9a3a, []), { error: null, bytes: [0xd2, 0xff, 0xff, 0x65, 0xc6] });
  });
});
