export interface BaseEvents {
  message(message: any, context: any): void;
  reply(message: any, context: any): void;
}
