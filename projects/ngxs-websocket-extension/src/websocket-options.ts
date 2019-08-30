export interface WebSocketOptions {
  url?: string;
  protocol?: string;
  typeKey?: string;
  binaryType?: string;
  serializer?: (payload: any) => string;
  deserializer?: (e: MessageEvent) => any;
}
