import { TestBed } from '@angular/core/testing';

import { NgxsWebsocketExtensionService } from './ngxs-websocket-extension.service';

describe('NgxsWebsocketExtensionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgxsWebsocketExtensionService = TestBed.get(NgxsWebsocketExtensionService);
    expect(service).toBeTruthy();
  });
});
