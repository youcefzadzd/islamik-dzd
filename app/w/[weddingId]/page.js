import InvitationApp from "@/components/InvitationApp";

/**
 * Public invitation link, one per wedding:
 *   https://your-domain.com/w/WED-7XK92P
 * The weddingId in the URL scopes every RSVP response.
 */
export default async function WeddingPage({ params }) {
  const { weddingId } = await params;
  return <InvitationApp weddingIdOverride={weddingId} />;
}
