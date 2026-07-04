import DashboardClient from "@/components/DashboardClient";

/**
 * Private client dashboard, one per wedding:
 *   https://your-domain.com/dashboard/WED-7XK92P
 */
export default async function DashboardPage({ params }) {
  const { weddingId } = await params;
  return <DashboardClient weddingId={weddingId} />;
}
