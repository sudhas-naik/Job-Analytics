import { Suspense } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function NavbarFallback() {
  return (
    <header className="fixed left-64 right-0 top-0 z-10 h-16 border-b border-white/60 bg-white/70 backdrop-blur-xl" />
  );
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      <main className="ml-64 min-h-screen pt-16">
        <div data-page className="mx-auto max-w-6xl p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
