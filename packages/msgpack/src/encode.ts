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
  MSGPACK_FMT_STR32
} from "./fmt";

type byte = number;
type char = string;
type opt<T> = T | undefined;

export interface EncodeOp {
  error: Error | null,
  bytes: byte[];
}

export function encodeNil(bytes: byte[]): EncodeOp {
  bytes.push(MSGPACK_FMT_NIL);
  return { error: null, bytes };
}

export function encodeBool(bool: boolean, bytes: byte[]): EncodeOp {
  bytes.push(bool ? MSGPACK_FMT_BOOL_TRUE : MSGPACK_FMT_BOOL_FALSE);
  return { error: null, bytes };
}

export function encodeInt(int: number, bytes: byte[]): EncodeOp {
  if (int >= 0x00 && int <= 0x7f) { // fixuint
    bytes.push(int);
  } else if (int >= -0x20 && int < 0x00) { // fixint
    bytes.push(int & 0xff);
  } else if (int >= 0x00 && int <= 0xff) { // uint8
    bytes.push(MSGPACK_FMT_UINT8);
    bytes.push(int);
  } else if (int > 0xff && int <= 0xffff) { // uint16
    bytes.push(MSGPACK_FMT_UINT16);
    bytes.push(int >> 8);
    bytes.push(int & 0xff);
  } else if (int > 0xffff && int <= 0xffffffff) { // uint32
    bytes.push(MSGPACK_FMT_UINT32);
    bytes.push((int >> 24) & 0xff);
    bytes.push((int >> 16) & 0xff);
    bytes.push((int >> 8) & 0xff);
    bytes.push(int & 0xff);
  } else if (int >= -0x80 && int <= 0x7f) { // int8
    bytes.push(MSGPACK_FMT_INT8);
    bytes.push(int & 0xff);
  } else if (int >= -0x8000 && int <= 0x7fff) { // int16
    bytes.push(MSGPACK_FMT_INT16);
    bytes.push((int >> 8) & 0xff);
    bytes.push(int & 0xff);
  } else if (int >= -0x80000000 && int <= 0x7fffffff) { // int32
    bytes.push(MSGPACK_FMT_INT32);
    bytes.push((int >> 24) & 0xff);
    bytes.push((int >> 16) & 0xff);
    bytes.push((int >> 8) & 0xff);
    bytes.push(int & 0xff);
  }

  return { error: null, bytes };
}

function utf8e(codep: number, bytes: byte[]): void {
  if (codep >= 0x0000 && codep <= 0x007f) { // U+0000 - U+007F
    bytes.push(codep); // 0xxxxxxx
  } else if (codep >= 0x0080 && codep <= 0x07ff) { // U+0080 - U+07FF
    bytes.push(0xc0 | (codep >> 6));   // 110xxxxx
    bytes.push(0x80 | (codep & 0x3f)); // 10xxxxxx
  } else if (codep >= 0x0800 && codep <= 0xffff) { // U+0800 - U+FFFF
    bytes.push(0xe0 | ((codep >> 12)));       // 1110xxxx
    bytes.push(0x80 | ((codep >> 6) & 0x3f)); // 10xxxxxx
    bytes.push(0x80 | (codep & 0x3f));        // 10xxxxxx
  } else if (codep >= 0x10000 && codep <= 0x10ffff) { // U+10000 - U+10FFFF
    bytes.push(0xf0 | ((codep >> 18)) & 0x07); // 11110xxx
    bytes.push(0x80 | ((codep >> 12) & 0x3f)); // 10xxxxxx
    bytes.push(0x80 | ((codep >> 6) & 0x3f));  // 10xxxxxx
    bytes.push(0x80 | ((codep) & 0x3f));       // 10xxxxxx
  }
}

export function encodeStr(str: string, bytes: byte[]): EncodeOp {
  const tmplen = bytes.length;

  for(let k = 0; k < str.length; k += 2) {
    const char = str[k], nchar = str[k+1];
    const hcodep = char.charCodeAt(0);
    const lcodep = nchar ? nchar.charCodeAt(0) : 0; // is this safe?

    if (hcodep >= 0xd800 && hcodep <= 0xdbff) {
      if (!(lcodep >= 0xdc00 && lcodep <= 0xdfff))
        return { error: new Error('MSGPACK_STR_INVALID_SURROGATE_PAIRS'), bytes };

      const codep = hcodep >= 0xd800 && hcodep <= 0xdbff
        ? (((hcodep - 0xd800) * 0x0400) + (lcodep - 0xdc00) + 0x10000)
        : hcodep;

      utf8e(codep, bytes);
      continue;
    }

    utf8e(hcodep, bytes);
    if (nchar) utf8e(lcodep, bytes);
  }

  const len = bytes.length - tmplen;

  if (len <= 0x1f) {
    bytes.splice(tmplen, 0, 0xa0 | len);
  } else if (len <= 0xff) {
    bytes.splice(tmplen, 0, MSGPACK_FMT_STR8);
    bytes.splice(tmplen, 0, len);
  } else if (len <= 0xffff) {
    bytes.splice(tmplen, 0, MSGPACK_FMT_STR16);
  } else if (len <= 0xffffffff) {
    bytes.splice(tmplen, 0, MSGPACK_FMT_STR32);
    bytes.splice(tmplen, 0, (len >> 24) & 0xff);
    bytes.splice(tmplen, 0, (len >> 16) & 0xff);
    bytes.splice(tmplen, 0, (len >> 8) & 0xff);
    bytes.splice(tmplen, 0, len & 0xff);
  }

  return { error: null, bytes };
}
