import { RPCError } from "./errors";
import { CallObject, ReplyObject, Params } from "./interfaces";

const hasProp = (obj: Object, prop: string) => obj.hasOwnProperty(prop);
const isArray = (arr: any) => Array.isArray(arr);
const isObject = (obj: any) =>
  obj !== null && !isArray(obj) && typeof obj === "object";

function checkID(id: any): boolean {
  /*
   * The value SHOULD normally not be Null and
   * Numbers SHOULD NOT contain fractional parts
   */
  if (typeof id === "number")
    return id <= Number.MAX_SAFE_INTEGER && id % 1 === 0;
  return typeof id === "string";
}

export function checkCallObject(obj: any): obj is CallObject {
  if (!isObject(obj)) return false;

  /*
   * A String specifying the version of the JSON-RPC protocol. MUST be
   * exactly "2.0".
   */
  if (!hasProp(obj, "jsonrpc") || obj["jsonrpc"] !== "2.0") return false;

  /*
   * A String containing the name of the method to be invoked. Method
   */
  if (!hasProp(obj, "method") || typeof obj["method"] !== "string")
    return false;

  if (obj["method"].length === 0) return false;

  /*
   * A Structured value that holds the parameter values to be used during
   * the invocation of the method. This member MAY be omitted.
   */
  if (hasProp(obj, "params"))
    if (!isObject(obj["params"]) && !isArray(obj["params"])) return false;

  /*
   * An identifier established by the Client that MUST contain a String,
   * Number, or NULL value if included. If it is not included it is assumed
   * to be a notification.
   */
  if (obj["id"] && !checkID(obj["id"])) return false;

  return true;
}

export function checkReplyObject(obj: any): obj is ReplyObject {
  if (!isObject(obj)) return false;

  /*
   * A String specifying the version of the JSON-RPC protocol. MUST be
   * exactly "2.0".
   */
  if (!hasProp(obj, "jsonrpc") || obj["jsonrpc"] !== "2.0") return false;

  if (!hasProp(obj, "id")) return false;

  /*
   * This member is REQUIRED on error.
   */
  if (hasProp(obj, "error")) {
    if (hasProp(obj, "result") || checkErrorObject(obj["error"])) return false;
    if (!hasProp(obj, "id") || obj["id"] !== null) return false;
    return true;
  }

  /*
   * This member is REQUIRED on success.
   */
  if (!hasProp(obj, "result")) return false;

  /*
   * An identifier established by the Client that MUST contain a String, Number,
   * or NULL value if included. If there was an error in detecting the id in the
   * Request object (e.g. Parse error/Invalid Request), it MUST be Null.
   */
  return checkID(obj["id"]);
}

export function checkErrorObject(obj: any): obj is RPCError {
  if (!isObject(obj)) return false;

  /*
    A Number that indicates the error type that occurred.
   */
  if (!hasProp(obj, "code") || typeof obj["code"] !== "number") return false;

  /*
   * A String providing a short description of the error.
   */
  if (!hasProp(obj, "message") || typeof obj["message"] !== "string")
    return false;

  return true;
}

export function createCallObject(
  method: string,
  params?: Params,
  id?: number | string
): CallObject;
export function createCallObject(
  method: string,
  id?: number | string
): CallObject;
export function createCallObject(
  method: string,
  paramsOrId?: Params | number | string,
  id?: number | string
): CallObject {
  const obj: CallObject = { jsonrpc: "2.0", method };

  if (paramsOrId) {
    if (typeof paramsOrId === "string" || typeof paramsOrId === "number")
      obj["id"] = paramsOrId;
    else obj["params"] = paramsOrId;

    if (id) obj["id"] = id;
  }

  return obj;
}

export function createReplyObject(
  result: any,
  id: number | string
): ReplyObject;
export function createReplyObject(
  error: RPCError,
  id: number | string
): ReplyObject;
export function createReplyObject(
  resultOrError: any,
  id: number | string
): ReplyObject {
  if (resultOrError instanceof RPCError)
    return { jsonrpc: "2.0", error: resultOrError.jsonrpcError, id };

  return { jsonrpc: "2.0", result: resultOrError, id };
}
