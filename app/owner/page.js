import OwnerDashboard from "@/components/owner/OwnerDashboard";

/** Internal owner dashboard — protected by OWNER_PASSWORD (server env). */
export default function OwnerPage() {
  return <OwnerDashboard />;
}
