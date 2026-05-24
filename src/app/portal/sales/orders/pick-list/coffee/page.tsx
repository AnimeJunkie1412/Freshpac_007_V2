import {
  OrderPickListPrintView,
  type PickListSearchParams
} from "@/components/print/order-pick-list-print-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CoffeePickListPrintPage({
  searchParams
}: {
  searchParams?: PickListSearchParams;
}) {
  return (
    <OrderPickListPrintView
      searchParams={searchParams}
      kind="COFFEE"
      title="Coffee Pick List"
      description="Coffee-related product quantities from the current filtered order list."
    />
  );
}