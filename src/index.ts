import * as path from "path";
import { fileURLToPath } from "url";
import { getPeers } from "./helpers/tracker.js";
import { open } from "./helpers/torrent-parser.js";
import { logger } from "./helpers/logger.js";

try {
  logger.info("Starting Torrential Client...");
  const fileName = fileURLToPath(import.meta.url);
  const dir = path.dirname(fileName);
  const filePath = path.join(dir, "mytest.torrent");
  const torrent: any = open(filePath);
  logger.info("Successfully parsed torrent file, attempting to get peers...");
  getPeers(torrent, (peers: any) => {});
} catch (e) {
  console.log(`Torrential Error: ${e}`);
}
