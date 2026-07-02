"use client";

import { useState } from "react";
import EnvelopeReveal from "./EnvelopeReveal";
import AyahSection from "./AyahSection";
import CoupleNames from "./CoupleNames";
import InvitationMessage from "./InvitationMessage";
import EventDateTime from "./EventDateTime";
import LocationSection from "./LocationSection";
import Countdown from "./Countdown";
import RsvpSection from "./RsvpSection";
import DuaSection from "./DuaSection";
import SignatureFooter from "./SignatureFooter";

export default function InvitationApp({ data }) {
  const [opened, setOpened] = useState(false);

  return (
    <>
      {!opened && <EnvelopeReveal data={data} onOpen={() => setOpened(true)} />}

      {opened && (
        <main className="relative">
          <AyahSection data={data} />
          <CoupleNames data={data} />
          <InvitationMessage data={data} />
          <EventDateTime data={data} />
          <LocationSection data={data} />
          <Countdown targetDateISO={data.event.dateTimeISO} />
          <RsvpSection data={data} />
          <DuaSection data={data} />
          <SignatureFooter data={data} />
        </main>
      )}
    </>
  );
}
