import {BaseError} from './base-error';

export class MethodNotFoundError extends BaseError {
  constructor(data?: any) {
    super(-32601, "Method not found", data);
  }
}
