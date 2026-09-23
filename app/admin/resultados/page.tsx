// app/admin/resultados/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ResultadoConteo } from '@/types';
import {
  BarChart3,
  Users,
  CheckCircle,
  Radio,
  Trophy,
  RefreshCw,
  Lock,
  Unlock,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

export default function ResultadosPage() {
  const [totalCenso, setTotalCenso] = useState(0);
  const [totalVotos, setTotalVotos] = useState(0);
  const [resultados, setResultados] = useState<ResultadoConteo[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados para el control de la jornada electoral
  const [votacionActiva, setVotacionActiva] = useState(true);
  const [cargandoControl, setCargandoControl] = useState(false);
  const [reiniciando, setReiniciando] = useState(false);

  // 1. Cargar estadísticas de votos
  const cargarEstadisticas = async () => {
    const { count: countCenso } = await supabase
      .from('aprendices')
      .select('*', { count: 'exact', head: true });

    const { data: votosData } = await supabase.from('votos').select('candidato_id');
    const { data: candidatosData } = await supabase.from('candidatos').select('*');

    const totalVotosRegistrados = votosData ? votosData.length : 0;

    setTotalCenso(countCenso || 0);
    setTotalVotos(totalVotosRegistrados);

    if (candidatosData && votosData) {
      const calculo: ResultadoConteo[] = candidatosData.map((cand) => {
        const votosCandidato = votosData.filter((v) => v.candidato_id === cand.id).length;
        return {
          ...cand,
          votos: votosCandidato,
          porcentaje:
            totalVotosRegistrados > 0
              ? ((votosCandidato / totalVotosRegistrados) * 100).toFixed(1)
              : '0',
        };
      });

      setResultados(calculo.sort((a, b) => b.votos - a.votos));
    }

    setCargando(false);
  };

  // 2. Consultar si la votación está activa o congelada
  const consultarEstadoVotacion = async () => {
    const { data } = await supabase
      .from('configuracion_sistema')
      .select('votacion_activa')
      .eq('id', 1)
      .maybeSingle();

    if (data && data.votacion_activa !== undefined) {
      setVotacionActiva(Boolean(data.votacion_activa));
    }
  };

  useEffect(() => {
    cargarEstadisticas();
    consultarEstadoVotacion();

    // Canal Realtime para actualizar escrutinio en vivo
    const canal = supabase
      .channel('escrutinio-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votos' }, () => {
        cargarEstadisticas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  // 3. Función para congelar o reactivar el módulo del aprendiz
  const toggleVotacion = async () => {
  const nuevoEstado = !votacionActiva;
  const confirmacion = confirm(
    nuevoEstado
      ? '¿Deseas HABILITAR la jornada electoral? Los aprendices podrán votar.'
      : '¿Deseas CONGELAR el módulo electoral? Ningún aprendiz podrá ingresar ni emitir votos.'
  );

  if (!confirmacion) return;

  setCargandoControl(true);

  const { data, error } = await supabase
    .from('configuracion_sistema')
    .update({ votacion_activa: nuevoEstado })
    .eq('id', 1)
    .select(); // El .select() confirma que la fila fue modificada

  setCargandoControl(false);

  if (error) {
    alert('Error al actualizar en Supabase: ' + error.message);
    return;
  }

  if (!data || data.length === 0) {
    alert('No se encontró el registro con id = 1 en configuracion_sistema.');
    return;
  }

  setVotacionActiva(nuevoEstado);
};

  // 4. Función para vaciar votos y reiniciar comicios a cero
  const reiniciarEleccion = async () => {
    const primerAviso = confirm(
      '⚠️ ¿ATENCIÓN: Realmente deseas REINICIAR los comicios a CERO?\n\nEsta acción borrará todos los votos registrados y habilitará nuevamente a todos los aprendices.'
    );
    if (!primerAviso) return;

    const segundoAviso = confirm('¿Confirmas de manera definitiva borrar todos los votos emitidos?');
    if (!segundoAviso) return;

    setReiniciando(true);

    // Borrar votos y habilitar censo
    const { error: errVotos } = await supabase.from('votos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error: errAprendices } = await supabase.from('aprendices').update({ voto_realizado: false }).neq('id', '00000000-0000-0000-0000-000000000000');

    setReiniciando(false);

    if (errVotos || errAprendices) {
      alert('Hubo un error al reiniciar: ' + (errVotos?.message || errAprendices?.message));
    } else {
      alert('¡Comicios reiniciados con éxito a cero!');
      cargarEstadisticas();
    }
  };

  const participacion = totalCenso > 0 ? ((totalVotos / totalCenso) * 100).toFixed(1) : '0';
  const ganador = resultados.length > 0 && resultados[0].votos > 0 ? resultados[0] : null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Escrutinio en Tiempo Real</h1>
          <p className="text-slate-500 text-sm">Monitoreo en vivo de participación y conteo de votos.</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5 animate-pulse">
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            Sincronización WebSocket Activa
          </span>
          <button
            onClick={() => {
              setCargando(true);
              cargarEstadisticas();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-xl"
            title="Refrescar Manualmente"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* PANEL DE CONTROL: CONGELAR MÓDULO Y REINICIO */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-2xl ${
              votacionActiva ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
            }`}
          >
            {votacionActiva ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-base">Estado de los Comicios:</h3>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-md ${
                  votacionActiva
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {votacionActiva ? 'HABILITADO / ABIERTO' : 'CONGELADO / SUSPENDIDO'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {votacionActiva
                ? 'Los aprendices pueden validar su documento y votar normalmente.'
                : 'Módulo de votación bloqueado temporalmente para todos los aprendices.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* BOTÓN CONGELAR / REANUDAR */}
          <button
            onClick={toggleVotacion}
            disabled={cargandoControl}
            className={`flex-1 md:flex-none px-5 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 text-white ${
              votacionActiva
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {votacionActiva ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            <span>{cargandoControl ? 'Guardando...' : votacionActiva ? 'Congelar Módulo' : 'Reanudar Votación'}</span>
          </button>

          {/* BOTÓN REINICIAR ELECCIÓN A CERO */}
          <button
            onClick={reiniciarEleccion}
            disabled={reiniciando}
            className="flex-1 md:flex-none px-4 py-3 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            title="Borrar votos y restablecer censo"
          >
            <RotateCcw className={`w-4 h-4 ${reiniciando ? 'animate-spin' : ''}`} />
            <span>{reiniciando ? 'Borrando...' : 'Vaciar Votos'}</span>
          </button>
        </div>
      </div>

      {/* TARJETAS KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-slate-100 p-3 rounded-2xl text-slate-700">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Censo Habilitado</p>
            <p className="text-2xl font-black text-slate-800">{totalCenso}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Votos Emitidos</p>
            <p className="text-2xl font-black text-slate-800">{totalVotos}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Participación</p>
            <p className="text-2xl font-black text-slate-800">{participacion}%</p>
          </div>
        </div>
      </div>

      {/* CANDIDATO LÍDER */}
      {ganador && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <Trophy className="w-10 h-10 text-amber-300" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Opción Parcialmente Líder
              </span>
              <h2 className="text-2xl font-black">
                #{ganador.numero < 10 ? `0${ganador.numero}` : ganador.numero} - {ganador.nombre}
              </h2>
            </div>
          </div>
          <div className="bg-white/10 px-6 py-3 rounded-2xl text-center backdrop-blur-sm border border-white/10">
            <p className="text-2xl font-black">{ganador.votos} votos</p>
            <p className="text-xs text-emerald-100 font-medium">{ganador.porcentaje}% del total</p>
          </div>
        </div>
      )}

      {/* LISTADO Y BARRAS DE PROGRESO */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="font-bold text-slate-800 text-lg">Distribución Detallada de Votos</h2>

        <div className="space-y-5">
          {resultados.map((cand) => (
            <div key={cand.id} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-800">
                  #{cand.numero < 10 ? `0${cand.numero}` : cand.numero} - {cand.nombre}
                </span>
                <span className="font-semibold text-slate-600">
                  {cand.votos} votos ({cand.porcentaje}%)
                </span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-100">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${cand.porcentaje}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}