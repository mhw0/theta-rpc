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
} from "./fmt";

type byte = number;
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

