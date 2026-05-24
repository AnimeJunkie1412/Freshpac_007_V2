import {
  OrderPickListPrintView,
  type PickListSearchParams
} from "@/components/print/order-pick-list-print-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RetailPickListPrintPage({
  searchParams
}: {
  searchParams?: PickListSearchParams;
}) {
  return (
    <OrderPickListPrintView
      searchParams={searchParams}
      kind="RETAIL"
      title="Retail Pick List"
      description="Retail-order product quantities from the current filtered order list."
    />
  );
}