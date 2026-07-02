// True alpha cutouts of the swan bodies (no water, no baked reflection).
// The water glows brighter than the backlit swans, so luminance separates
// them cleanly: swan < ~230 < water.
import sharp from "sharp";
import fs from "fs";

const DIR = "E:/CLAUDE CODE INV/templates/islamic-royal/public/assets/";
const { data, info } = await sharp(DIR + "hero-background.webp")
  .raw().ensureAlpha().toBuffer({ resolveWithObject: true });
const W = info.width;

const WATERLINE = 812; // absolute y where the bodies meet the water

async function cut(name, x0, y0, x1) {
  const w = x1 - x0, h = WATERLINE - y0;
  const lum = (x, y) => {
    const i = ((y0 + y) * W + (x0 + x)) * 4;
    return 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  };
  const isSwan = (x, y) => lum(x, y) < 230;

  // largest connected swan component
  const label = new Int32Array(w * h).fill(-1);
  let best = -1, bestSize = 0, nl = 0;
  for (let s = 0; s < w * h; s++) {
    if (label[s] !== -1 || !isSwan(s % w, (s / w) | 0)) continue;
    const id = nl++;
    const q = [s]; label[s] = id; let head = 0, size = 0;
    while (head < q.length) {
      const i = q[head++]; size++;
      const x = i % w, y = (i / w) | 0;
      if (x + 1 < w && label[i + 1] === -1 && isSwan(x + 1, y)) { label[i + 1] = id; q.push(i + 1); }
      if (x - 1 >= 0 && label[i - 1] === -1 && isSwan(x - 1, y)) { label[i - 1] = id; q.push(i - 1); }
      if (y + 1 < h && label[i + w] === -1 && isSwan(x, y + 1)) { label[i + w] = id; q.push(i + w); }
      if (y - 1 >= 0 && label[i - w] === -1 && isSwan(x, y - 1)) { label[i - w] = id; q.push(i - w); }
    }
    if (size > bestSize) { bestSize = size; best = id; }
  }
  const mask = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) if (label[i] === best) mask[i] = 1;

  // fill interior holes (bright highlights inside the body)
  const outside = new Uint8Array(w * h);
  const q = [];
  const push = (i) => { if (!outside[i] && !mask[i]) { outside[i] = 1; q.push(i); } };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  let head = 0;
  while (head < q.length) {
    const i = q[head++];
    const x = i % w, y = (i / w) | 0;
    if (x + 1 < w) push(i + 1);
    if (x - 1 >= 0) push(i - 1);
    if (y + 1 < h) push(i + w);
    if (y - 1 >= 0) push(i - w);
  }
  for (let i = 0; i < w * h; i++) if (!mask[i] && !outside[i]) mask[i] = 1;

  // build RGBA: 2px feathered edges, 3px soft waterline fade at the bottom
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    const si = ((y0 + y) * W + (x0 + x)) * 4;
    const di = i * 4;
    out[di] = data[si]; out[di + 1] = data[si + 1]; out[di + 2] = data[si + 2];
    if (!mask[i]) { out[di + 3] = 0; continue; }
    let a = 255;
    const edge =
      (x > 0 && !mask[i - 1]) || (x < w - 1 && !mask[i + 1]) ||
      (y > 0 && !mask[i - w]) || (y < h - 1 && !mask[i + w]);
    if (edge) a = 110;
    else {
      const edge2 =
        (x > 1 && !mask[i - 2]) || (x < w - 2 && !mask[i + 2]) ||
        (y > 1 && !mask[i - 2 * w]) || (y < h - 2 && !mask[i + 2 * w]);
      if (edge2) a = 190;
    }
    if (y >= h - 3) a = Math.min(a, [140, 90, 45][y - (h - 3)]);
    out[di + 3] = a;
  }
  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(DIR + name);
  console.log(name, w + "x" + h, "swan px", bestSize, fs.statSync(DIR + name).size, "bytes");
}

await cut("swan-left.png", 350, 690, 516);
await cut("swan-right.png", 508, 690, 676);
console.log("DONE");
