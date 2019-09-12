import { InjectionToken } from '@angular/core';

export interface WebSocketOptions {
  url?: string;
  protocol?: string;
  typeKey?: string;
  binaryType?: string;
  serializer?: (payload: any) => string;
  deserializer?: (e: MessageEvent) => any;
}

export const NGXS_WEBSOCKET_OPTIONS = new InjectionToken(
  'NGXS_WEBSOCKET_OPTIONS'
);

export function noop(..._args: any[]) {
  return function() {};
}
