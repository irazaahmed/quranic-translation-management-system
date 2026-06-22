import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile, canWrite } from "@/lib/auth";
import EtItemForm from "../EtItemForm";

export const dynamic = "force-dynamic";

export default async function NewEtItemPage() {
  const profile = await getCurrentProfile();
  if (!profile || !canWrite(profile.role)) {
    redirect("/et/items");
  }

  return (
    <DashboardLayout>
      <div className="mb-4">
        <Link href="/et/items" className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Work Items
        </Link>
      </div>
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">English Translation</p>
        <h1 className="mt-1 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">New Work Item</h1>
      </div>
      <EtItemForm />
    </DashboardLayout>
  );
}
