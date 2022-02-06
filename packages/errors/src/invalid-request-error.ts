import { RPCError } from "./rpc-error";

export class InvalidRequestError extends RPCError {
  constructor(data?: any) {
    super(-32600, "Invalid Request", data);
  }
}
