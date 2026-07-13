import OwnerEdit from "@/components/owner/OwnerEdit";

export default async function OwnerEditPage({ params, searchParams }) {
  const { weddingId } = await params;
  const sp = await searchParams;
  // ?embed=1 : وضع «صفحة ملء البيانات» — بلا قائمة جانبية ولا شريط علوي
  return <OwnerEdit weddingId={weddingId} embed={sp?.embed === "1"} />;
}
