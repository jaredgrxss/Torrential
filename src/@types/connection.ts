export interface ConnectionResponse {
  action: number;
  transactionId: number;
  connectionId: Buffer<ArrayBufferLike>;
}

export interface AnnounceResponse {
  action: number;
  transactionId: number;
  leechers: number;
  seeders: number;
  peers: {
    ip: string;
    port: number;
  }[];
}
