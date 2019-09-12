import { WebSocketOptions } from './other';

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
}

export class SendWebSocketMessage {
  public static type = '[WebSocket] Send message';

  constructor(public payload: any) {}
}
