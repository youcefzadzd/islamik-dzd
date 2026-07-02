import Reveal from "./Reveal";
import EightPointStar from "./ornaments/EightPointStar";

export default function SignatureFooter({ data }) {
  return (
    <footer className="px-6 py-16 bg-ivory-dark text-center">
      <Reveal>
        <span className="inline-block text-gold mb-6">
          <EightPointStar size={32} strokeOnly />
        </span>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-8 font-body italic text-lg text-ink/80">
          <p>{data.signature.groomFamilyLabel}</p>
          <span className="hidden sm:inline text-gold">•</span>
          <p>{data.signature.brideFamilyLabel}</p>
        </div>
      </Reveal>
    </footer>
  );
}
