import {BaseError} from './base-error';

export class InvalidRequestError extends BaseError {
  constructor(data?: any) {
    super(-32600, "Invalid Request", data);
  }
}
