import {RPCError} from './rpc-error';

export class MethodNotFoundError extends RPCError {
  constructor(data?: any) {
    super(-32601, "Method not found", data);
  }
}
