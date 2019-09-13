import { Injectable, Inject } from '@angular/core';
import { Store, Actions, ofActionDispatched } from '@ngxs/store';
import { WebSocketOptions, NGXS_WEBSOCKET_OPTIONS } from './other';
import {
  ConnectWebSocket,
  WebSocketConnected,
  SendWebSocketMessage,
  WebSocketDisconnected
} from './actions';

@Injectable()
export class WebSocketClient {
  private webSocket: WebSocket;
  private config: WebSocketOptions;

  constructor(
    private store: Store,
    private actions$: Actions,
    @Inject(NGXS_WEBSOCKET_OPTIONS) private options: WebSocketOptions
  ) {
    this.config = options;
    this.setupActionListeners();
  }

  private setupActionListeners = () => {
    this.actions$
      .pipe(ofActionDispatched(ConnectWebSocket))
      .subscribe(({ options }) => this.connect(options));

    this.actions$
      .pipe(ofActionDispatched(SendWebSocketMessage))
      .subscribe(({ payload }) => {
        try {
          this.send(payload);
        } catch (error) {
          console.error(error);
        }
      });

    this.actions$
      .pipe(ofActionDispatched(WebSocketDisconnected))
      .subscribe(_ => {
        this.webSocket = null;
      });
  }

  private setupWebSocketEventListeners = () => {
    if (this.webSocket) {
      this.webSocket.addEventListener('open', event => {
        this.store.dispatch(new WebSocketConnected());
      });

      this.webSocket.addEventListener('message', event => {
        const message = this.config.deserializer(event);

        if (message) {
          const type = message[this.config.typeKey];
          if (!type) {
            throw new Error(
              `Type key ${this.config.typeKey} missing in the message`
            );
          } else {
            this.store.dispatch({ type, ...message });
          }
        }
      });

      this.webSocket.addEventListener('close', event => {
        this.store.dispatch(
          new WebSocketDisconnected({
            code: event.code,
            clean: event.wasClean,
            reason: event.reason
          })
        );
      });

      this.webSocket.addEventListener('error', event => {});
    }
  }

  private connect(options?: WebSocketOptions) {
    if (options) {
      this.config = { ...this.options, ...options };
    }

    this.webSocket = new WebSocket(this.config.url, this.config.protocol);
    this.setupWebSocketEventListeners();
  }

  private send(message: any) {
    if (
      !this.webSocket ||
      (this.webSocket && this.webSocket.readyState !== 1) // readyState 1 stands for open connection
    ) {
      throw new Error('You must connect before you send a message');
    }

    this.webSocket.send(this.config.serializer(message));
  }
}
