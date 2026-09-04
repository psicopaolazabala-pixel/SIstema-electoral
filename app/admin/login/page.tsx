// app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError || !authData.user) {
        setCargando(false);
        setError('Credenciales inválidas. Verifique correo y contraseña.');
        return;
      }

      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', authData.user.id)
        .maybeSingle();

      const rolUsuario = perfil?.rol ? String(perfil.rol).toUpperCase().trim() : '';

      if (perfilError || !['ADMINISTRADOR', 'ADMIN'].includes(rolUsuario)) {
        await supabase.auth.signOut();
        setCargando(false);
        setError(`Acceso denegado. Se requiere rol de administrador.`);
        return;
      }

      window.location.href = '/admin/resultados';
    } catch (err: any) {
      setCargando(false);
      setError(`Error inesperado: ${err?.message || 'Fallo de conexión'}`);
    }
  };

  return (
    <div className="w-full max-w-md p-4">
      {/* BOTÓN VOLVER FUERA DE LA TARJETA */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-300 hover:text-white text-xs font-semibold transition-colors bg-slate-800/60 hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-700/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Página Principal</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 relative">
        <div className="text-center mb-8">
          <div className="bg-emerald-50 text-emerald-600 w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-emerald-100">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Acceso Administrativo</h1>
          <p className="text-slate-500 text-xs mt-1">Comité Electoral SENA</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl mb-6 flex items-center gap-3 border border-rose-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-2">Correo</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="santirijas89@gmail.com"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-md disabled:opacity-50 mt-2"
          >
            {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* ENLACE SECUNDARIO EN EL PIE DEL FORMULARIO */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-emerald-600 font-medium transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Ir al Módulo de Votación / Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}