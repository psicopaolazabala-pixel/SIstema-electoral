// app/page.tsx
import Link from 'next/link';
import Navbar from './components/Navbar';
import { ShieldCheck, Vote, Users, Lock, ArrowRight, CheckCircle2, Building2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col justify-center">
        {/* HEADER INSTITUCIONAL */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* BADGE DEL CENTRO */}
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold px-4 py-2 rounded-full mb-6 border border-emerald-200 shadow-sm">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Centro de Innovación Agroindustrial y de Servicios (CIAS)</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Elección de Representantes <span className="text-emerald-600">SENA</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Plataforma digital oficial para la votación transparente, ágil y confiable de voceros y representantes de los aprendices del centro CIAS.
          </p>
        </div>

        {/* TARJETAS DE ROL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full mb-16">
          {/* APRENDIZ */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="bg-emerald-50 text-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100 group-hover:scale-110 transition-transform">
                <Vote className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Módulo del Aprendiz</h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Ingresa con tu número de documento de identidad para verificar tu registro en el censo del CIAS y emitir tu voto de forma anónima.
              </p>
            </div>
            <Link
              href="/votacion"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <span>Ingresar a Votar</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* ADMINISTRACIÓN */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="bg-slate-100 text-slate-700 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-slate-200 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Comité Electoral CIAS</h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Panel reservado para coordinadores y dinamizadores para la carga de aprendices, configuración de tarjetas electorales y actas.
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
              <p className="text-xs text-slate-500">Separación matemática entre la identidad del aprendiz y su elección.</p>
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