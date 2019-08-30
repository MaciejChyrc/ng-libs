import { Injectable, Inject } from '@angular/core';
import { Store, Actions } from '@ngxs/store';
import { WebSocketOptions } from './websocket-options';
import { NGXS_WEBSOCKET_OPTIONS } from './ngxs-websocket-extension.module';

@Injectable()
export class WebSocketClient {
  private webSocket: WebSocket;

  constructor(
    private store: Store,
    private actions$: Actions,
    @Inject(NGXS_WEBSOCKET_OPTIONS) private options: WebSocketOptions
  ) {}
}
