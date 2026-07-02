// Remove the baked-in wax seal from the envelope: diffusion fill, brightness
// matched to the paper, real high-pass paper texture transplanted from a
// plain patch of the same envelope, and faint crease lines.
import sharp from "sharp";
import fs from "fs";

const DIR = "E:/CLAUDE CODE INV/templates/islamic-royal/public/assets/";
const SRC = DIR + "envelope-closed.orig.webp";

const { data, info } = await sharp(SRC).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;

let cx = 0, cy = 0, n = 0;
const isRed = (i) => data[i * 4] - data[i * 4 + 1] > 50 && data[i * 4] > 70;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (isRed(y * W + x)) { cx += x; cy += y; n++; }
}
cx = Math.round(cx / n); cy = Math.round(cy / n);
let Rwax = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (isRed(y * W + x)) {
    const d = Math.hypot(x - cx, y - cy);
    if (d > Rwax) Rwax = d;
  }
}
const R = Math.ceil(Rwax) + 24;
console.log("seal at", cx, cy, "R", R);

const lum = (i) => 0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2];
const inMask = (x, y) => Math.hypot(x - cx, y - cy) <= R;

// ---- find a plain bright 64x64 patch of paper (low variance, high mean)
const P = 64;
let best = null;
for (let py = 8; py + P < H - 8; py += 16) {
  for (let px = 8; px + P < W - 8; px += 16) {
    if (Math.hypot(px + P / 2 - cx, py + P / 2 - cy) < R + P) continue;
    let sum = 0, sum2 = 0, ok = true;
    for (let y = 0; y < P && ok; y += 2) for (let x = 0; x < P; x += 2) {
      const i = (py + y) * W + (px + x);
      if (data[i * 4 + 3] < 200) { ok = false; break; }
      const l = lum(i);
      sum += l; sum2 += l * l;
    }
    if (!ok) continue;
    const cnt = (P / 2) * (P / 2);
    const mean = sum / cnt;
    const va = sum2 / cnt - mean * mean;
    if (mean > 200 && (!best || va < best.va)) best = { px, py, mean, va };
  }
}
console.log("patch", best);

// average bright paper color near the rim (for tone matching)
let pr = 0, pg = 0, pb = 0, pc = 0;
for (let a = 0; a < 360; a += 2) {
  const x = Math.round(cx + Math.cos(a) * (R + 12));
  const y = Math.round(cy + Math.sin(a) * (R + 12));
  const i = y * W + x;
  if (lum(i) > 205) { pr += data[i * 4]; pg += data[i * 4 + 1]; pb += data[i * 4 + 2]; pc++; }
}
pr /= pc; pg /= pc; pb /= pc;
console.log("paper tone", pr.toFixed(0), pg.toFixed(0), pb.toFixed(0));

// ---- seed + diffusion
for (let y = cy - R; y <= cy + R; y++) for (let x = cx - R; x <= cx + R; x++) {
  if (!inMask(x, y)) continue;
  const ang = Math.atan2(y - cy, x - cx);
  let sx = x, sy = y;
  for (let r = R + 3; r < R + 60; r += 2) {
    const qx = Math.round(cx + Math.cos(ang) * r);
    const qy = Math.round(cy + Math.sin(ang) * r);
    if (qx < 1 || qy < 1 || qx >= W - 1 || qy >= H - 1) break;
    sx = qx; sy = qy;
    if (lum(qy * W + qx) > 205) break;
  }
  for (let c = 0; c < 3; c++) data[(y * W + x) * 4 + c] = data[(sy * W + sx) * 4 + c];
}
const idxs = [];
for (let y = cy - R; y <= cy + R; y++) for (let x = cx - R; x <= cx + R; x++) {
  if (inMask(x, y)) idxs.push(y * W + x);
}
const tmp = new Float32Array(idxs.length * 3);
for (let iter = 0; iter < 350; iter++) {
  for (let k = 0; k < idxs.length; k++) {
    const i = idxs[k];
    for (let c = 0; c < 3; c++) {
      tmp[k * 3 + c] =
        (data[(i - 1) * 4 + c] + data[(i + 1) * 4 + c] + data[(i - W) * 4 + c] + data[(i + W) * 4 + c]) / 4;
    }
  }
  for (let k = 0; k < idxs.length; k++) {
    const i = idxs[k];
    for (let c = 0; c < 3; c++) data[i * 4 + c] = tmp[k * 3 + c];
  }
}

// ---- pull the fill toward the true paper tone (kills the muddy cast),
// stronger in the middle, seamless at the rim
for (const i of idxs) {
  const x = i % W, y = (i / W) | 0;
  const d = Math.hypot(x - cx, y - cy) / R;
  const w = 0.55 * (1 - d * d); // 0 at rim → 0.55 at center
  data[i * 4] += (pr - data[i * 4]) * w;
  data[i * 4 + 1] += (pg - data[i * 4 + 1]) * w;
  data[i * 4 + 2] += (pb - data[i * 4 + 2]) * w;
}

// ---- transplant real paper grain: high-pass of the plain patch, mirror-tiled
if (best) {
  const { px, py } = best;
  // box-blur the patch (two passes, radius 3) to get its low frequencies
  const patch = new Float32Array(P * P * 3);
  for (let y = 0; y < P; y++) for (let x = 0; x < P; x++) {
    const i = (py + y) * W + (px + x);
    for (let c = 0; c < 3; c++) patch[(y * P + x) * 3 + c] = data[i * 4 + c];
  }
  const blur = Float32Array.from(patch);
  const rad = 3;
  for (let pass = 0; pass < 2; pass++) {
    const b2 = Float32Array.from(blur);
    for (let y = 0; y < P; y++) for (let x = 0; x < P; x++) {
      for (let c = 0; c < 3; c++) {
        let s = 0, cnt = 0;
        for (let o = -rad; o <= rad; o++) {
          const xx = Math.min(P - 1, Math.max(0, x + o));
          s += b2[(y * P + xx) * 3 + c]; cnt++;
        }
        blur[(y * P + x) * 3 + c] = s / cnt;
      }
    }
    const b3 = Float32Array.from(blur);
    for (let y = 0; y < P; y++) for (let x = 0; x < P; x++) {
      for (let c = 0; c < 3; c++) {
        let s = 0, cnt = 0;
        for (let o = -rad; o <= rad; o++) {
          const yy = Math.min(P - 1, Math.max(0, y + o));
          s += b3[(yy * P + x) * 3 + c]; cnt++;
        }
        blur[(y * P + x) * 3 + c] = s / cnt;
      }
    }
  }
  const mirrorIdx = (v) => {
    const period = 2 * P;
    const m = ((v % period) + period) % period;
    return m < P ? m : period - 1 - m;
  };
  for (const i of idxs) {
    const x = i % W, y = (i / W) | 0;
    const txp = mirrorIdx(x - cx + 1000 * P), typ = mirrorIdx(y - cy + 1000 * P);
    const k = (typ * P + txp) * 3;
    for (let c = 0; c < 3; c++) {
      const hp = patch[k + c] - blur[k + c];
      data[i * 4 + c] = Math.max(0, Math.min(255, data[i * 4 + c] + hp * 0.9));
    }
  }
}

// ---- faint crease lines toward the corners
const dirs = [
  [0 - cx, 0 - cy],
  [W - cx, 0 - cy],
  [0 - cx, H - cy],
  [W - cx, H - cy],
].map(([dx, dy]) => { const l = Math.hypot(dx, dy); return [dx / l, dy / l]; });
for (const [dx, dy] of dirs) {
  for (let t = 0; t <= R + 2; t += 0.5) {
    const qx = cx + dx * t, qy = cy + dy * t;
    const strength = 3.5 * Math.min(1, t / (R * 0.5));
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      const x = Math.round(qx + ox), y = Math.round(qy + oy);
      if (!inMask(x, y)) continue;
      const w = Math.exp(-(ox * ox + oy * oy) / 2.5);
      const i = (y * W + x) * 4;
      for (let c = 0; c < 3; c++) data[i + c] = Math.max(0, data[i + c] - strength * w);
    }
  }
}

await sharp(data, { raw: { width: W, height: H, channels: 4 } })
  .webp({ quality: 88 })
  .toFile(DIR + "envelope-inpaint.tmp.webp");
console.log("done", fs.statSync(DIR + "envelope-inpaint.tmp.webp").size, "bytes");
