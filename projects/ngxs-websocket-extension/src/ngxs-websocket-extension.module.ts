import {
  NgModule,
  ModuleWithProviders,
  InjectionToken,
  APP_INITIALIZER
} from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { WebSocketOptions } from './websocket-options';
import { WebSocketClient } from './websocket-client';

export const NGXS_WEBSOCKET_OPTIONS = new InjectionToken(
  'NGXS_WEBSOCKET_OPTIONS'
);

export const websocketOptionsFactory = (
  options: WebSocketOptions
): WebSocketOptions => {
  return {
    typeKey: 'type',
    serializer: (value: any) => JSON.stringify(value),
    deserializer: (e: MessageEvent) => JSON.parse(e.data),
    ...options
  };
};

@NgModule({
  imports: [NgxsModule],
  exports: []
})
export class NgxsWebsocketExtensionModule {
  static forRoot = (options?: WebSocketOptions): ModuleWithProviders => {
    return {
      ngModule: NgxsWebsocketExtensionModule,
      providers: [
        WebSocketClient,
        {
          provide: NGXS_WEBSOCKET_OPTIONS,
          useFactory: websocketOptionsFactory
        },
        {
          provide: APP_INITIALIZER,
          useFactory: () => {},
          deps: [WebSocketClient],
          multi: true
        }
      ]
    };
  }
}
