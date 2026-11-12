/* OpenCommerce · gerador de ZIP (método store, sem dependências) */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

const encoder = new TextEncoder();
const u16 = (n) => [n & 0xff, (n >>> 8) & 0xff];
const u32 = (n) => [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];

/** Data/hora no formato MS-DOS. */
function dosDateTime(date = new Date()) {
  const time = ((date.getHours() & 0x1f) << 11) | ((date.getMinutes() & 0x3f) << 5) | ((date.getSeconds() / 2) & 0x1f);
  const day = (((date.getFullYear() - 1980) & 0x7f) << 9) | (((date.getMonth() + 1) & 0x0f) << 5) | (date.getDate() & 0x1f);
  return { time, day };
}

/**
 * Cria um ZIP.
 * @param {Array<{name:string, data:string|Uint8Array, dir?:boolean}>} files
 * @returns {Blob}
 */
export function createZip(files = []) {
  const chunks = [];
  const central = [];
  let offset = 0;
  const { time, day } = dosDateTime();

  const push = (arr) => {
    const bytes = arr instanceof Uint8Array ? arr : new Uint8Array(arr);
    chunks.push(bytes);
    offset += bytes.length;
  };

  for (const file of files) {
    const nameBytes = encoder.encode(file.name.replace(/\\/g, '/'));
    const isDir = !!file.dir || file.name.endsWith('/');
    const data = isDir ? new Uint8Array(0) : (typeof file.data === 'string' ? encoder.encode(file.data) : file.data);
    const crc = isDir ? 0 : crc32(data);

    const localOffset = offset;
    push(u32(0x04034b50));
    push(u16(20));
    push(u16(0x0800)); // UTF-8
    push(u16(0));      // store
    push(u16(time));
    push(u16(day));
    push(u32(crc));
    push(u32(data.length));
    push(u32(data.length));
    push(u16(nameBytes.length));
    push(u16(0));
    push(nameBytes);
    if (!isDir) push(data);

    central.push({ nameBytes, crc, size: data.length, localOffset, isDir });
  }

  const centralStart = offset;
  for (const entry of central) {
    push(u32(0x02014b50));
    push(u16(20));
    push(u16(20));
    push(u16(0x0800));
    push(u16(0));
    push(u16(time));
    push(u16(day));
    push(u32(entry.crc));
    push(u32(entry.size));
    push(u32(entry.size));
    push(u16(entry.nameBytes.length));
    push(u16(0));
    push(u16(0));
    push(u16(0));
    push(u16(0));
    push(u32(entry.isDir ? 0x10 : 0));
    push(u32(entry.localOffset));
    push(entry.nameBytes);
  }

  const centralSize = offset - centralStart;
  push(u32(0x06054b50));
  push(u16(0));
  push(u16(0));
  push(u16(central.length));
  push(u16(central.length));
  push(u32(centralSize));
  push(u32(centralStart));
  push(u16(0));

  return new Blob(chunks, { type: 'application/zip' });
}
