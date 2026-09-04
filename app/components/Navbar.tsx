// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { ShieldCheck, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-emerald-700 text-white shadow-md border-b border-emerald-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO SENA OFICIAL + NOMBRE DEL CENTRO */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-95 transition-opacity">
          {/* Contenedor blanco para resaltar la imagen del logo */}
          <div className="bg-white p-1 rounded-xl shadow-sm flex items-center justify-center">
            <img
              src="/logo-sena.png"
              alt="Logo SENA"
              className="w-8 h-8 object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg leading-none tracking-tight">SENA</h1>
              <span className="bg-emerald-800 text-emerald-200 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-emerald-600">
                CIAS
              </span>
            </div>
            <p className="text-emerald-100 text-xs font-medium leading-tight mt-0.5">
              Centro de Formación las Quinchas
            </p>
          </div>
        </Link>

        {/* NAVEGACIÓN */}
        <nav className="flex items-center gap-3">
          <Link
            href="/votacion"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden xs:inline">Módulo Votante</span>
          </Link>
          <Link
            href="/admin/resultados"
            className="flex items-center gap-2 bg-emerald-900/60 hover:bg-emerald-900 text-emerald-100 px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-emerald-600/60"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Panel Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}