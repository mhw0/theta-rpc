export type Params = {[key: string]: any} | {[key: string]: any}[];

export interface ErrorObject {
  code: number,
  message: string,
  data?: any
}

export interface CallObject {
  jsonrpc: '2.0',
  method: string,
  params?: Params,
  id?: number | string
}

export interface ReplyObject {
  jsonrpc: '2.0',
  result?: any,
  error?: ErrorObject,
  id: number | string;
}
