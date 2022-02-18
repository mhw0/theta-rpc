import http from "http";
import https from "https";
import createFastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RawServerBase,
  RawServerDefault,
} from "fastify";
import { BaseTransport } from "@theta-rpc/base-transport";
import { HTTPReference } from "./reference";
import {
  HTTPOptions,
  HTTPTransportOptions
} from "./interfaces";

function preHandler(
  request: FastifyRequest,
  reply: FastifyReply,
  done: Function
): void {
  const contentType = request.headers["content-type"];
  if (contentType && contentType !== "application/json") {
    reply.status(415).send();
    return;
  }

  done();
}

export class HTTPTransport<
  RawServer extends RawServerBase = RawServerDefault
> extends BaseTransport<HTTPReference<RawServer>> {
  private readonly defaultHost = "127.0.0.1";
  private readonly defaultPath = "/jsonrpc";
  private readonly defaultPort = 8080;
  private instance: FastifyInstance<any, any, any>;
  private isRunning = false;

  constructor(private options?: HTTPTransportOptions<RawServer>) {
    super();

    if(options?.instance) {
      this.instance = options.instance;
    } else if (options?.https) {
      this.instance = createFastify({ https: options.https });
    } else {
      this.instance = createFastify();
    }

    this.overwriteParser();
    this.overwrite404Handler();
    this.listenCalls();
    this.listenReplies();
    this.handleErrors();
  }

  public static from<RawServer extends RawServerBase>(
    instance: FastifyInstance<RawServer>,
    path?: string
  ): HTTPTransport<RawServer> {
    return new HTTPTransport<RawServer>({ instance, path });
  }

  public static http(
    options: HTTPOptions & http.ServerOptions
  ): HTTPTransport<http.Server> {
    const { host, port, path } = options;
    return new HTTPTransport<http.Server>({
      host,
      port,
      path
    });
  }

  public static https(
    options: HTTPOptions & https.ServerOptions
  ): HTTPTransport<https.Server> {
    const { host, port, path } = options;
    return new HTTPTransport<https.Server>({
      host,
      port,
      path,
      https: options
    });
  }

  private listenCalls(): void {
    const path = this.options?.path || this.defaultPath;
    this.instance.post(path, { preHandler }, (request, reply) => {
      const ref = new HTTPReference(request, reply);
      this.emit("message", request.body, ref);
    });
  }

  private listenReplies(): void {
    this.on("reply", (message, context) => {
      const reply = context.getReply();

      if (reply.sent) return;
      if (message === null) {
        reply.status(204).send();
        return;
      }

      reply.header("Content-Type", "applicaiton/json");
      reply.send(message);
    });
  }

  private handleErrors(): void {
    if (this.options?.instance) return;

    this.instance.setErrorHandler((_0, _1, reply) => {
      reply.status(400).send();
    });
  }

  private overwriteParser(): void {
    if (this.options?.instance) return;

    this.instance.addContentTypeParser(
      "application/json",
      { parseAs: "string" },
      (_, payload, done) => {
        done(null, payload);
      }
    );
  }

  private overwrite404Handler(): void {
    if (this.options?.instance) return;

    this.instance.setNotFoundHandler((_, reply) => {
      reply.status(404).send();
    });
  }

  public launch(): Promise<void> {
    if (this.options?.instance || this.isRunning) return Promise.reject();

    const host = this.options?.host || this.defaultHost;
    const port = this.options?.port || this.defaultPort;

    return new Promise<void>((resolve, reject) => {
      this.instance
        .listen(port, host)
        .then(() => {
          resolve();
          this.isRunning = true;
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public close(): Promise<void> {
    if (this.options?.instance || !this.isRunning) return Promise.reject();

    return new Promise<void>((resolve, reject) => {
      this.instance
        .close()
        .then(() => {
          this.isRunning = false;
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  }
}
