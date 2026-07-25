"use client";

/**
 * أصوات لوحة التحكم — مولّدة عبر Web Audio (بلا ملفات صوتية).
 * ثلاث نغمات قصيرة هادئة:
 *   uiClick   نقرة ناعمة — اختيارات وحركات عادية (motif/NRP، باقة، dispatch…)
 *   uiSuccess نغمة صاعدة — تأكيد ناجح (Confirmer، Livré، حفظ…)
 *   uiError   نغمة هابطة — إلغاء / حذف / رجوع
 * كل الدوال آمنة: أي فشل (متصفح قديم، سياق مقفل) يُتجاهل بصمت.
 */

let ctx = null;

function ac() {
  const AC = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq, delay, dur, type = "sine", gain = 0.07) {
  const c = ac();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(g);
  g.connect(c.destination);
  const t0 = c.currentTime + delay;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

export function uiClick() {
  try {
    tone(880, 0, 0.06, "triangle", 0.05);
  } catch {}
}

export function uiSuccess() {
  try {
    tone(660, 0, 0.09, "sine", 0.07);
    tone(990, 0.09, 0.16, "sine", 0.07);
  } catch {}
}

export function uiError() {
  try {
    tone(320, 0, 0.11, "triangle", 0.06);
    tone(215, 0.1, 0.18, "triangle", 0.06);
  } catch {}
}
