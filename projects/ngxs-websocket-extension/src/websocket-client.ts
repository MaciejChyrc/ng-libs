import { Injectable, Inject } from '@angular/core';
import { Store, Actions, ofActionDispatched } from '@ngxs/store';
import { WebSocketOptions } from './websocket-options';
import { NGXS_WEBSOCKET_OPTIONS } from './ngxs-websocket-extension.module';
import {
  ConnectWebSocket,
  WebSocketConnected,
  DisconnectWebSocket,
  SendWebSocketMessage
} from './actions';

// FIXME: introduce config field which stores things like serializer, deserializer etc. and set it from options
@Injectable()
export class WebSocketClient {
  private webSocket: WebSocket;

  constructor(
    private store: Store,
    private actions$: Actions,
    @Inject(NGXS_WEBSOCKET_OPTIONS) private options: WebSocketOptions
  ) {
    this.setupActionListeners();
  }

  private setupActionListeners = () => {
    this.actions$
      .pipe(ofActionDispatched(ConnectWebSocket))
      .subscribe(({ payload }) => this.connect(payload));

    this.actions$
      .pipe(ofActionDispatched(SendWebSocketMessage))
      .subscribe(({ payload }) => this.send(payload));
  }

  private setupWebSocketEventListeners = () => {
    if (this.webSocket) {
      this.webSocket.addEventListener('open', event => {
        this.store.dispatch(new WebSocketConnected());
      });

      this.webSocket.addEventListener('message', event => {
        const message = this.options.deserializer(event);

        if (message) {
          const type = message[this.options.typeKey];
          if (!type) {
            throw new Error(
              `Type key ${this.options.typeKey} missing in the message`
            );
          } else {
            this.store.dispatch({ type, ...message });
          }
        }
      });

      this.webSocket.addEventListener('close', event => {
        this.store.dispatch(new DisconnectWebSocket());
      });

      this.webSocket.addEventListener('error', event => {});
    }
  }

  private connect(options?: WebSocketOptions) {
    if (options) {
      this.options = { ...this.options, ...options };
    }

    this.webSocket = new WebSocket(this.options.url, this.options.protocol);
    this.setupWebSocketEventListeners();
  }

  private send(message: any) {
    if (
      !this.webSocket ||
      (this.webSocket && this.webSocket.readyState !== 1) // readyState 1 stands for open connection
    ) {
      throw new Error('You must connect before you send a message');
    }

    this.webSocket.send(this.options.serializer(message));
  }
}
