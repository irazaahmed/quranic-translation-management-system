import DashboardLayout from "@/components/DashboardLayout";
import { getLanguageById } from "@/lib/supabase";
import EditLanguageForm from "./EditLanguageForm";
import { notFound } from "next/navigation";
import Link from "next/link";

interface EditLanguagePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLanguagePage({ params }: EditLanguagePageProps) {
  const { id } = await params;
  
  const language = await getLanguageById(id);
  
  if (!language) {
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
          <Link href={`/languages/${id}`} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200">
            {language.language}
          </Link>
          <span className="text-gray-400 dark:text-gray-600 transition-colors duration-200">/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium transition-colors duration-200">Edit</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
          Edit Language
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
          Update language details and settings
        </p>
      </div>

      <EditLanguageForm language={language} />
    </DashboardLayout>
  );
}
