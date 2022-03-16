import { Signal } from "@theta-rpc/signal";
import { TransportSignals } from "./interfaces";

export abstract class Transport<Ref = void> extends Signal<
  TransportSignals<Ref>
> {
  public abstract launch(): Promise<void>;
  public abstract close(): Promise<void>;
}
