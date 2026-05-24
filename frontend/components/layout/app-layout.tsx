'use client';

import { Sidebar } from './sidebar';
import { Navbar } from './navbar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      <main className="md:ml-64 mt-16 p-4 md:p-6">{children}</main>
    </div>
  );
}
