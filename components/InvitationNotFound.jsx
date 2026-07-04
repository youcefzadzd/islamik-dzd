import { CornerOrnament, CardFlourish } from "./ornaments";

/** shown when a /w/ link does not match any wedding */
export default function InvitationNotFound() {
  return (
    <main className="page-paper flex min-h-screen items-center justify-center px-4 py-10">
      <div className="lux-panel relative mx-auto w-full max-w-md px-6 py-14 text-center sm:px-10">
        <CornerOrnament className="pointer-events-none absolute left-1 top-1 w-16 sm:w-20" />
        <CornerOrnament className="pointer-events-none absolute right-1 top-1 w-16 -scale-x-100 sm:w-20" />
        <CornerOrnament className="pointer-events-none absolute bottom-1 left-1 w-16 -scale-y-100 sm:w-20" />
        <CornerOrnament className="pointer-events-none absolute bottom-1 right-1 w-16 -scale-x-100 -scale-y-100 sm:w-20" />
        <div className="relative">
          <div className="flex justify-center pb-6">
            <CardFlourish />
          </div>
          <p className="font-monogram text-5xl text-gold-dark">Oups…</p>
          <p className="mt-6 font-body text-lg leading-relaxed text-ink/80">
            Cette invitation n'existe pas ou n'est plus disponible.
            <br />
            Vérifiez le lien reçu de la part des mariés.
          </p>
          <p className="rtl mt-4 font-arabicText text-lg text-ink/70">
            هذه الدعوة غير موجودة — يرجى التحقق من الرابط.
          </p>
          <div className="divider mt-8">
            <span className="text-gold">✦</span>
          </div>
        </div>
      </div>
    </main>
  );
}
