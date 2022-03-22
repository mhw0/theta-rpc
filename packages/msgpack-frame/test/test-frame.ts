import fs from 'fs';
import path from 'path';
import { assert } from 'chai';
import { MsgpackFrame } from '../src';

const TEST_VECTOR_DUMMY_BIN_PATH = path.resolve(__dirname, 'vectors', 'dummy-bin.bin');
const TEST_VECTOR_DUMMY_ARRAY_PATH = path.resolve(__dirname, 'vectors', 'dummy-array.bin');
const TEST_VECTOR_DUMMY_MAP_PATH = path.resolve(__dirname, 'vectors', 'dummy-map.bin');
const TEST_VECTOR_DUMMY_STR_PATH = path.resolve(__dirname, 'vectors', 'dummy-str.bin');

describe("MsgpackFrame", function() {
  const frameStream = new MsgpackFrame();
  const frameStream2 = new MsgpackFrame({ maxBufferSize: 100 });

  it('bin', (done) => {
    const readable = fs.createReadStream(TEST_VECTOR_DUMMY_BIN_PATH);
    const syncContent = fs.readFileSync(TEST_VECTOR_DUMMY_BIN_PATH);
    readable.pipe(frameStream).once('data', (buffer) => {
      assert.isOk(buffer.equals(syncContent));
      readable.unpipe(frameStream);
      done();
    });
  });

  it('array', (done) => {
    const readable = fs.createReadStream(TEST_VECTOR_DUMMY_ARRAY_PATH);
    const syncContent = fs.readFileSync(TEST_VECTOR_DUMMY_ARRAY_PATH);
    readable.pipe(frameStream).once('data', (buffer) => {
      assert.isOk(buffer.equals(syncContent));
      readable.unpipe(frameStream);
      done();
    });
  });

  it('map', (done) => {
    const readable = fs.createReadStream(TEST_VECTOR_DUMMY_MAP_PATH);
    const syncContent = fs.readFileSync(TEST_VECTOR_DUMMY_MAP_PATH);
    readable.pipe(frameStream).once('data', (buffer) => {
      assert.isOk(buffer.equals(syncContent));
      readable.unpipe(frameStream);
      done();
    });
  });

  it('str', (done) => {
    const readable = fs.createReadStream(TEST_VECTOR_DUMMY_STR_PATH);
    const syncContent = fs.readFileSync(TEST_VECTOR_DUMMY_STR_PATH);
    readable.pipe(frameStream).once('data', (buffer) => {
      assert.isOk(buffer.equals(syncContent));
      readable.unpipe(frameStream);
      done();
    });
  });

  it('MSGPACK_FRAME_ERR_MAX_BUFFER_SIZE_REACHED', (done) => {
    const readable = fs.createReadStream(TEST_VECTOR_DUMMY_BIN_PATH);
    readable.pipe(frameStream2).once('error', (error) => {
      assert.instanceOf(error, Error);
      assert.isOk(error.message, 'MSGPACK_FRAME_ERR_MAX_BUFFER_SIZE_REACHED');
      readable.unpipe(frameStream2);
      done();
    });
  });
});
