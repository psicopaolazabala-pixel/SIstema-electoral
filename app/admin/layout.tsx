// app/admin/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const esPaginaLogin = pathname === '/admin/login';

  // Si es la página de login, se muestra limpia a pantalla completa
  if (esPaginaLogin) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center">
        {children}
      </div>
    );
  }

  // Para el resto de rutas protegidas (/admin/resultados, /admin/padron, etc.)
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}