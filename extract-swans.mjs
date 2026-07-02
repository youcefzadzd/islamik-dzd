// Extract the two swans (with their reflections) from hero-background.webp as
// feathered sprites, and synthesize a water patch that covers their baked
// position. The hero asset itself is left untouched.
import sharp from "sharp";
import fs from "fs";

const DIR = "E:/CLAUDE CODE INV/templates/islamic-royal/public/assets/";
const { data, info } = await sharp(DIR + "hero-background.webp")
  .raw().ensureAlpha().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
console.log("hero", W, H);

const CENTER_X = 512;

function ramp(d, size) {
  if (d <= 0) return 0;
  if (d >= size) return 1;
  return 0.5 - 0.5 * Math.cos((d / size) * Math.PI);
}

async function sprite(name, x0, y0, w, h, sharpEdge /* "right"|"left" */) {
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const si = ((y0 + y) * W + (x0 + x)) * 4;
      const di = (y * w + x) * 4;
      out[di] = data[si]; out[di + 1] = data[si + 1]; out[di + 2] = data[si + 2];
      const F = 20; // soft feather
      const fLeft = sharpEdge === "left" ? ramp(x, 3) : ramp(x, F);
      const fRight = sharpEdge === "right" ? ramp(w - 1 - x, 3) : ramp(w - 1 - x, F);
      const a = Math.min(fLeft, fRight, ramp(y, F), ramp(h - 1 - y, F));
      out[di + 3] = Math.round(255 * a);
    }
  }
  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .webp({ quality: 90 })
    .toFile(DIR + name);
  console.log(name, w + "x" + h, fs.statSync(DIR + name).size, "bytes");
}

// left swan sprite: up to the centerline (beaks meet there), sharp cut on right
await sprite("hero-swan-left.webp", 350, 695, 165, 205, "right"); // 350..515
// right swan sprite: from just left of the centerline, sharp cut on left
await sprite("hero-swan-right.webp", 509, 695, 166, 205, "left"); // 509..675

// water patch: per-row horizontal interpolation between clean water either side
{
  const x0 = 336, y0 = 690, w = 358, h = 215; // covers both swans + reflections
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    // sample clean water just outside the patch on each side
    const li = ((y0 + y) * W + (x0 - 6)) * 4;
    const ri = ((y0 + y) * W + (x0 + w + 6)) * 4;
    for (let x = 0; x < w; x++) {
      const t = x / (w - 1);
      const di = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const v = data[li + c] * (1 - t) + data[ri + c] * t;
        out[di + c] = Math.max(0, Math.min(255, v + (Math.random() - 0.5) * 4));
      }
      const F = 24;
      const a = Math.min(ramp(x, F), ramp(w - 1 - x, F), ramp(y, F), ramp(h - 1 - y, F));
      out[di + 3] = Math.round(255 * a);
    }
  }
  // slight vertical smoothing to keep the horizontal streaks natural
  const sm = Buffer.from(out);
  for (let y = 1; y < h - 1; y++) for (let x = 0; x < w; x++) {
    const di = (y * w + x) * 4;
    for (let c = 0; c < 3; c++) {
      out[di + c] = Math.round(
        0.5 * sm[di + c] + 0.25 * sm[di - w * 4 + c] + 0.25 * sm[di + w * 4 + c]
      );
    }
  }
  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .webp({ quality: 88 })
    .toFile(DIR + "hero-water-patch.webp");
  console.log("hero-water-patch.webp", fs.statSync(DIR + "hero-water-patch.webp").size, "bytes");
}
console.log("DONE");
