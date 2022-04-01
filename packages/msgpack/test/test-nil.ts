import { assert } from 'chai';
import { encodeNil } from '../src';

describe("encodeNil", function() {
  it ("nil", () => {
    assert.deepEqual(encodeNil([]), { error: null, bytes: [0xc0] });
  });
});
