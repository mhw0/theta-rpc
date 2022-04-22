import {
  MSGPACK_FMT_NIL,
  MSGPACK_FMT_BOOL_TRUE,
  MSGPACK_FMT_BOOL_FALSE,
  MSGPACK_FMT_UINT8,
  MSGPACK_FMT_UINT16,
  MSGPACK_FMT_UINT32,
  MSGPACK_FMT_INT8,
  MSGPACK_FMT_INT16,
  MSGPACK_FMT_INT32,
  MSGPACK_FMT_STR8,
  MSGPACK_FMT_STR16,
  MSGPACK_FMT_STR32,
  MSGPACK_FMT_BIN8,
  MSGPACK_FMT_BIN16,
  MSGPACK_FMT_BIN32,
  MSGPACK_FMT_FIXEXT1,
  MSGPACK_FMT_FIXEXT2,
  MSGPACK_FMT_FIXEXT4,
  MSGPACK_FMT_FIXEXT8,
  MSGPACK_FMT_FIXEXT16,
  MSGPACK_FMT_EXT8,
  MSGPACK_FMT_EXT16,
  MSGPACK_FMT_EXT32
} from "./fmt";
import { MPBuffer } from "./buffer";

export interface EncodeOp {
  error: Error | null;
  encbuf: MPBuffer;
  bytes: number;
}

function setu8(buf: MPBuffer, u8: number, offset: number): void {
  buf[offset] = u8;
}

function expand(buf: MPBuffer, offset: number, need: number): MPBuffer {
	if (buf.length - offset >= need) return buf;

	return MPBuffer.expand(buf, need - (buf.length - offset));
}

export function encodeNil(encbuf: MPBuffer, offset = 0): EncodeOp {
  const tmp = offset;
  encbuf = expand(encbuf, offset, 1);

  setu8(encbuf, MSGPACK_FMT_NIL, offset++);

  return { error: null, encbuf, bytes: offset - tmp };
}

export function encodeBool(bool: boolean, encbuf: MPBuffer, offset = 0): EncodeOp {
  const tmp = offset;

  encbuf = expand(encbuf, offset, 1);

  setu8(encbuf, bool ? MSGPACK_FMT_BOOL_TRUE : MSGPACK_FMT_BOOL_FALSE, offset++);
  return { error: null, encbuf, bytes: offset - tmp };
}

export function encodeInt(int: number, encbuf: MPBuffer, offset = 0): EncodeOp {
  const tmp = offset;

  encbuf = expand(encbuf, offset, 5);

  if (int >= 0x00 && int <= 0x7f) { // fixuint
    setu8(encbuf, int, offset++);
  } else if (int >= -0x20 && int < 0x00) { // fixint
    setu8(encbuf, int & 0xff, offset++);
  } else if (int >= 0x00 && int <= 0xff) { // uint8
    setu8(encbuf, MSGPACK_FMT_UINT8, offset++);
    setu8(encbuf, int, offset++);
  } else if (int > 0xff && int <= 0xffff) { // uint16
    setu8(encbuf, MSGPACK_FMT_UINT16, offset++);
    setu8(encbuf, int >> 8, offset++);
    setu8(encbuf, int & 0xff, offset++);
  } else if (int > 0xffff && int <= 0xffffffff) { // uint32
    setu8(encbuf, MSGPACK_FMT_UINT32, offset++);
    setu8(encbuf, (int >> 24) & 0xff, offset++);
    setu8(encbuf, (int >> 16) & 0xff, offset++);
    setu8(encbuf, (int >> 8) & 0xff, offset++);
    setu8(encbuf, int & 0xff, offset++);
  } else if (int >= -0x80 && int <= 0x7f) { // int8
    setu8(encbuf, MSGPACK_FMT_INT8, offset++);
    setu8(encbuf, int & 0xff, offset++);
  } else if (int >= -0x8000 && int <= 0x7fff) { // int16
    setu8(encbuf, MSGPACK_FMT_INT16, offset++);
    setu8(encbuf, (int >> 8) & 0xff, offset++);
    setu8(encbuf, int & 0xff, offset++);
  } else if (int >= -0x80000000 && int <= 0x7fffffff) { // int32
    setu8(encbuf, MSGPACK_FMT_INT32, offset++);
    setu8(encbuf, (int >> 24) & 0xff, offset++);
    setu8(encbuf, (int >> 16) & 0xff, offset++);
    setu8(encbuf, (int >> 8) & 0xff, offset++);
    setu8(encbuf, int & 0xff, offset++);
  }

  return { error: null, encbuf, bytes: offset - tmp };
}

export function encodeStr(str: string, encbuf: MPBuffer, offset = 0): EncodeOp {
  const tmp = offset;
  const len = str.length;

  encbuf = expand(encbuf, offset, len * 4 + 5);

  const buf = MPBuffer.alloc(len * 4 + 5);

  function utf8eproc(codep: number): void {
    if (codep >= 0x0000 && codep <= 0x007f) { // U+0000 - U+007F
      setu8(buf, codep, offset++); // 0xxxxxxx
    } else if (codep >= 0x0080 && codep <= 0x07ff) { // U+0080 - U+07FF
      setu8(buf, 0xc0 | (codep >> 6), offset++);   // 110xxxxx
      setu8(buf, 0x80 | (codep & 0x3f), offset++); // 10xxxxxx
    } else if (codep >= 0x0800 && codep <= 0xffff) { // U+0800 - U+FFFF
      setu8(buf, 0xe0 | (codep >> 12) & 0x0f, offset++);  // 1110xxxx
      setu8(buf, 0x80 | ((codep >> 6) & 0x3f), offset++); // 10xxxxxx
      setu8(buf, 0x80 | (codep & 0x3f), offset++);        // 10xxxxxx
    } else if (codep >= 0x10000 && codep <= 0x10ffff) { // U+10000 - U+10FFFF
      setu8(buf, 0xf0 | ((codep >> 18) & 0x07), offset++); // 11110xxx
      setu8(buf, 0x80 | ((codep >> 12) & 0x3f), offset++); // 10xxxxxx
      setu8(buf, 0x80 | ((codep >> 6) & 0x3f), offset++);  // 10xxxxxx
      setu8(buf, 0x80 | (codep & 0x3f), offset++);         // 10xxxxxx
    }
  }

  let tmpcodep = 0;
  function cpeproc(char: string | undefined): void {
    if (!char) return;
    const codep = char.charCodeAt(0);
    if (tmpcodep) {
      if (codep >= 0xdc00 && codep <= 0xdfff) {
        const kcodep = (tmpcodep - 0xd800) * 0x0400 + (codep - 0xdc00) + 0x10000;
        utf8eproc(kcodep);
        tmpcodep = 0;
        return;
      }
      utf8eproc(0xfffd);
    } else if (codep >= 0xd800 && codep <= 0xdbff) {
      tmpcodep = codep;
      return;
    }

    utf8eproc(codep);
  }

  let rem = (len % 4);
  let iters = (len - rem) / 4;
  let k = 0;

  for(; rem > 0; rem--) {
    cpeproc(str[k++]);
  }

  for(; iters > 0; iters--) {
    cpeproc(str[k++]);
    cpeproc(str[k++]);
    cpeproc(str[k++]);
    cpeproc(str[k++]);
  }

  const enclen = offset - tmp;

  let hoffset = tmp;
  if (enclen <= 0x1f) {
    setu8(encbuf, 0xa0 | enclen, hoffset++);
  } else if (enclen <= 0xff) {
    setu8(encbuf, MSGPACK_FMT_STR8, hoffset++);
    setu8(encbuf, enclen, hoffset++);
  } else if (enclen <= 0xffff) {
    setu8(encbuf, MSGPACK_FMT_STR16, hoffset++);
    setu8(encbuf, (enclen >> 8) & 0xff, hoffset++);
    setu8(encbuf, enclen & 0xff, hoffset++);
  } else if (enclen <= 0xffffffff) {
    setu8(encbuf, MSGPACK_FMT_STR32, hoffset);
    setu8(encbuf, (enclen >> 24) & 0xff, hoffset++);
    setu8(encbuf, (enclen >> 16) & 0xff, hoffset++);
    setu8(encbuf, (enclen >> 8) & 0xff, hoffset++);
    setu8(encbuf, enclen & 0xff, hoffset++);
  }

  const sbuf = buf.subarray(0, offset - tmp);
  encbuf.set(sbuf, hoffset - tmp);

  return { error: null, encbuf, bytes: hoffset + offset };
}

export function encodeBin(bin: Uint8Array, encbuf: MPBuffer, offset = 0): EncodeOp {
  const len = bin.byteLength;
  const tmp = offset;

  encbuf = expand(encbuf, offset, len + 5);

  if (len <= 0xff) {
    setu8(encbuf, MSGPACK_FMT_BIN8, offset++);
    setu8(encbuf, len, offset++);
  } else if (len <= 0xffff) {
    setu8(encbuf, MSGPACK_FMT_BIN16, offset++)
    setu8(encbuf, (len >> 8) & 0xff, offset++)
    setu8(encbuf, len & 0xff, offset++)
  } else if (len <= 0xffffffff) {
    setu8(encbuf, MSGPACK_FMT_BIN16, offset++)
    setu8(encbuf, (len >> 24) & 0xff, offset++)
    setu8(encbuf, (len >> 16) & 0xff, offset++)
    setu8(encbuf, (len >> 8) & 0xff, offset++)
    setu8(encbuf, len & 0xff, offset++)
  }

  encbuf.set(bin, offset);
  offset += len;

  return { error: null, encbuf, bytes: offset - tmp };
}

export function encodeExt(type: number, bin: MPBuffer, encbuf: MPBuffer, offset = 0): EncodeOp {
  const tmp = offset;
  const len = bin.byteLength;

  encbuf = expand(encbuf, offset, len + 6);

  if (type < 0 || type > 0x7f)
    return { error: new Error("MSGPACK_ERR_INVALID_EXT_TYPE"), encbuf, bytes: 0 };

  if (len == 0x01) {
    setu8(encbuf, MSGPACK_FMT_FIXEXT1, offset++);
    setu8(encbuf, type, offset++);
  } else if (len == 0x02) {
    setu8(encbuf, MSGPACK_FMT_FIXEXT2, offset++);
    setu8(encbuf, type, offset++);
  } else if (len == 0x04) {
    setu8(encbuf, MSGPACK_FMT_FIXEXT4, offset++);
    setu8(encbuf, type, offset++);
  } else if (len == 0x08) {
    setu8(encbuf, MSGPACK_FMT_FIXEXT8, offset++);
    setu8(encbuf, type, offset++);
  } else if (len == 0x10) {
    setu8(encbuf, MSGPACK_FMT_FIXEXT16, offset++);
    setu8(encbuf, type, offset++);
  } else if (len <= 0xff) {
    setu8(encbuf, MSGPACK_FMT_EXT8, offset++);
    setu8(encbuf, len, offset++);
    setu8(encbuf, type, offset++);
  } else if (len <= 0xffff) {
    setu8(encbuf, MSGPACK_FMT_EXT16, offset++);
    setu8(encbuf, len >> 8, offset++);
    setu8(encbuf, len & 0xff, offset++);
    setu8(encbuf, type, offset++);
  } else if (len <= 0xffffffff) {
    setu8(encbuf, MSGPACK_FMT_EXT32, offset++);
    setu8(encbuf, (len >> 24) & 0xff, offset++);
    setu8(encbuf, (len >> 16) & 0xff, offset++);
    setu8(encbuf, (len >> 8) & 0xff, offset++);
    setu8(encbuf, len & 0xff, offset++);
    setu8(encbuf, type, offset++);
  }

  encbuf.set(bin, offset - tmp);
  offset += len;

  return { error: null, encbuf, bytes: offset - tmp };
}
