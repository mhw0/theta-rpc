export class MPBuffer extends Uint8Array {
  public static alloc(size: number): MPBuffer {
    return new MPBuffer(size);
  }

  public static expand(buffer: MPBuffer, size: number): MPBuffer {
    const buf = MPBuffer.alloc(buffer.byteLength + size);
    buf.set(buffer);
    return buf;
  }
}
