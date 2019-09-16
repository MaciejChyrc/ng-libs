import { TestBed } from '@angular/core/testing';
import { Actions, NgxsModule, ofActionDispatched, Store } from '@ngxs/store';
import { Server, WebSocket } from 'mock-socket';
import {
  ConnectWebSocket,
  SendWebSocketMessage,
  WebSocketConnected
} from './actions';
import { NgxsWebsocketExtensionModule } from './ngxs-websocket-extension.module';

type WebSocketMessage = string | Blob | ArrayBuffer | ArrayBufferView;

describe('NgxsWebsocketExtension', () => {
  beforeEach(() => {
    (window as any).WebSocket = WebSocket;
  });

  const url = 'ws://localhost:8080';
  const createModule = () => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot(),
        NgxsWebsocketExtensionModule.forRoot({ url })
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

  it('should dispatch action received from websocket', done => {
    const mockWebSocketServer = createModule();
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

    store.dispatch(new ConnectWebSocket({}));
  });
});
