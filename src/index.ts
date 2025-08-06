import * as path from "path";
import { fileURLToPath } from "url";
import { getPeers } from "./helpers/tracker.js";
import { open } from "./helpers/torrent-parser.js";

try {
  const fileName = fileURLToPath(import.meta.url);
  const dir = path.dirname(fileName);
  const filePath = path.join(dir, "big-buck-bunny.torrent");
  const torrent: any = open(filePath);
  getPeers(torrent, (peers: any) => {});
} catch (e) {
  console.log(`Torrential Error: ${e}`);
}
