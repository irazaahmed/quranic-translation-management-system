import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-200">
      <Sidebar />
      <div className="lg:ml-64 flex flex-col min-w-0 min-h-screen overflow-visible">
        <Header />
        <main className="animate-fade-in flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 w-full max-w-full overflow-x-clip">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
