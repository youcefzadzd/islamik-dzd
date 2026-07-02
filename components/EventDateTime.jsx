import Reveal from "./Reveal";
import GsapDivider from "./GsapDivider";

export default function EventDateTime({ data }) {
  const { event } = data;

  return (
    <section className="px-6 py-20 bg-ivory-light text-center">
      <Reveal>
        <GsapDivider className="mb-8" />
        <p className="font-serif text-3xl sm:text-4xl text-emerald mb-2">
          {event.displayDay} {event.displayDate}
        </p>
        <p className="font-body text-xl text-gold-dark tracking-wide">{event.displayTime}</p>
      </Reveal>
    </section>
  );
}
