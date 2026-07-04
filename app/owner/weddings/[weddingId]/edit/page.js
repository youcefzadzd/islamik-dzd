import OwnerEdit from "@/components/owner/OwnerEdit";

export default async function OwnerEditPage({ params }) {
  const { weddingId } = await params;
  return <OwnerEdit weddingId={weddingId} />;
}
