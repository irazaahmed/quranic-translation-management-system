import DashboardLayout from "@/components/DashboardLayout";
import { getMeetingById } from "@/lib/supabase";
import EditMeetingForm from "./EditMeetingForm";
import { notFound } from "next/navigation";
import Link from "next/link";

interface EditMeetingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMeetingPage({ params }: EditMeetingPageProps) {
  const { id } = await params;

  const meeting = await getMeetingById(id);

  if (!meeting) {
    notFound();
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-sm">
          <Link href="/languages" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200">
            Languages
          </Link>
          <span className="text-gray-400 dark:text-gray-600 transition-colors duration-200">/</span>
          <Link href={`/languages/${meeting.language_id}`} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200">
            Meetings
          </Link>
          <span className="text-gray-400 dark:text-gray-600 transition-colors duration-200">/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium transition-colors duration-200">Edit</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
          Edit Meeting
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
          Update meeting details and notes
        </p>
      </div>

      <EditMeetingForm meeting={meeting} />
    </DashboardLayout>
  );
}
