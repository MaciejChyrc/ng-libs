import {
  APP_INITIALIZER,
  InjectionToken,
  ModuleWithProviders,
  NgModule
} from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NGXS_WEBSOCKET_OPTIONS, noop, WebSocketOptions } from './other';
import { WebSocketClient } from './websocket-client';

export function websocketOptionsFactory(
  options: WebSocketOptions
): WebSocketOptions {
  return {
    typeKey: 'type',
    serializer(value: any) {
      return JSON.stringify(value);
    },
    deserializer(e: MessageEvent) {
      return JSON.parse(e.data);
    },
    ...options
  };
}

export const USER_OPTIONS = new InjectionToken('USER_OPTIONS');

@NgModule({
  imports: [NgxsModule],
  exports: []
})
export class NgxsWebsocketExtensionModule {
  static forRoot(options?: WebSocketOptions): ModuleWithProviders {
    return {
      ngModule: NgxsWebsocketExtensionModule,
      providers: [
        WebSocketClient,
        {
          provide: USER_OPTIONS,
          useValue: options
        },
        {
          provide: NGXS_WEBSOCKET_OPTIONS,
          useFactory: websocketOptionsFactory,
          deps: [USER_OPTIONS]
        },
        {
          provide: APP_INITIALIZER,
          useFactory: noop,
          deps: [WebSocketClient],
          multi: true
        }
      ]
    };
  }
}
