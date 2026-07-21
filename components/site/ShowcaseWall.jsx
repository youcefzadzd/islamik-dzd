"use client";

/**
 * جدار العرض المتحرك في الهيرو — صفّان من بطاقات القوالب الحقيقية
 * يمرّان باتجاهين متعاكسين خلف هاتف مركزي يشغّل فيديو الظرف.
 *
 * الآلية: كل صف يُكرَّر محتواه (نصفان متطابقان) وينزلق translateX
 * من 0 إلى ‎-50%‎ في حلقة خطية لا نهائية — لا يظهر أي فراغ أبدًا.
 * النصف الواحد = 3 تكرارات للمجموعة الفريدة حتى يتجاوز عرض أكبر
 * الشاشات (‎≥1920px‎). الحاوية dir="ltr" دائمًا لأن الحركة زخرفية
 * ولا يجوز أن ينقلب الانزلاق في الواجهة العربية.
 */

const ROW_A = [
  "/assets/site/showcase/a-ir-hero.webp",
  "/assets/site/showcase/a-sg-invite.webp",
  "/assets/site/showcase/a-fl-env.webp",
  "/assets/site/showcase/a-ir-quote.webp",
  "/assets/site/showcase/a-sg-hero.webp",
  "/assets/site/showcase/a-fl-invite.webp",
  "/assets/site/showcase/a-ir-env.webp",
  "/assets/site/showcase/a-sg-env.webp",
  "/assets/site/showcase/a-fl-hero.webp",
];

const ROW_B = [
  "/assets/site/showcase/b-sg-seal.webp",
  "/assets/site/showcase/b-fl-prog.webp",
  "/assets/site/showcase/b-ir-seal.webp",
  "/assets/site/showcase/b-sg-prog.webp",
  "/assets/site/showcase/b-fl-seal.webp",
  "/assets/site/showcase/b-ir-prog.webp",
  "/assets/site/showcase/b-sg-paper.webp",
  "/assets/site/showcase/b-fl-paper.webp",
  "/assets/site/showcase/b-ir-paper.webp",
];

/* نصف الشريط = تكراران (9 بطاقات ×2 ×132px ≈ 2376px ≥ أعرض الشاشات)؛
   الشريط الكامل = النصف ×2 للحلقة المتصلة */
const half = (arr) => [...arr, ...arr];
const strip = (arr) => [...half(arr), ...half(arr)];

function Row({ tiles, variant }) {
  return (
    <div className={`dz-sc-row dz-sc-row--${variant}`} aria-hidden>
      {strip(tiles).map((src, i) => (
        <div key={i} className="dz-sc-tile">
          <img src={src} alt="" loading={i < 12 ? "eager" : "lazy"} draggable={false} />
        </div>
      ))}
    </div>
  );
}

export default function ShowcaseWall() {
  return (
    <div dir="ltr" className="dz-sc-wall" aria-hidden>
      <style
        dangerouslySetInnerHTML={{
          __html: `
.dz-sc-wall{position:relative;height:560px;overflow:hidden;contain:layout paint}
@media (min-width:640px){.dz-sc-wall{height:600px}}
.dz-sc-rows{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;gap:14px;z-index:1}
.dz-sc-row{display:flex;gap:12px;width:max-content;will-change:transform;animation:dz-sc-scroll linear infinite}
.dz-sc-row--a{animation-duration:70s}
.dz-sc-row--b{animation-duration:95s;animation-direction:reverse}
@keyframes dz-sc-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@media (prefers-reduced-motion:reduce){.dz-sc-row{animation:none}}
.dz-sc-tile{flex-shrink:0;width:120px;height:270px;border-radius:14px;overflow:hidden;
  box-shadow:0 14px 32px -20px rgb(63 28 34 / .35);border:1px solid rgb(201 168 106 / .25)}
.dz-sc-tile img{width:100%;height:100%;object-fit:cover;display:block}
.dz-sc-spot{position:absolute;left:50%;top:50%;width:640px;height:640px;transform:translate(-50%,-50%);
  background:radial-gradient(closest-side,rgb(250 246 240 / .88),rgb(250 246 240 / .3) 55%,transparent 75%);z-index:2}
.dz-sc-blend{position:absolute;inset-inline:0;bottom:0;height:120px;
  background:linear-gradient(to bottom,transparent,var(--ivory,#FAF6F0));z-index:3}
.dz-sc-phone{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:4;
  width:210px;height:436px;border-radius:36px;padding:2px;
  background:linear-gradient(160deg,#2a1f22 0%,#1f1518 100%);
  box-shadow:0 0 0 1px rgb(255 255 255 / .06),0 30px 60px -22px rgb(30 8 13 / .5)}
@media (min-width:640px){.dz-sc-phone{width:240px;height:498px;border-radius:40px}}
.dz-sc-phone__screen{position:relative;width:100%;height:100%;border-radius:34px;overflow:hidden;background:#14100f}
@media (min-width:640px){.dz-sc-phone__screen{border-radius:38px}}
.dz-sc-phone__screen video{width:100%;height:100%;object-fit:cover;display:block}
.dz-sc-phone__notch{position:absolute;top:10px;left:50%;transform:translateX(-50%);
  width:72px;height:18px;border-radius:12px;background:#14100f;z-index:2}
.dz-sc-phone__glare{position:absolute;inset:0;border-radius:34px;z-index:1;pointer-events:none;
  background:linear-gradient(135deg,rgb(255 255 255 / .16) 0%,rgb(255 255 255 / .03) 30%,transparent 60%)}
`,
        }}
      />

      <div className="dz-sc-rows">
        <Row tiles={ROW_A} variant="a" />
        <Row tiles={ROW_B} variant="b" />
      </div>

      <div className="dz-sc-spot" />
      <div className="dz-sc-blend" />

      {/* الهاتف المركزي — تسجيل حقيقي لظرف Islamic Royal وهو يُفتح */}
      <div className="dz-sc-phone">
        <div className="dz-sc-phone__screen">
          <video
            src="/assets/site/showcase/phone-opening.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          <span className="dz-sc-phone__glare" />
          <span className="dz-sc-phone__notch" />
        </div>
      </div>
    </div>
  );
}
