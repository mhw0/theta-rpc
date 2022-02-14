import { EventBus } from "@theta-rpc/event-bus";
import { BaseEvents } from "./interfaces";

export abstract class BaseTransport extends EventBus<BaseEvents> {
  public abstract launch(): Promise<void>;
  public abstract close(): Promise<void>;
}
