import * as dgram from "dgram";
import { Buffer } from "buffer";
import { randomBytes } from "crypto";
import { genId } from "./util.js";
import { AnnounceResponse, ConnectionResponse } from "../@types/connection.js";
import { logger } from "./logger.js";
import * as torrentParser from "./torrent-parser.js";

function getPeers(torrent: any, callback: Function) {
  const socket: dgram.Socket = dgram.createSocket("udp4");
  const url: URL = new URL(new TextDecoder().decode(torrent.announce));

  logger.info("Step 1: sending udp message now");
  sendUDP(socket, buildConnReq(), url);

  socket.on("message", (res) => {
    if (resType(res) === "connect") {
      logger.info(
        "Step 2: Response type was a connection, building announce request."
      );
      const connRes: ConnectionResponse = parseConnResponse(res);
      sendUDP(socket, buildAnnounceReq(connRes.connectionId, torrent), url);
    } else if (resType(res) === "announce") {
      logger.info(
        "Step 2: Response type was an announce, passing the peers back to the original caller."
      );
      const announceRes = parseAnnounceRes(res);
      callback(announceRes);
    }
  });

  socket.on("error", (err) => {
    logger.error("Socket error:", err);
    socket.close();
  });
}

function sendUDP(
  socket: dgram.Socket,
  message: Buffer<ArrayBuffer>,
  url: URL,
  callback = () => {}
) {
  socket.send(
    message,
    0,
    message.length,
    Number(url.port),
    url.hostname,
    callback
  );
}

function resType(res: Buffer<ArrayBufferLike>): string {
  return res.readUInt32BE(0) === 0 ? "connect" : "announce";
}

function buildConnReq(): Buffer<ArrayBuffer> {
  const buf: Buffer<ArrayBuffer> = Buffer.alloc(16);
  // connection id
  buf.writeBigUInt64BE(0x41727101980n, 0);
  // action
  buf.writeUInt32BE(0, 8);
  // transaction id
  randomBytes(4).copy(buf, 12);
  return buf;
}

function buildAnnounceReq(
  connId: Buffer<ArrayBufferLike>,
  torrent: any,
  port: number = 6881
): Buffer<ArrayBuffer> {
  const buf: Buffer<ArrayBuffer> = Buffer.allocUnsafe(98);
  connId.copy(buf, 0);
  buf.writeUInt32BE(1, 8); // action
  randomBytes(4).copy(buf, 12); // transaction id
  torrentParser.infoHash(torrent).copy(buf, 16); // info hash
  genId().copy(buf, 36); // peerId
  Buffer.alloc(8).copy(buf, 56); // downloaded
  torrentParser.size(torrent).copy(buf, 64); // left
  Buffer.alloc(8).copy(buf, 72); // uploaded
  buf.writeUInt32BE(0, 80); // event
  buf.writeUInt32BE(0, 84); // ip address
  randomBytes(4).copy(buf, 88); // key
  buf.writeInt32BE(-1, 92); // num want
  buf.writeUInt16BE(port, 96); // port

  return buf;
}

function parseConnResponse(res: Buffer<ArrayBufferLike>): ConnectionResponse {
  return {
    action: res.readUInt32BE(0),
    transactionId: res.readUInt32BE(4),
    connectionId: res.subarray(8),
  };
}

function parseAnnounceRes(res: Buffer<ArrayBufferLike>): AnnounceResponse {
  function group(
    iterable: Buffer<ArrayBufferLike>,
    groupSize: number
  ): Buffer<ArrayBufferLike>[] {
    let groups: Buffer<ArrayBufferLike>[] = [];
    for (let i = 0; i < iterable.length; i += groupSize) {
      groups.push(iterable.subarray(i, i + groupSize));
    }
    return groups;
  }
  return {
    action: res.readUInt32BE(0),
    transactionId: res.readUInt32BE(4),
    leechers: res.readUInt32BE(8),
    seeders: res.readUInt32BE(12),
    peers: group(res.subarray(20), 6).map((address) => {
      return {
        ip: address.subarray(0, 4).join("."),
        port: address.readUInt16BE(4),
      };
    }),
  };
}

export { getPeers };
