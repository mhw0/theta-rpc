export class BaseError extends Error {
  public readonly code: number;
  public readonly message: string;
  public readonly data?: any;

  constructor(code: number, message: string, data?: any) {
    super();

    Object.setPrototypeOf(this, BaseError.prototype);

    this.code = code;
    this.message = message;
    if (data) this.data = data;
  }
}
