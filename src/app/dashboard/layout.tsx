import React from "react";
import { Users, Calendar, Inbox, Settings, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0b0c10] flex" dir="ltr">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-white/10 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-heading text-white">Alghdeer Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-[#cba135]/20 text-[#d4b458] rounded-lg font-medium">
            <Inbox size={20} />
            Orders & Inquiries
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
            <Calendar size={20} />
            Calendar
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
            <Users size={20} />
            Customers
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
            <Settings size={20} />
            Settings
          </a>
        </nav>
        <div className="p-4 border-t border-white/10">
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
            <LogOut size={20} />
            Logout
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-20 bg-black/40 border-b border-white/10 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-white">Dashboard Overview</h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#cba135] flex items-center justify-center text-black font-bold">
              AD
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
