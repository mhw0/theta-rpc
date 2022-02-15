export interface BaseEvents<Context = void> {
  message(message: any, context: Context): void;
  reply(message: any, context: Context): void;
}
