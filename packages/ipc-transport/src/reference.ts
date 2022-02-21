import net from "net";

const socketSymbol = Symbol("ipc.net.socket");

export class IPCReference {
  private [socketSymbol]: net.Socket;

  constructor(socket: net.Socket) {
    this[socketSymbol] = socket;
  }

  public getSocket() {
    return this[socketSymbol];
  }
}
