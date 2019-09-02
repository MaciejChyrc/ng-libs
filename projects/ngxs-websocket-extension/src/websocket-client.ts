import { Injectable, Inject } from '@angular/core';
import { Store, Actions, ofActionDispatched } from '@ngxs/store';
import { WebSocketOptions } from './websocket-options';
import { NGXS_WEBSOCKET_OPTIONS } from './ngxs-websocket-extension.module';
import { ConnectWebSocket, WebSocketConnected } from './actions';

@Injectable()
export class WebSocketClient {
  private webSocket: WebSocket;

  constructor(
    private store: Store,
    private actions$: Actions,
    @Inject(NGXS_WEBSOCKET_OPTIONS) private options: WebSocketOptions
  ) {
    this.listenToActions();
  }

  private listenToActions = () => {
    this.actions$
      .pipe(ofActionDispatched(ConnectWebSocket))
      .subscribe(({ payload }) => this.connect(payload));
  }

  private connect(options?: WebSocketOptions) {
    if (options) {
      this.options = { ...this.options, ...options };
    }

    this.webSocket = new WebSocket(this.options.url, this.options.protocol);
  }
}
