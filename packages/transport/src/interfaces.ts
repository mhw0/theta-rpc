type Message = Buffer | Uint8Array | ArrayLike<number>;

export interface TransportSignals<Ref = void> {
  message(message: Message, context: Ref): void;
  reply(message: Message, context: Ref): void;
}
