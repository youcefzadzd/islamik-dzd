import Reveal from "./Reveal";

export default function InvitationMessage({ data }) {
  return (
    <section className="px-6 py-20 bg-ivory">
      <div className="invite-card text-center">
        <Reveal>
          {data.invitationMessage.lines.map((line, i) => (
            <p
              key={i}
              className="font-body italic text-xl sm:text-2xl leading-relaxed text-ink/90 text-balance mb-4 last:mb-0"
            >
              {line}
            </p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
