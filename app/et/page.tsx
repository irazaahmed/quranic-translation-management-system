import { redirect } from "next/navigation";

// The English Translation module landing. A dedicated dashboard comes in a
// later phase; for now route into the work items list.
export default function EtIndexPage() {
  redirect("/et/items");
}
