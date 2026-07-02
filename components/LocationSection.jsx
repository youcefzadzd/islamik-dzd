import Reveal from "./Reveal";

export default function LocationSection({ data }) {
  const { location } = data;

  return (
    <section className="px-6 py-20 bg-ivory text-center">
      <div className="invite-card">
        <Reveal>
          <p className="font-serif text-3xl text-emerald mb-2">{location.venueName}</p>
          <p className="font-body text-lg text-ink/80 mb-8">{location.address}</p>
          <a
            href={location.mapLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-emerald text-ivory text-sm tracking-[0.15em] uppercase shadow-card hover:bg-emerald-dark transition-colors"
          >
            {location.buttonText}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
