import { EventEmitter, ValidEventTypes as ValidSignals } from "eventemitter3";

export class Signal<
  Signals extends ValidSignals = string | symbol
> extends EventEmitter<Signals> {}
