import { Transform, TransformCallback } from 'stream';

const MSGPACK_FRAME_MAX_BUFFER_SIZE = 64 * 1000;

interface MsgpackFrameOptions {
  maxBufferSize?: number;
}

export class MsgpackFrame extends Transform {
  private head: number = 0;
  private buffer: Buffer | null = null;
  private stack: number[] = [];

  constructor(private options?: MsgpackFrameOptions) {
    super();
  }

  private releaseMem(): void {
    this.head = 0;
    this.buffer = null;
  }

  private toHex(int: number): string {
    return "0x" + int.toString(16);
  }

  private decr(): void {
    if (this.stack.length == 0) return;
    const le = this.stack.length - 1;
    if ((this.stack[le] = this.stack[le] - 1) == 0) {
      this.stack.pop();
      this.decr();
    }
  }

  public _transform(chunk: Buffer, _: string, callback: TransformCallback): void {
    if (this.buffer === null)
      this.buffer = Buffer.alloc(0);

    const maxBufferSize =
      this.options?.maxBufferSize || MSGPACK_FRAME_MAX_BUFFER_SIZE;

    if (chunk.length + this.buffer.length > maxBufferSize) {
      this.releaseMem();
      return callback(new Error('MSGPACK_FRAME_ERR_MAX_BUFFER_SIZE_REACHED'));
    }

    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (this.buffer[this.head] != undefined) {
      const { buffer, head } = this;
      let coll = false;

      if (buffer[head] == 0xc0) { // nil
        this.head++;
      } else if (buffer[head] == 0xc2 || buffer[head] == 0xc3) { // bool
        this.head++;
      } else if (buffer[head] >= 0x00 && buffer[head] <= 0x7f) { // fixuint
        this.head++;
      } else if (buffer[head] >= 0xcc && buffer[head] <= 0xce) { // uint8 - uint32
        const sizeslot = 2 ** (buffer[head] - 0xcc);
        this.head += (1 + sizeslot);
      } else if (buffer[head] >= 0xe0 && buffer[head] <= 0xff) { // fixint
        this.head++;
      } else if (buffer[head] >= 0xd0 && buffer[head] <= 0xd2) { // int8 - int32
        const sizeslot = 2 ** (buffer[head] - 0xd0);
        this.head += (1 + sizeslot);
      } else if (buffer[head] >= 0xca && buffer[head] <= 0xcb) { // float 
        const floatsize = (buffer[head] - 0xca) + 1;
        this.head += (1 + (floatsize * 4));
      } else if (buffer[head] >= 0xa0 && buffer[head] <= 0xbf) { // fixstr
        const strsize = buffer[head] & 0x1f;
        this.head += (1 + strsize);
      } else if (buffer[head] >= 0xd9 && buffer[head] <= 0xdb) { // str8 - str32
        const sizeslot = (2 ** (buffer[head] - 0xd9));
        const strsize = buffer.readUIntBE(head + 1, sizeslot);
        this.head += (1 + sizeslot) + strsize;
      } else if (buffer[head] >= 0xc4 && buffer[head] <= 0xc6) { // bin8 - bin32
        const sizeslot = (2 ** (buffer[head] - 0xc4));
        const binsize = buffer.readUIntBE(head + 1, sizeslot);
        this.stack.push(binsize);
        this.head += (1 + sizeslot);
      } else if (buffer[head] >= 0x90 && buffer[head] <= 0x9f) { // fixarray 
        const arrsize = buffer[head] & 0x0f;
        this.stack.push(arrsize);
        this.head++;
        coll = true;
      } else if (buffer[head] >= 0xdc && buffer[head] <= 0xdd) { // array16 - array32
        const sizeslot = 2 * (2 ** ((buffer[head] - 0xdc)));
        const arrsize = buffer.readUIntBE(head + 1, sizeslot);
        this.stack.push(arrsize);
        this.head += (1 + sizeslot);
        coll = true;
      } else if (buffer[head] >= 0x80 && buffer[head] <= 0x8f) { // fixmap
        this.stack.push((buffer[head] & 0x0f) * 2);
        this.head++;
        coll = true;
      } else if (buffer[head] >= 0xde && buffer[head] <= 0xdf) { // map16 - map32
        const sizeslot = 2 * (2 ** ((buffer[head] - 0xde)));
        const mapsize = buffer.readUIntBE(head +  1, sizeslot);
        this.stack.push(mapsize * 2);
        this.head += (1 + sizeslot);
        coll = true;
      } else if (buffer[head] >= 0xd4 && buffer[head] <= 0xd8) { // fixext
        const extsize = 2 ** (8 * ((buffer[head] - 0xd4) + 1)) - 1;
        this.head += (1 + 1 + extsize);
      } else if (buffer[head] >= 0xc7 && buffer[head] <= 0xc9) { // ext8 - ext32
        const sizeslot = 2 ** (buffer[head] - 0xc7);
        const extsize = 2 ** (8 * sizeslot) - 1;
        this.head += (1 + sizeslot + 1 + extsize);
      } else {
        callback(new Error('MSGPACK_FRAME_ERR_INVALID_HEADER: ' + this.toHex(buffer[head])));
        return this.releaseMem();
      }

      if (!coll) this.decr();
    }

    if (this.head <= this.buffer.length && this.stack.length == 0) {
      callback(null, this.buffer);
      return this.releaseMem();
    }

    callback(null);
  }
}
