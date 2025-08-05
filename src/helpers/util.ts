import { randomBytes } from "crypto";

let id: Buffer;

function genId(): Buffer {
  if (!id) {
    id = randomBytes(20);
    Buffer.from('-AT0001-').copy(id, 0);
  }
  return id
}

export { genId }