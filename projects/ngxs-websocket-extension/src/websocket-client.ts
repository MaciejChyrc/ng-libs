import { Inject, Injectable } from '@angular/core';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import {
  ConnectWebSocket,
  DisconnectWebSocket,
  SendWebSocketMessage,
  WebSocketConnected,
  WebSocketDisconnected,
  WebSocketError
} from './actions';
import { NGXS_WEBSOCKET_OPTIONS, WebSocketOptions } from './other';

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

    this.actions$.pipe(ofActionDispatched(DisconnectWebSocket)).subscribe(_ => {
      try {
        this.disconnect();
      } catch (error) {
        console.error(error);
      }
    });
  }

  private setupWebSocketEventListeners = () => {
    if (this.webSocket) {
      this.webSocket.addEventListener('open', () => {
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
        this.dispatchDisconnectedAndFinalizeSocket(
          event.code,
          event.wasClean,
          event.reason
        );
      });

      this.webSocket.addEventListener('error', () => {
        this.store.dispatch(new WebSocketError());
      });
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
      (this.webSocket && this.webSocket.readyState !== 1)
    ) {
      throw new Error('You must connect before you send a message');
    }

    this.webSocket.send(this.config.serializer(message));
  }

  private disconnect() {
    if (this.webSocket && this.webSocket.readyState === 1) {
      this.webSocket.close();
    } else {
      throw new Error('There is no open websocket connection');
    }
  }

  private dispatchDisconnectedAndFinalizeSocket(
    code: number,
    clean: boolean,
    reason?: string
  ) {
    this.store.dispatch(
      new WebSocketDisconnected({
        code,
        clean,
        reason
      })
    );

    this.webSocket = null;
  }
}
