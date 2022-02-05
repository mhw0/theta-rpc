import {RPCError} from './rpc-error';

export class InternalError extends RPCError {
  constructor(data?: any) {
    super(-32603, "Internal error", data);
  }
}
