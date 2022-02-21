import net from 'net';

export interface IPCTransportOptions {
  instance?: net.Server;
  socketPath?: string;
  autoUnlink?: boolean
  forceClose?: boolean
}
