// One-off generator for icon.png — no runtime dependency, just a build asset.
// Draws a bold "E" monogram (Bebas-ish block letter) on the app's dark glass
// gradient, in the same volt-lime/blue accent pair used across the tracker
// family. Pure Node (zlib + hand-rolled PNG encoder), no npm deps.
const zlib = require('zlib');

const W = 512, H = 512;
const buf = Buffer.alloc(W * H * 4);

function setPx(x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  // simple alpha blend over whatever is already there
  const srcA = a / 255;
  buf[i]     = Math.round(r * srcA + buf[i]     * (1 - srcA));
  buf[i + 1] = Math.round(g * srcA + buf[i + 1] * (1 - srcA));
  buf[i + 2] = Math.round(b * srcA + buf[i + 2] * (1 - srcA));
  buf[i + 3] = 255;
}

function lerp(a, b, t) { return a + (b - a) * t; }

// —— Background: vertical dark gradient + two soft radial glows (mesh wash,
// same recipe as body::before in the app CSS) ——
for (let y = 0; y < H; y++) {
  const t = y / H;
  const base = [lerp(13, 5, t), lerp(13, 5, t), lerp(18, 7, t)];
  for (let x = 0; x < W; x++) {
    let r = base[0], g = base[1], b = base[2];
    // blue glow, top-left
    const dx1 = x - W * 0.22, dy1 = y - H * 0.10;
    const d1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) / (W * 0.62);
    const g1 = Math.max(0, 1 - d1);
    r = lerp(r, 41, g1 * 0.35); g = lerp(g, 121, g1 * 0.35); b = lerp(b, 255, g1 * 0.35);
    // green glow, bottom-right
    const dx2 = x - W * 0.86, dy2 = y - H * 0.94;
    const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) / (W * 0.55);
    const g2 = Math.max(0, 1 - d2);
    r = lerp(r, 182, g2 * 0.16); g = lerp(g, 255, g2 * 0.16); b = lerp(b, 46, g2 * 0.16);
    setPx(x, y, Math.round(r), Math.round(g), Math.round(b), 255);
  }
}

function roundedRect(x0, y0, x1, y1, rad, col, alpha) {
  for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
    for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
      let inside = x >= x0 && x <= x1 && y >= y0 && y <= y1;
      if (inside && rad > 0) {
        // corner rounding
        const cx = x < x0 + rad ? x0 + rad : (x > x1 - rad ? x1 - rad : null);
        const cy = y < y0 + rad ? y0 + rad : (y > y1 - rad ? y1 - rad : null);
        if (cx !== null && cy !== null) {
          const dx = x - cx, dy = y - cy;
          inside = (dx * dx + dy * dy) <= rad * rad;
        }
      }
      if (inside) setPx(x, y, col[0], col[1], col[2], alpha);
    }
  }
}

// —— Glyph: bold block "E" ——
const GREEN = [182, 255, 46];
const stemX0 = 152, stemX1 = 220, top = 128, bottom = 384, R = 12;
roundedRect(stemX0, top, stemX1, bottom, R, GREEN, 255);           // vertical stem
roundedRect(stemX0, top, 352, top + 62, R, GREEN, 255);            // top bar
roundedRect(stemX0, 225, 322, 287, R, GREEN, 255);                 // middle bar
roundedRect(stemX0, bottom - 62, 352, bottom, R, GREEN, 255);      // bottom bar

// —— Accent underline (blue), echoes the dual-accent system ——
roundedRect(152, 410, 352, 424, 6, [41, 121, 255], 255);

// —— PNG encoding (8-bit RGBA, filter type 0 per scanline) ——
function crc32(buf) {
  let c, crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = (crc ^ buf[i]) & 0xFF;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

const raw = Buffer.alloc((W * 4 + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (W * 4 + 1)] = 0; // filter: none
  buf.copy(raw, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4);
}
const idat = zlib.deflateSync(raw, { level: 9 });

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
const png = Buffer.concat([
  sig,
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0))
]);

require('fs').writeFileSync(__dirname + '/icon.png', png);
console.log('icon.png written', png.length, 'bytes');
