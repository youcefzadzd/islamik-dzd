import { Suspense } from "react";
import OrderForm from "@/components/site/OrderForm";

export const metadata = {
  title: "اطلب دعوتك | Commander votre invitation",
};

export default function OrderPage() {
  return (
    <Suspense fallback={null}>
      <OrderForm />
    </Suspense>
  );
}
