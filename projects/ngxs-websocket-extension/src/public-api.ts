/*
 * Public API Surface of ngxs-websocket-extension
 */

export {
  NgxsWebsocketExtensionModule
} from './ngxs-websocket-extension.module';
export {
  ConnectWebSocket,
  WebSocketConnected,
  WebSocketDisconnected,
  DisconnectWebSocket,
  SendWebSocketMessage
} from './actions';
export { WebSocketOptions, WebSocketDisconnectInfo } from './other';
