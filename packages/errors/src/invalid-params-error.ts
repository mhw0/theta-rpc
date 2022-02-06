import { RPCError } from "./rpc-error";

export class InvalidParamsError extends RPCError {
  constructor(data?: any) {
    super(-32602, "Invalid params", data);
  }
}
