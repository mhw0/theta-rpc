import {BaseError} from './base-error';

export class InvalidParamsError extends BaseError {
  constructor(data?: any) {
    super(-32602, "Invalid params", data);
  }
}
