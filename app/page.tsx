'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import { supabase } from '@/lib/supabase';
import {
  ShieldCheck,
  Vote,
  Users,
  Lock,
  ArrowRight,
  CheckCircle2,
  Building2,
  LockKeyhole
} from 'lucide-react';

export default function HomePage() {
  const [votacionActiva, setVotacionActiva] = useState<boolean>(true);
  const [cargandoEstado, setCargandoEstado] = useState<boolean>(true);

  useEffect(() => {
    async function obtenerEstadoVotacion() {
      const { data } = await supabase
        .from('configuracion_sistema')
        .select('votacion_activa')
        .eq('id', 1)
        .maybeSingle();

      if (data && data.votacion_activa !== undefined) {
        setVotacionActiva(Boolean(data.votacion_activa));
      }
      setCargandoEstado(false);
    }

    obtenerEstadoVotacion();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col justify-center">
        {/* HEADER INSTITUCIONAL */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold px-4 py-2 rounded-full mb-6 border border-emerald-200 shadow-sm">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Centro de Formación Las Quinchas (CIAS)</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Elección de Representantes <span className="text-emerald-600">SENA</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Plataforma digital oficial para la votación transparente, ágil y confiable de voceros y representantes de los aprendices.
          </p>
        </div>

        {/* TARJETAS DE ACCESO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full mb-16">
          
          {/* TARJETA 1: MÓDULO DEL APRENDIZ (CON CONTROL DE CONGELAMIENTO) */}
          <div
            className={`bg-white rounded-3xl p-8 border shadow-sm transition-all flex flex-col justify-between relative overflow-hidden ${
              !votacionActiva
                ? 'border-slate-300 bg-slate-50/70 select-none'
                : 'border-slate-200 hover:shadow-xl group'
            }`}
          >
            {/* BADGE FLOTANTE DE ESTADO CONGELADO */}
            {!votacionActiva && (
              <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-black px-3 py-1 rounded-full shadow-sm">
                <Lock className="w-3.5 h-3.5" />
                <span>MÓDULO CERRADO</span>
              </div>
            )}

            <div>
              {/* ÍCONO SEGÚN EL ESTADO */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-transform ${
                  !votacionActiva
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:scale-110'
                }`}
              >
                {!votacionActiva ? (
                  <LockKeyhole className="w-7 h-7" />
                ) : (
                  <Vote className="w-7 h-7" />
                )}
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-2">Módulo del Aprendiz</h2>
              
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                {!votacionActiva
                  ? 'La jornada electoral se encuentra temporalmente suspendida o concluida. En este momento el sistema no recibe votos.'
                  : 'Ingresa con tu número de documento de identidad para verificar tu registro en el censo y emitir tu voto de forma anónima.'}
              </p>
            </div>

            {/* BOTÓN O BLOQUEO */}
            {votacionActiva ? (
              <Link
                href="/votacion"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <span>Ingresar a Votar</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <div className="bg-slate-200 text-slate-500 font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed shadow-none border border-slate-300/80">
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Votación Suspendida</span>
              </div>
            )}
          </div>

          {/* TARJETA 2: COMITÉ ELECTORAL (PANEL ADMIN) */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="bg-slate-100 text-slate-700 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-slate-200 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Comité Electoral</h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Panel reservado para dinamizadores y administradores: congelar/reanudar comicios, censo electoral y escrutinio en vivo.
              </p>
            </div>
            <Link
              href="/admin/resultados"
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <span>Panel Administrativo</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* PILARES DE SEGURIDAD */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto w-full pt-8 border-t border-slate-200">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Privacidad Garantizada</h4>
              <p className="text-xs text-slate-500">Separación estricta entre la identidad del aprendiz y su elección.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Control de Voto Único</h4>
              <p className="text-xs text-slate-500">Validación instantánea contra el censo oficial del centro.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Actas en PDF</h4>
              <p className="text-xs text-slate-500">Escrutinio automatizado listo para firmas del comité electoral.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}