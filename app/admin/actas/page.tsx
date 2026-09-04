'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { generarActaPDF } from '@/lib/pdfGenerator';
import { ResultadoConteo } from '@/types';
import { FileText, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ActasPage() {
  const [generando, setGenerando] = useState(false);
  const [descargado, setDescargado] = useState(false);

  const procesarActa = async () => {
    setGenerando(true);
    setDescargado(false);

    // Obtener datos congelados de Supabase
    const { count: totalCenso } = await supabase
      .from('aprendices')
      .select('*', { count: 'exact', head: true });

    const { data: candidatos } = await supabase.from('candidatos').select('*');
    const { data: votos } = await supabase.from('votos').select('candidato_id');

    const totalVotos = votos ? votos.length : 0;

    if (candidatos && votos) {
      const resultados: ResultadoConteo[] = candidatos.map((cand) => {
        const totalCand = votos.filter((v) => v.candidato_id === cand.id).length;
        return {
          ...cand,
          votos: totalCand,
          porcentaje: totalVotos > 0 ? ((totalCand / totalVotos) * 100).toFixed(1) : '0',
        };
      });

      generarActaPDF(
        resultados.sort((a, b) => b.votos - a.votos),
        totalCenso || 0,
        totalVotos
      );
    }

    setGenerando(false);
    setDescargado(true);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Generación y Firma de Actas</h1>
        <p className="text-slate-500 text-sm">Cierre oficial de la jornada e impresión del informe de resultados.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-start gap-4">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl border border-emerald-100 flex-shrink-0">
            <FileText className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Acta Oficial de Escrutinio SENA</h2>
            <p className="text-slate-500 text-sm leading-relaxed mt-1">
              Este archivo en formato PDF compila de forma definitiva el censo total de aprendices habilitados, los votos registrados en la base de datos anónima, el cálculo de abstencionismo y la tabla de resultados para firmas del Comité Electoral.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>
            El PDF generado incluirá sello de tiempo oficial de la República de Colombia y firmas de juzgamiento.
          </span>
        </div>

        {descargado && (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium">
              Acta descargada correctamente en tu dispositivo. Puedes proceder a imprimirla para las firmas físicas.
            </p>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={procesarActa}
            disabled={generando}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-md transition-colors inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            {generando ? 'Generando PDF Oficial...' : 'Descargar Acta PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}