import { EventBus } from "@theta-rpc/event-bus";
import { BaseEvents } from "./interfaces";

export abstract class BaseTransport<Context = void> extends EventBus<
  BaseEvents<Context>
> {
  public abstract launch(): Promise<any>;
  public abstract close(): Promise<any>;
}
