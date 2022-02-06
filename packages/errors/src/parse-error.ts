import { RPCError } from "./rpc-error";

export class ParseError extends RPCError {
  constructor(data?: any) {
    super(-32700, "Parse error", data);
  }
}
