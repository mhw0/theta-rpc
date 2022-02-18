import { FastifyInstance, RawServerBase, RawServerDefault } from "fastify";
import https from "https";

export interface HTTPOptions {
  host?: string;
  port?: number;
  path?: string;
}

export interface HTTPTransportOptions<
  RawServer extends RawServerBase = RawServerDefault
> extends HTTPOptions {
  instance?: FastifyInstance<RawServer>;
  https?: https.ServerOptions;
}
