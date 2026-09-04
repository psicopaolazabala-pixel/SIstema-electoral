'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Aprendiz } from '@/types';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Search, Trash2, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export default function PadronPage() {
  const [aprendices, setAprendices] = useState<Aprendiz[]>([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [resumen, setResumen] = useState<{ total: number; exito: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar lista de aprendices en el censo
  const cargarAprendices = async () => {
    const { data, error } = await supabase
      .from('aprendices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) setAprendices(data);
  };

  useEffect(() => {
    cargarAprendices();
  }, []);

  // Procesar filas extraídas del archivo
  const procesarLista = async (datos: any[]) => {
    setCargando(true);
    setError(null);
    setResumen(null);

    const aprendicesFormateados = datos
      .map((row) => ({
        documento: String(row.documento || row.Documento || row.DOCUMENTO || '').trim(),
        nombre: String(row.nombre || row.Nombre || row.NOMBRE || '').trim(),
        ficha: String(row.ficha || row.Ficha || row.FICHA || '').trim(),
      }))
      .filter((a) => a.documento !== '' && a.nombre !== '' && a.ficha !== '');

    if (aprendicesFormateados.length === 0) {
      setError('El archivo no contiene registros válidos. Verifique las cabeceras: documento, nombre, ficha.');
      setCargando(false);
      return;
    }

    const { error: errSupabase } = await supabase
      .from('aprendices')
      .upsert(aprendicesFormateados, { onConflict: 'documento' });

    setCargando(false);

    if (errSupabase) {
      setError('Error al guardar en la base de datos: ' + errSupabase.message);
      return;
    }

    setResumen({ total: datos.length, exito: aprendicesFormateados.length });
    cargarAprendices();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => procesarLista(results.data),
      });
    } else if (['xlsx', 'xls'].includes(extension || '')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        procesarLista(data);
      };
      reader.readAsBinaryString(file);
    } else {
      setError('Formato no soportado. Debe ser .xlsx, .xls o .csv');
    }
  };

  const eliminarAprendiz = async (id: string) => {
    if (!confirm('¿Seguro que desea eliminar este aprendiz del censo electoral?')) return;
    await supabase.from('aprendices').delete().eq('id', id);
    cargarAprendices();
  };

  const aprendicesFiltrados = aprendices.filter(
    (a) =>
      a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.documento.includes(busqueda) ||
      a.ficha.includes(busqueda)
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Censo Electoral (Padrón de Aprendices)</h1>
        <p className="text-slate-500 text-sm">Cargue masivamente la lista oficial de habilitados para votar.</p>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl flex items-center gap-3 border border-rose-200">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {resumen && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 border border-emerald-200">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <p className="text-sm font-medium">
            ¡Importación exitosa! Se procesaron {resumen.exito} aprendices correctamente.
          </p>
        </div>
      )}

      {/* ÁREA DE CARGA DE ARCHIVO */}
      <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center bg-white hover:border-emerald-500 transition-colors shadow-sm">
        <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 mb-1">Cargar Archivo Excel o CSV</h3>
        <p className="text-xs text-slate-500 mb-6">
          Columnas requeridas en la primera fila: <strong>documento</strong>, <strong>nombre</strong>, <strong>ficha</strong>
        </p>

        <label className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl cursor-pointer inline-flex items-center gap-2 transition-colors shadow-md">
          <Upload className="w-4 h-4" />
          {cargando ? 'Procesando Padrón...' : 'Seleccionar Excel / CSV'}
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            disabled={cargando}
            className="hidden"
          />
        </label>
      </div>

      {/* TABLA DE VISUALIZACIÓN DEL CENSO */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2>Aprendices Registrados (Mostrando últimos 100)</h2>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar documento o ficha..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Documento</th>
                <th className="py-3 px-4">Nombre Completo</th>
                <th className="py-3 px-4">Ficha</th>
                <th className="py-3 px-4">Estado Voto</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {aprendicesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">
                    No se encontraron registros en el censo.
                  </td>
                </tr>
              ) : (
                aprendicesFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{item.documento}</td>
                    <td className="py-3 px-4 font-semibold">{item.nombre}</td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-mono">
                        {item.ficha}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.voto_realizado ? (
                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold">
                          Ya Votó
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-bold">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => eliminarAprendiz(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}