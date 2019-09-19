import { TestBed } from '@angular/core/testing';
import { Actions, NgxsModule, ofActionDispatched, Store } from '@ngxs/store';
import { Server, WebSocket } from 'mock-socket';
import {
  ConnectWebSocket,
  DisconnectWebSocket,
  SendWebSocketMessage,
  WebSocketConnected,
  WebSocketDisconnected,
  WebSocketError
} from './actions';
import { NgxsWebsocketExtensionModule } from './ngxs-websocket-extension.module';
import { WebSocketOptions } from './other';

type WebSocketMessage = string | Blob | ArrayBuffer | ArrayBufferView;

describe('NgxsWebsocketExtension', () => {
  beforeEach(() => {
    (window as any).WebSocket = WebSocket;
  });

  const url = 'ws://localhost:8080';
  const createModule = (options?: WebSocketOptions) => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot(),
        NgxsWebsocketExtensionModule.forRoot(options)
      ]
    });

    return new Server(url);
  };
  const getStore = (): Store => TestBed.get(Store);
  const getActions$ = (): Actions => TestBed.get(Actions);
  class ExampleMessage {
    static readonly type = 'Example message';
    constructor(public payload: string) {}
  }

  it('should connect websocket', done => {
    const mockWebSocketServer = createModule({ url });
    const store = getStore();

    mockWebSocketServer.on('connection', (socket: WebSocket) => {
      expect(socket.readyState).toBe(1);
      mockWebSocketServer.stop(done);
    });

    store.dispatch(new ConnectWebSocket());
  });

  it('should dispatch action received from websocket', done => {
    const mockWebSocketServer = createModule({ url });
    const store = getStore();
    const actions$ = getActions$();

    mockWebSocketServer.on('connection', (socket: WebSocket) => {
      socket.on('message', (message: WebSocketMessage) => socket.send(message));

      actions$.pipe(ofActionDispatched(ExampleMessage)).subscribe(action => {
        expect(action).toEqual({ type: 'Example message', payload: 'No elo' });
        mockWebSocketServer.stop(done);
      });
    });

    actions$.pipe(ofActionDispatched(WebSocketConnected)).subscribe(() =>
      store.dispatch(
        new SendWebSocketMessage({
          type: 'Example message',
          payload: 'No elo'
        })
      )
    );

    store.dispatch(new ConnectWebSocket());
  });

  it('should disconnect websocket on DisconnectWebSocket action', done => {
    const mockWebSocketServer = createModule({ url });
    const store = getStore();
    const actions$ = getActions$();

    actions$
      .pipe(ofActionDispatched(WebSocketConnected))
      .subscribe(() => store.dispatch(new DisconnectWebSocket()));

    actions$
      .pipe(ofActionDispatched(WebSocketDisconnected))
      .subscribe(action => {
        expect(action).toBeTruthy();
        mockWebSocketServer.stop(done);
      });

    store.dispatch(new ConnectWebSocket());
  });

  it('should dispatch WebSocketDisconnected action when server closes the connection', done => {
    const mockWebSocketServer = createModule({ url });
    const store = getStore();
    const actions$ = getActions$();

    mockWebSocketServer.on('connection', (socket: WebSocket) => socket.close());

    actions$
      .pipe(ofActionDispatched(WebSocketDisconnected))
      .subscribe(action => {
        expect(action).toBeTruthy();
        mockWebSocketServer.stop(done);
      });

    store.dispatch(new ConnectWebSocket());
  });

  it('should dispatch WebSocketError action when server errors', done => {
    const mockWebSocketServer = createModule({ url });
    const store = getStore();
    const actions$ = getActions$();

    mockWebSocketServer.on('connection', (socket: WebSocket) =>
      mockWebSocketServer.emit('error', 'xd')
    );

    actions$.pipe(ofActionDispatched(WebSocketError)).subscribe(action => {
      expect(action).toBeTruthy();
      mockWebSocketServer.stop(done);
    });

    store.dispatch(new ConnectWebSocket());
  });

  it('should use options provided in module', done => {
    const mockWebSocketServer = createModule({ url, serializer: () => '' });
    const store = getStore();
    const actions$ = getActions$();

    mockWebSocketServer.on('connection', (socket: WebSocket) => {
      socket.on('message', (message: WebSocketMessage) => {
        expect(message).toEqual('');
        mockWebSocketServer.stop(done);
      });
    });

    actions$.pipe(ofActionDispatched(WebSocketConnected)).subscribe(() =>
      store.dispatch(
        new SendWebSocketMessage({
          type: 'Example message',
          payload: 'No elo'
        })
      )
    );

    store.dispatch(new ConnectWebSocket());
  });

  it(`should use options provided in ConnectWebSocket action's options`, done => {
    const mockWebSocketServer = createModule({ url, serializer: () => '' });
    const store = getStore();
    const actions$ = getActions$();

    mockWebSocketServer.on('connection', (socket: WebSocket) => {
      socket.on('message', (message: WebSocketMessage) => {
        expect(message).toEqual('Serializer from ConnectWebSocket options');
        mockWebSocketServer.stop(done);
      });
    });

    actions$.pipe(ofActionDispatched(WebSocketConnected)).subscribe(() =>
      store.dispatch(
        new SendWebSocketMessage({
          type: 'Example message',
          payload: 'No elo'
        })
      )
    );

    store.dispatch(
      new ConnectWebSocket({
        serializer: () => 'Serializer from ConnectWebSocket options'
      })
    );
  });

  it('should dispatch action received from websocket with custom typeKey', done => {
    const mockWebSocketServer = createModule({ url, typeKey: 'xyz' });
    const store = getStore();
    const actions$ = getActions$();

    mockWebSocketServer.on('connection', (socket: WebSocket) => {
      socket.on('message', (message: WebSocketMessage) => socket.send(message));

      actions$.pipe(ofActionDispatched(ExampleMessage)).subscribe(action => {
        expect(action.type).toEqual('Example message');
        expect(action.payload).toEqual('No elo');
        mockWebSocketServer.stop(done);
      });
    });

    actions$.pipe(ofActionDispatched(WebSocketConnected)).subscribe(() =>
      store.dispatch(
        new SendWebSocketMessage({
          xyz: 'Example message',
          payload: 'No elo'
        })
      )
    );

    store.dispatch(new ConnectWebSocket());
  });
});
