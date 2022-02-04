import {BaseError} from './base-error';

export class ParseError extends BaseError {
  constructor(data?: any) {
    super(-32700, "Parse error", data);
  }
}
