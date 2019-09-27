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
import { WebSocketServiceConfig } from './other';

type WebSocketMessage = string | Blob | ArrayBuffer | ArrayBufferView;

describe('NgxsWebsocketExtension', () => {
  let mockWebSocketServer: Server;
  let mockWebSocketServer2: Server;
  const key1 = 'key1';
  const key2 = 'key2';
  const url1 = 'ws://localhost:8080';
  const url2 = 'ws://localhost:8081';
  const createModule = (options?: WebSocketServiceConfig) => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot(),
        NgxsWebsocketExtensionModule.forRoot(options)
      ]
    });
  };
  const getStore = (): Store => TestBed.get(Store);
  const getActions$ = (): Actions => TestBed.get(Actions);
  class ExampleMessage {
    static readonly type = 'Example message';
    constructor(public payload: string) {}
  }

  beforeEach(() => {
    (window as any).WebSocket = WebSocket;
    mockWebSocketServer = new Server(url1);
    mockWebSocketServer2 = new Server(url2);
  });

  afterEach(() => {
    mockWebSocketServer.stop();
    mockWebSocketServer2.stop();
  });

  it('should connect websocket', done => {
    createModule();
    const store = getStore();

    mockWebSocketServer.on('connection', (socket: WebSocket) => {
      expect(socket.readyState).toBe(1);
      mockWebSocketServer.stop(done);
    });

    store.dispatch(new ConnectWebSocket(key1, url1));
  });

  it('should dispatch action received from websocket', done => {
    createModule();
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
        new SendWebSocketMessage(key1, {
          type: 'Example message',
          payload: 'No elo'
        })
      )
    );

    store.dispatch(new ConnectWebSocket(key1, url1));
  });

  it('should disconnect websocket on DisconnectWebSocket action', done => {
    createModule();
    const store = getStore();
    const actions$ = getActions$();

    actions$
      .pipe(ofActionDispatched(WebSocketConnected))
      .subscribe(() => store.dispatch(new DisconnectWebSocket(key1)));

    actions$
      .pipe(ofActionDispatched(WebSocketDisconnected))
      .subscribe(action => {
        expect(action).toBeTruthy();
        mockWebSocketServer.stop(done);
      });

    store.dispatch(new ConnectWebSocket(key1, url1));
  });

  it('should dispatch WebSocketDisconnected action when server closes the connection', done => {
    createModule();
    const store = getStore();
    const actions$ = getActions$();

    mockWebSocketServer.on('connection', (socket: WebSocket) => socket.close());

    actions$
      .pipe(ofActionDispatched(WebSocketDisconnected))
      .subscribe(action => {
        expect(action).toBeTruthy();
        mockWebSocketServer.stop(done);
      });

    store.dispatch(new ConnectWebSocket(key1, url1));
  });

  it('should dispatch WebSocketError action when server errors', done => {
    createModule();
    const store = getStore();
    const actions$ = getActions$();

    mockWebSocketServer.on('connection', (socket: WebSocket) =>
      mockWebSocketServer.emit('error', 'xd')
    );

    actions$.pipe(ofActionDispatched(WebSocketError)).subscribe(action => {
      expect(action).toBeTruthy();
      mockWebSocketServer.stop(done);
    });

    store.dispatch(new ConnectWebSocket(key1, url1));
  });

  it('should use config provided in module', done => {
    createModule({ serializer: () => '' });
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
        new SendWebSocketMessage(key1, {
          type: 'Example message',
          payload: 'No elo'
        })
      )
    );

    store.dispatch(new ConnectWebSocket(key1, url1));
  });

  it('should dispatch action received from websocket with custom typeKey', done => {
    createModule({ typeKey: 'xyz' });
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
        new SendWebSocketMessage(key1, {
          xyz: 'Example message',
          payload: 'No elo'
        })
      )
    );

    store.dispatch(new ConnectWebSocket(key1, url1));
  });

  it('should open 2 websocket connections', done => {
    createModule();
    const store = getStore();

    mockWebSocketServer.on('connection', (socket: WebSocket) => {
      expect(socket.readyState).toBe(1);
      mockWebSocketServer.stop();
    });
    mockWebSocketServer2.on('connection', (socket: WebSocket) => {
      expect(socket.readyState).toBe(1);
      mockWebSocketServer.stop(done);
    });

    store.dispatch(new ConnectWebSocket(key1, url1)).subscribe(() => {
      store.dispatch(new ConnectWebSocket(key2, url2));
    });
  });

  it('should close given websocket on DisconnectWebSocket action and keep the other connection alive', done => {
    createModule();
    const store = getStore();
    const actions$ = getActions$();

    actions$.pipe(ofActionDispatched(WebSocketConnected)).subscribe(action => {
      console.log(action.url);
      if (action.key === key1) {
        store.dispatch(new DisconnectWebSocket(action.key));
      }
    });

    actions$
      .pipe(ofActionDispatched(WebSocketDisconnected))
      .subscribe(action => {
        expect(action).toBeTruthy();
        expect(action.key).toEqual(key1);
        mockWebSocketServer.stop();
        store.dispatch(
          new SendWebSocketMessage(key2, {
            type: 'Example message',
            payload: 'Hello server 2!'
          })
        );
      });

    mockWebSocketServer2.on('connection', (socket: WebSocket) => {
      socket.on('message', (message: WebSocketMessage) => {
        expect(message).toEqual(
          '{"type":"Example message","payload":"Hello server 2!"}'
        );
        mockWebSocketServer2.stop(done);
      });
    });

    store.dispatch(new ConnectWebSocket(key1, url1)).subscribe(() => {
      store.dispatch(new ConnectWebSocket(key2, url2));
    });
  });
});
