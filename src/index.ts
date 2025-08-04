import * as fs from "fs";
import * as path from "path";
import bencode from "bencode";
import { fileURLToPath } from "url";

try {
  const fileName = fileURLToPath(import.meta.url);
  const dir = path.dirname(fileName);
  const filePath = path.join(dir, "big-buck-bunny.torrent");

  const torrent: any = bencode.decode(fs.readFileSync(filePath));
  console.log(torrent.announce.toString("utf8"));
} catch (e) {
  console.log(`Error fetching file ${e}`);
}
