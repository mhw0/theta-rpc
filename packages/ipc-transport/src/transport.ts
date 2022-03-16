import { Transport } from "@theta-rpc/transport";
import frameStream from "frame-stream";
import debug from "debug";
import net from "net";
import os from "os";
import fs from "fs";
import { IPCReference } from "./reference";
import { IPCTransportOptions } from "./interfaces";

const L = debug("theta-rpc:ipc-transport");

export class IPCTransport extends Transport<IPCReference> {
  private instance: net.Server;
  private isRunning = false;
  private sockets: net.Socket[] = [];
  private readonly defaultSocketPath =
    os.platform() === "win32" ? "\\\\.\\pipe\\jsonrpc" : "jsonrpc.sock";

  constructor(private options?: IPCTransportOptions) {
    super();

    if (options?.instance) {
      this.instance = options.instance;
    } else {
      this.instance = net.createServer();
    }

    this.listenCalls();
    this.listenReplies();
    this.unlinkSocketPath();
  }

  public static create(options?: IPCTransportOptions): IPCTransport {
    return new IPCTransport(options);
  }

  public static from(instance: net.Server): IPCTransport {
    return new IPCTransport({ instance });
  }

  private unlinkSocketPath() {
    const socketPath = this.options?.socketPath || this.defaultSocketPath;
    if (this.options?.autoUnlink && os.platform() !== "win32") {
      L("\"options.autoUnlink\" is enabled, unlinking \"%s\"", socketPath);
      if (fs.existsSync(socketPath)) {
        fs.unlinkSync(socketPath);
      }
    }
  }

  private listenCalls(): void {
    this.instance.on("connection", (socket) => {
      const socketIndex = this.sockets.length;
      const decode = frameStream.decode();
      socket.pipe(decode).on("data", (data) => {
        const ref = new IPCReference(socket);
        this.emit("message", data, ref);
      });

      this.sockets.push(socket);
      L("new connection, total: %d", this.sockets.length);

      socket.on('end', () => {
        this.sockets.splice(socketIndex, 1);
        L("connection is closed, total: %d", this.sockets.length);
      });
    });
  }

  private listenReplies(): void {
    this.on("reply", (message, ref) => {
      const socket = ref.getSocket();
      const encoder = frameStream.encode();

      if(!socket.connecting) {
        L("connection is closed, ignoring reply");
        return;
      }

      encoder.pipe(socket);
      encoder.write(message, 'utf8', (error) => {
        encoder.unpipe(socket);
        if(error) {
          L("error occured while writing chunk:\n", error);
        }
      });
    });
  }

  private destroySockets() {
    for(let i = 0; i < this.sockets.length; i++) {
      this.sockets[i].destroy();
    }
    this.sockets = [];
  }

  public launch() {
    if (this.options?.instance || this.isRunning)
      return Promise.reject();

    const socketPath = this.options?.socketPath || this.defaultSocketPath;

    return new Promise<void>((resolve, reject) => {
      this.instance
        .listen(socketPath, () => {
          this.isRunning = true;
          L("transport is launched");
          resolve();
        })
        .once("error", (error) => {
          L("unable to launch transport:\n", error);
          reject();
        });
    });
  }

  public close() {
    if (this.options?.instance || !this.isRunning)
      return Promise.reject();

    if(this.options?.forceClose) {
      L("\"options.forceClose\" is enabled, destroying all sockets");
      this.destroySockets();
    } else if (this.sockets.length) {
      L("there are %d connected sockets, stopping accepting " +
        "new connections", this.sockets.length);
    }

    return new Promise<void>((resolve, reject) => {
      this.instance.close((error) => {
        if (error) {
          L("unable to close transport:\n", error);
          return reject();
        }
        this.isRunning = false;
        L("transport is closed");
        resolve();
      });
    });
  }
}
