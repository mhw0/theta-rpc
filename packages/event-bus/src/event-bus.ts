import { EventEmitter, ValidEventTypes } from "eventemitter3";

export class EventBus<
  Events extends ValidEventTypes = string | symbol
> extends EventEmitter<Events> {}
