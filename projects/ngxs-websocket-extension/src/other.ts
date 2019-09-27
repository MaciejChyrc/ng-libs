import { InjectionToken } from '@angular/core';

export interface WebSocketServiceConfig {
  typeKey?: string;
  serializer?: (payload: any) => string;
  deserializer?: (e: MessageEvent) => any;
}

export interface WebSocketOptions {
  protocols?: string | string[];
}

export const NGXS_WEBSOCKET_CONFIG = new InjectionToken(
  'NGXS_WEBSOCKET_CONFIG'
);

export interface WebSocketDisconnectInfo {
  clean: boolean;
  code?: number;
  reason?: string;
}

export function noop(..._: any[]) {
  return () => {};
}
