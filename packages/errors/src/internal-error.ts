import {BaseError} from './base-error';

export class InternalError extends BaseError {
  constructor(data?: any) {
    super(-32603, "Internal error", data);
  }
}
