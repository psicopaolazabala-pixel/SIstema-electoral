'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '@/lib/supabase';
import { Candidato, Aprendiz, RespuestaVoto } from '@/types';
import {
  CheckCircle2,
  User,
  AlertCircle,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Eye,
  X,
  FileText
} from 'lucide-react';

export default function VotacionPage() {
  const [documento, setDocumento] = useState('');
  const [aprendizValido, setAprendizValido] = useState<Aprendiz | null>(null);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState<Candidato | null>(null);
  const [candidatoVerPropuesta, setCandidatoVerPropuesta] = useState<Candidato | null>(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'exito'; texto: string } | null>(null);
  const [votoExitoso, setVotoExitoso] = useState(false);
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);

  useEffect(() => {
    async function cargarCandidatos() {
      const { data, error } = await supabase
        .from('candidatos')
        .select('*')
        .order('numero', { ascending: true });

      if (!error && data) setCandidatos(data);
    }
    cargarCandidatos();
  }, []);

  const validarAprendiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documento.trim()) return;

    setCargando(true);
    setMensaje(null);

    const { data, error } = await supabase
      .from('aprendices')
      .select('*')
      .eq('documento', documento.trim())
      .single();

    setCargando(false);

    if (error || !data) {
      setMensaje({
        tipo: 'error',
        texto: 'Documento no registrado en el censo electoral oficial.',
      });
      return;
    }

    if (data.voto_realizado) {
      setMensaje({
        tipo: 'error',
        texto: 'El documento ingresado ya registra un voto emitido previamente.',
      });
      return;
    }

    setAprendizValido(data);
  };

  const emitirVoto = async () => {
    if (!candidatoSeleccionado || !aprendizValido) return;

    setCargando(true);
    setMensaje(null);

    const { data, error } = await supabase.rpc('registrar_voto', {
      p_documento: aprendizValido.documento,
      p_candidato_id: candidatoSeleccionado.id,
    });

    const respuesta = data as RespuestaVoto;
    setCargando(false);
    setMostrarModalConfirmacion(false);

    if (error || !respuesta?.success) {
      setMensaje({
        tipo: 'error',
        texto: respuesta?.message || 'Error interno al procesar el voto en la base de datos.',
      });
      return;
    }

    setVotoExitoso(true);
  };

  if (votoExitoso) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-emerald-100">
            <div className="bg-emerald-50 text-emerald-600 w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">¡Voto Registrado con Éxito!</h2>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Su participación ha sido procesada de forma <strong className="text-emerald-700">anónima y segura</strong>.
            </p>
            <button
              onClick={() => {
                setVotoExitoso(false);
                setAprendizValido(null);
                setDocumento('');
                setCandidatoSeleccionado(null);
              }}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-2xl transition-colors shadow-md"
            >
              Finalizar / Siguiente Votante
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
        <header className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Tarjeta Electoral Digital</h1>
            <p className="text-slate-500 text-sm">Elección de Representante de Centro SENA</p>
          </div>
          <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-2 rounded-xl border border-emerald-200 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Garantía de Voto Secreto e Inviolable</span>
          </div>
        </header>

        {mensaje && (
          <div
            className={`p-4 rounded-2xl mb-6 flex items-center gap-3 border shadow-sm ${
              mensaje.tipo === 'error'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{mensaje.texto}</p>
          </div>
        )}

        {!aprendizValido ? (
          <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="text-center mb-6">
              <div className="bg-slate-100 text-slate-700 w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Validación del Aprendiz</h2>
              <p className="text-xs text-slate-500 mt-1">Ingrese su documento para habilitar el tarjetón</p>
            </div>

            <form onSubmit={validarAprendiz} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Número de Documento
                </label>
                <input
                  type="text"
                  required
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  placeholder="Ej. 1098765432"
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800 font-semibold text-lg"
                />
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-md disabled:opacity-50"
              >
                {cargando ? 'Verificando Censo...' : 'Ingresar al Tarjetón'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Aprendiz Habilitado</p>
                <p className="font-bold text-slate-800 text-base">
                  {aprendizValido.nombre} <span className="text-slate-500 font-normal">(Ficha: {aprendizValido.ficha})</span>
                </p>
              </div>
              <button
                onClick={() => setAprendizValido(null)}
                className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Cambiar documento
              </button>
            </div>

            {/* TARJETÓN ELECTORAL */}
            {/* GRID DE CANDIDATOS EN LA VISTA DEL VOTANTE */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {candidatos.map((cand) => {
    const seleccionado = candidatoSeleccionado?.id === cand.id;
    return (
      <div
        key={cand.id}
        onClick={() => setCandidatoSeleccionado(cand)}
        className={`bg-white rounded-3xl p-6 border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
          seleccionado
            ? 'border-emerald-500 ring-4 ring-emerald-500/10 shadow-lg scale-[1.02]'
            : 'border-slate-200 hover:border-slate-300 shadow-sm'
        }`}
      >
        <div>
          <div className="flex justify-between items-start mb-3">
            <span className="text-3xl font-black text-slate-300">
              #{cand.numero < 10 ? `0${cand.numero}` : cand.numero}
            </span>
            {seleccionado && (
              <span className="bg-emerald-500 text-white rounded-full p-1 shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </span>
            )}
          </div>

          {/* FOTO GRANDE Y RESALTADA */}
          <div className="w-44 h-44 bg-slate-100 rounded-2xl mx-auto mb-4 flex items-center justify-center overflow-hidden border border-slate-200 shadow-inner">
            {cand.foto_url ? (
              <img
                src={cand.foto_url}
                alt={cand.nombre}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <User className="w-16 h-16 text-slate-400" />
            )}
          </div>

          <h3 className="text-lg font-bold text-center text-slate-800 leading-tight">
            {cand.nombre}
          </h3>

          {(cand as any).formacion && (
            <p className="text-xs font-semibold text-emerald-600 text-center mt-1">
              {(cand as any).formacion}
            </p>
          )}
        </div>
      </div>
    );
  })}
</div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {candidatoSeleccionado
                  ? `Opción marcada: #${candidatoSeleccionado.numero} - ${candidatoSeleccionado.nombre}`
                  : 'Seleccione un candidato para continuar'}
              </p>
              <button
                disabled={!candidatoSeleccionado}
                onClick={() => setMostrarModalConfirmacion(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-md transition-colors disabled:opacity-50"
              >
                Continuar Voto
              </button>
            </div>
          </div>
        )}

        {/* MODAL 1: VISUALIZACIÓN DE PROPUESTAS COMPLETAS */}
        {candidatoVerPropuesta && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] flex flex-col">
              {/* BOTÓN CERRAR */}
              <button
                onClick={() => setCandidatoVerPropuesta(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* ENCABEZADO DEL CANDIDATO EN MODAL */}
              <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                  {candidatoVerPropuesta.foto_url ? (
                    <img
                      src={candidatoVerPropuesta.foto_url}
                      alt={candidatoVerPropuesta.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    Candidato #{candidatoVerPropuesta.numero < 10 ? `0${candidatoVerPropuesta.numero}` : candidatoVerPropuesta.numero}
                  </span>
                  <h3 className="text-lg font-black text-slate-800 mt-1 leading-snug">
                    {candidatoVerPropuesta.nombre}
                  </h3>
                </div>
              </div>

              {/* CONTENIDO DE LA PROPUESTA (SCROLLABLE) */}
              <div className="flex-1 overflow-y-auto py-5 space-y-3 pr-2">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Plan de Trabajo & Propuestas</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {candidatoVerPropuesta.propuesta}
                </p>
              </div>

              {/* PIE DEL MODAL CON ACCIÓN */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => setCandidatoVerPropuesta(null)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-colors text-sm"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setCandidatoSeleccionado(candidatoVerPropuesta);
                    setCandidatoVerPropuesta(null);
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition-colors text-sm"
                >
                  Seleccionar este Candidato
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: CONFIRMACIÓN DEFINITIVA DEL VOTO */}
        {mostrarModalConfirmacion && candidatoSeleccionado && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-black text-slate-800 mb-2">¿Confirmar su Voto?</h3>
                <p className="text-sm text-slate-500">
                  Está a punto de registrar su elección de forma definitiva. Esta acción no se puede deshacer.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Opción Seleccionada</p>
                <p className="text-lg font-bold text-emerald-700">
                  #{candidatoSeleccionado.numero} - {candidatoSeleccionado.nombre}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setMostrarModalConfirmacion(false)}
                  className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold rounded-2xl hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={emitirVoto}
                  disabled={cargando}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md disabled:opacity-50"
                >
                  {cargando ? 'Registrando...' : 'Sí, Emitir Voto'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}