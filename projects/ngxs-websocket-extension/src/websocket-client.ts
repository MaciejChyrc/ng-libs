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
import {
  NGXS_WEBSOCKET_CONFIG,
  WebSocketOptions,
  WebSocketServiceConfig
} from './other';

@Injectable()
export class WebSocketClient {
  private webSocketMap: Map<string, WebSocket>;

  constructor(
    private store: Store,
    private actions$: Actions,
    @Inject(NGXS_WEBSOCKET_CONFIG) private config: WebSocketServiceConfig
  ) {
    this.webSocketMap = new Map<string, WebSocket>();
    this.setupActionListeners();
  }

  private setupActionListeners = () => {
    this.actions$
      .pipe(ofActionDispatched(ConnectWebSocket))
      .subscribe(({ key, url, options }) => {
        try {
          this.connect(key, url, options);
        } catch (error) {
          console.error(error);
          this.dispatchDisconnectedAndFinalizeSocket(key, false);
        }
      });

    this.actions$
      .pipe(ofActionDispatched(SendWebSocketMessage))
      .subscribe(({ key, payload }) => {
        try {
          this.send(key, payload);
        } catch (error) {
          console.error(error);
        }
      });

    this.actions$
      .pipe(ofActionDispatched(DisconnectWebSocket))
      .subscribe(({ key }) => {
        try {
          this.disconnect(key);
        } catch (error) {
          console.error(error);
        }
      });
  }

  private setupWebSocketEventListeners = (
    key: string,
    webSocket: WebSocket
  ) => {
    if (webSocket) {
      webSocket.addEventListener('open', () => {
        this.store.dispatch(new WebSocketConnected(key, webSocket.url));
      });

      webSocket.addEventListener('message', event => {
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

      webSocket.addEventListener('close', event => {
        this.dispatchDisconnectedAndFinalizeSocket(
          key,
          event.wasClean,
          event.code,
          event.reason
        );
      });

      webSocket.addEventListener('error', () => {
        this.store.dispatch(new WebSocketError());
      });
    } else {
      throw new Error('Failed to set up websocket event listeners');
    }
  }

  private connect(key: string, url: string, options?: WebSocketOptions) {
    const webSocket = new WebSocket(
      url,
      options ? options.protocols : undefined
    );
    this.webSocketMap.set(key, webSocket);
    this.setupWebSocketEventListeners(key, webSocket);
  }

  private send(key: string, message: any) {
    const webSocket = this.webSocketMap.get(key);

    if (!webSocket || (webSocket && webSocket.readyState !== 1)) {
      throw new Error('You must connect before you send a message');
    }

    webSocket.send(this.config.serializer(message));
  }

  private disconnect(key: string) {
    const webSocket = this.webSocketMap.get(key);

    if (webSocket && webSocket.readyState === 1) {
      webSocket.close();
    } else {
      throw new Error('There is no open websocket connection');
    }
  }

  private dispatchDisconnectedAndFinalizeSocket(
    key: string,
    clean: boolean,
    code?: number,
    reason?: string
  ) {
    let webSocket = this.webSocketMap.get(key);

    this.store.dispatch(
      new WebSocketDisconnected(key, webSocket.url, {
        clean,
        code,
        reason
      })
    );

    webSocket = null;
    this.webSocketMap.delete(key);
  }
}
