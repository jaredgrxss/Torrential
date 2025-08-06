import bencode from "bencode";
import fs from "fs";
import { createHash } from "crypto";
import { toBuffer } from "bignum";

function open(filePath: string): any {
  return bencode.decode(fs.readFileSync(filePath));
}

function size(torrent: any): Buffer {
  const size = torrent.info.files
    ? torrent.info.files
        .map((file: any) => file.length)
        .reduce((a: number, b: number) => a + b)
    : torrent.info.length;
  return toBuffer(size, { endian: "big", size: 8 });
}

function infoHash(torrent: any): Buffer {
  const info = bencode.encode(torrent.info);
  return createHash("sha1").update(info).digest();
}

export { open, size, infoHash };
