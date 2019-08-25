import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxsWebsocketExtensionComponent } from './ngxs-websocket-extension.component';

describe('NgxsWebsocketExtensionComponent', () => {
  let component: NgxsWebsocketExtensionComponent;
  let fixture: ComponentFixture<NgxsWebsocketExtensionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxsWebsocketExtensionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxsWebsocketExtensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
