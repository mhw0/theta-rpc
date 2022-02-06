interface RPCErrorObject {
  code: number;
  message: string;
  data?: any;
}

export class RPCError extends Error {
  public jsonrpcError: RPCErrorObject;

  constructor(code: number, message: string, data?: any) {
    super(`[${code}] ${message}`);

    Object.setPrototypeOf(this, RPCError.prototype);
    this.jsonrpcError = { code, message };
    if (data) this.jsonrpcError["data"] = data;
  }
}
