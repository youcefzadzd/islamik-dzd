// Shared helper for drawing an N-pointed star polygon (used for the
// "rub el hizb"-style 8-point star motif) without any raster images.
export function buildStarPoints(cx, cy, spikes, outerRadius, innerRadius) {
  const step = Math.PI / spikes;
  let rotation = (Math.PI / 2) * 3;
  const points = [];

  for (let i = 0; i < spikes; i++) {
    let x = cx + Math.cos(rotation) * outerRadius;
    let y = cy + Math.sin(rotation) * outerRadius;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    rotation += step;

    x = cx + Math.cos(rotation) * innerRadius;
    y = cy + Math.sin(rotation) * innerRadius;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    rotation += step;
  }

  return points.join(" ");
}
