import { WebSocketDisconnectInfo, WebSocketOptions } from './other';

export class ConnectWebSocket {
  public static type = '[WebSocket] Connect';

  constructor(
    public key: string,
    public url: string,
    public options?: WebSocketOptions
  ) {}
}

export class WebSocketConnected {
  public static type = '[WebSocket] Connected';

  constructor(public key: string, public url: string) {}
}

export class DisconnectWebSocket {
  public static type = '[WebSocket] Disconnect';

  constructor(public key: string) {}
}

export class WebSocketDisconnected {
  public static type = '[WebSocket] Disconnected';

  constructor(
    public key: string,
    public url: string,
    public payload: WebSocketDisconnectInfo
  ) {}
}

export class SendWebSocketMessage {
  public static type = '[WebSocket] Send message';

  constructor(public key: string, public payload: any) {}
}

export class WebSocketError {
  public static type = '[WebSocket] Error';
}
