import { _Error } from "../types";
/**
 * Generate random uuid
 * @returns uuid
*/
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Error Type Guard
 * @param error
*/
export function isError(e: any): e is _Error {
  return typeof e.message === 'string';
}

