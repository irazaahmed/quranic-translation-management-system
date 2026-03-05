import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar />
      <div className="flex flex-1 flex-col lg:pl-64 w-full">
        <Header />
        <main className="flex-1 p-3 sm:p-4 lg:p-6 w-full overflow-x-hidden">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
