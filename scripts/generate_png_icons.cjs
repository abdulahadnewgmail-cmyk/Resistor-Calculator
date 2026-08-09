const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crcVal = crc32(typeAndData);
  buf.writeUInt32BE(crcVal, 8 + len);
  return buf;
}

function createPNG(width, height, drawPixelFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = createChunk('IHDR', ihdrData);

  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter 0
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixelFn(x, y, width, height);
      rawData[offset++] = Math.min(255, Math.max(0, Math.round(r)));
      rawData[offset++] = Math.min(255, Math.max(0, Math.round(g)));
      rawData[offset++] = Math.min(255, Math.max(0, Math.round(b)));
      rawData[offset++] = Math.min(255, Math.max(0, Math.round(a)));
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function renderResistorIcon(x, y, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const scale = width / 512;

  const bgR = 15, bgG = 23, bgB = 42;
  
  const isWire = Math.abs(y - cy) <= 10 * scale && x >= 30 * scale && x <= 482 * scale;
  
  const rx = x - cx;
  const ry = y - cy;
  
  const inBody = (Math.abs(rx) <= 140 * scale) && (Math.abs(ry) <= 55 * scale);
  const inBulgeLeft = Math.hypot(rx + 140 * scale, ry) <= 55 * scale;
  const inBulgeRight = Math.hypot(rx - 140 * scale, ry) <= 55 * scale;
  const isBody = inBody || inBulgeLeft || inBulgeRight;

  if (isBody) {
    if (rx >= -115 * scale && rx <= -85 * scale) {
      return [234, 179, 8, 255]; // Yellow
    }
    if (rx >= -55 * scale && rx <= -25 * scale) {
      return [168, 85, 247, 255]; // Violet
    }
    if (rx >= 5 * scale && rx <= 35 * scale) {
      return [249, 115, 22, 255]; // Orange
    }
    if (rx >= 85 * scale && rx <= 115 * scale) {
      return [234, 179, 8, 255]; // Gold
    }
    return [226, 232, 240, 255];
  }

  if (isWire) {
    return [148, 163, 184, 255]; // Slate metallic wire
  }

  return [bgR, bgG, bgB, 255];
}

const p192 = createPNG(192, 192, renderResistorIcon);
const p512 = createPNG(512, 512, renderResistorIcon);

fs.writeFileSync(path.join(__dirname, '../public/icon-192.png'), p192);
fs.writeFileSync(path.join(__dirname, '../public/icon-512.png'), p512);

console.log('Successfully generated true PNG icons: 192x192 (' + p192.length + ' bytes) and 512x512 (' + p512.length + ' bytes)');
