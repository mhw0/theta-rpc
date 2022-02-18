import {
  FastifyRequest,
  FastifyReply,
  RawServerBase,
  RawServerDefault,
} from "fastify";
import { RouteGenericInterface } from "fastify/types/route";

const requestSymbol = Symbol("http.fastify.request");
const replySymbol = Symbol("http.fastify.reply");

export class HTTPReference<RawServer extends RawServerBase = RawServerDefault> {
  private [requestSymbol]: FastifyRequest<RouteGenericInterface, RawServer>;
  private [replySymbol]: FastifyReply<RawServer>;

  constructor(
    request: FastifyRequest<RouteGenericInterface, RawServer>,
    reply: FastifyReply<RawServer>
  ) {
    this[requestSymbol] = request;
    this[replySymbol] = reply;
  }

  public getRequest() {
    return this[requestSymbol];
  }

  public getReply() {
    return this[replySymbol];
  }
}
