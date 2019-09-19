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

export interface WebSocketDisconnectInfo {
  clean: boolean;
  code?: number;
  reason?: string;
}

export function noop(..._: any[]) {
  return () => {};
}
