// components/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { BarChart3, Users, UserPlus, FileText, Vote, LogOut } from 'lucide-react';

const enlacesNav = [
  { href: '/admin/resultados', etiqueta: 'Escrutinio Real-Time', icono: BarChart3 },
  { href: '/admin/padron', etiqueta: 'Censo de Aprendices', icono: Users },
  { href: '/admin/candidatos', etiqueta: 'Gestión Candidatos', icono: UserPlus },
  { href: '/admin/actas', etiqueta: 'Actas de Escrutinio', icono: FileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-4 flex flex-col justify-between border-r border-slate-800 min-h-screen">
      <div className="space-y-6">
        <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-3">
          <Vote className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-white font-bold text-sm">Comité Electoral</h2>
            <p className="text-xs text-slate-500">Administración SENA</p>
          </div>
        </div>

        <nav className="space-y-1">
          {enlacesNav.map((item) => {
            const Icono = item.icono;
            const estaActivo = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  estaActivo
                    ? 'bg-emerald-600 text-white shadow-md font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icono className={`w-5 h-5 ${estaActivo ? 'text-white' : 'text-slate-400'}`} />
                {item.etiqueta}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleCerrarSesion}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>

        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800 text-xs text-slate-400 text-center">
          Sistema Electoral Seguro v1.0
        </div>
      </div>
    </aside>
  );
}