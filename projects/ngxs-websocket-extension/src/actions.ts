import { WebSocketDisconnectInfo, WebSocketOptions } from './other';

export class ConnectWebSocket {
  public static type = '[WebSocket] Connect';

  constructor(public options: WebSocketOptions) {}
}

export class WebSocketConnected {
  public static type = '[WebSocket] Connected';
}

export class DisconnectWebSocket {
  public static type = '[WebSocket] Disconnect';
}

export class WebSocketDisconnected {
  public static type = '[WebSocket] Disconnected';

  constructor(public payload: WebSocketDisconnectInfo) {}
}

export class SendWebSocketMessage {
  public static type = '[WebSocket] Send message';

  constructor(public payload: any) {}
}

export class WebSocketError {
  public static type = '[WebSocket] Error';
}
