export class MPBuffer extends Uint8Array {
  public static alloc(size: number): MPBuffer {
    return new MPBuffer(size);
  }
}
