'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ResultadoConteo } from '@/types';
import { BarChart3, Users, CheckCircle, Radio, Trophy, RefreshCw } from 'lucide-react';

export default function ResultadosPage() {
  const [totalCenso, setTotalCenso] = useState(0);
  const [totalVotos, setTotalVotos] = useState(0);
  const [resultados, setResultados] = useState<ResultadoConteo[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarEstadisticas = async () => {
    // 1. Obtener Censo y Votos Totales
    const { count: countCenso } = await supabase
      .from('aprendices')
      .select('*', { count: 'exact', head: true });

    const { data: votosData } = await supabase.from('votos').select('candidato_id');
    const { data: candidatosData } = await supabase.from('candidatos').select('*');

    const totalVotosRegistrados = votosData ? votosData.length : 0;

    setTotalCenso(countCenso || 0);
    setTotalVotos(totalVotosRegistrados);

    // 2. Mapear Conteo de Votos
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

  useEffect(() => {
    cargarEstadisticas();

    // Canal Realtime para escuchar cuando se inserta un voto
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

  const participacion = totalCenso > 0 ? ((totalVotos / totalCenso) * 100).toFixed(1) : '0';
  const ganador = resultados.length > 0 && resultados[0].votos > 0 ? resultados[0] : null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
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
                Opción Parcialmente Lider
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