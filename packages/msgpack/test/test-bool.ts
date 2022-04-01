import { assert } from 'chai';
import { encodeBool } from '../src';

describe("encodeBool", function() {
  it ("true", () => {
    assert.deepEqual(encodeBool(true, []), { error: null, bytes: [0xc3] });
  });

  it ("false", () => {
    assert.deepEqual(encodeBool(false, []), { error: null, bytes: [0xc2] });
  });
});
