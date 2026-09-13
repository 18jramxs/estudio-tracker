// One-off generator for icon.png — no runtime dependency, just a build asset.
// Abstract open-book glyph: bold white pages on a pure black ground, the same
// flat glyph-on-black idiom as gym-tracker's dumbbell icon and 1000m's
// wordmark (no gradients, no accent color — just white on #000).
// Pure Node (zlib + hand-rolled PNG encoder), no npm deps.
const zlib = require('zlib');

const W = 1024, H = 1024;
const buf = Buffer.alloc(W * H * 4);

function setPx(x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  const srcA = a / 255;
  buf[i]     = Math.round(r * srcA + buf[i]     * (1 - srcA));
  buf[i + 1] = Math.round(g * srcA + buf[i + 1] * (1 - srcA));
  buf[i + 2] = Math.round(b * srcA + buf[i + 2] * (1 - srcA));
  buf[i + 3] = 255;
}

// —— Background: pure black ——
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) setPx(x, y, 0, 0, 0, 255);

function roundedRect(x0, y0, x1, y1, rad, col, alpha) {
  for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
    for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
      let inside = x >= x0 && x <= x1 && y >= y0 && y <= y1;
      if (inside && rad > 0) {
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

const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];

// —— One open-book silhouette (not two separate cards): a single rounded
// shape with a thin center crease cut out of it, so it reads as one object
// split into two pages rather than two documents side by side. ——
roundedRect(160, 240, 864, 784, 48, WHITE, 255);
roundedRect(506, 240, 518, 784, 0, BLACK, 255);

// —— Text-line cutouts (negative space) echo the dumbbell icon's cutout
// stripes — a "title" block left solid up top, ruled lines below. ——
const lineYs = [452, 552, 652];
lineYs.forEach(y => {
  roundedRect(196, y, 486, y + 18, 6, BLACK, 255);
  roundedRect(538, y, 828, y + 18, 6, BLACK, 255);
});

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
