'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Candidato } from '@/types';
import {
  UserPlus,
  User,
  Trash2,
  AlertCircle,
  PlusCircle,
  Upload,
  Image as ImageIcon,
  Edit2,
  X,
  GraduationCap
} from 'lucide-react';

export default function CandidatosPage() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [candidatoEditando, setCandidatoEditando] = useState<Candidato | null>(null);

  // Campos de formulario
  const [numero, setNumero] = useState('');
  const [nombre, setNombre] = useState('');
  const [formacion, setFormacion] = useState('');
  const [archivoFoto, setArchivoFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'exito'; texto: string } | null>(null);

  const cargarCandidatos = async () => {
    const { data, error } = await supabase
      .from('candidatos')
      .select('*')
      .order('numero', { ascending: true });

    if (!error && data) setCandidatos(data);
  };

  useEffect(() => {
    cargarCandidatos();
  }, []);

  const handleSeleccionarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivoFoto(file);
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  const iniciarEdicion = (cand: Candidato) => {
    setCandidatoEditando(cand);
    setNumero(String(cand.numero));
    setNombre(cand.nombre);
    setFormacion((cand as any).formacion || '');
    setPreviewFoto(cand.foto_url || null);
    setArchivoFoto(null);
    setMensaje(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setCandidatoEditando(null);
    setNumero('');
    setNombre('');
    setFormacion('');
    setArchivoFoto(null);
    setPreviewFoto(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero || !nombre) return;

    setCargando(true);
    setMensaje(null);

    let fotoUrlFinal = candidatoEditando?.foto_url || null;

    // Subir imagen a Supabase Storage si se cargó una nueva
    if (archivoFoto) {
      const extension = archivoFoto.name.split('.').pop();
      const nombreArchivo = `candidato_${numero}_${Date.now()}.${extension}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('candidatos')
        .upload(nombreArchivo, archivoFoto, {
          cacheControl: '3600',
          upsert: true,
        });

      if (storageError) {
        setCargando(false);
        setMensaje({
          tipo: 'error',
          texto: `Error al subir la imagen: ${storageError.message}`,
        });
        return;
      }

      const { data: urlData } = supabase.storage
        .from('candidatos')
        .getPublicUrl(storageData.path);

      fotoUrlFinal = urlData.publicUrl;
    }

    const numInt = parseInt(numero, 10);

    if (candidatoEditando) {
      // MODO EDICIÓN
      const { error: dbError } = await supabase
        .from('candidatos')
        .update({
          numero: numInt,
          nombre: nombre.trim(),
          formacion: formacion.trim(),
          foto_url: fotoUrlFinal,
        })
        .eq('id', candidatoEditando.id);

      setCargando(false);

      if (dbError) {
        setMensaje({ tipo: 'error', texto: dbError.message });
        return;
      }

      setMensaje({ tipo: 'exito', texto: 'Candidato actualizado con éxito.' });
    } else {
      // MODO CREACIÓN
      const { error: dbError } = await supabase.from('candidatos').insert([
        {
          numero: numInt,
          nombre: nombre.trim(),
          formacion: formacion.trim(),
          foto_url: fotoUrlFinal,
        },
      ]);

      setCargando(false);

      if (dbError) {
        setMensaje({
          tipo: 'error',
          texto: dbError.code === '23505' ? 'El número de candidato ya existe.' : dbError.message,
        });
        return;
      }

      setMensaje({ tipo: 'exito', texto: 'Candidato registrado exitosamente.' });
    }

    cancelarEdicion();
    cargarCandidatos();
  };

  const eliminarCandidato = async (id: string, num: number) => {
    if (num === 0) {
      alert('El VOTO EN BLANCO no se puede eliminar.');
      return;
    }
    if (!confirm('¿Desea retirar a este candidato del tarjetón?')) return;

    await supabase.from('candidatos').delete().eq('id', id);
    cargarCandidatos();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Tarjetón Electoral y Candidatos</h1>
        <p className="text-slate-500 text-sm">Gestiona los aspirantes que verán los aprendices al momento de votar.</p>
      </div>

      {mensaje && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 border ${
            mensaje.tipo === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{mensaje.texto}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* FORMULARIO DE CREACIÓN / EDICIÓN */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 sticky top-20">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              {candidatoEditando ? (
                <Edit2 className="w-5 h-5 text-amber-500" />
              ) : (
                <UserPlus className="w-5 h-5 text-emerald-600" />
              )}
              <h2 className="font-bold text-slate-800">
                {candidatoEditando ? 'Editar Candidato' : 'Registrar Candidato'}
              </h2>
            </div>
            {candidatoEditando && (
              <button
                onClick={cancelarEdicion}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-semibold"
              >
                <X className="w-3.5 h-3.5" /> Cancelar
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Número en Tarjetón</label>
              <input
                type="number"
                min="1"
                required
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Ej. 1, 2, 3..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Programa de Formación</label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={formacion}
                  onChange={(e) => setFormacion(e.target.value)}
                  placeholder="Ej. ADSO, Gestión Agroempresarial..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* FOTOGRAFÍA */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Fotografía del Candidato</label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {previewFoto ? (
                    <img src={previewFoto} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <label className="flex-1 border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-slate-100 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 cursor-pointer flex items-center justify-center gap-2 transition-colors">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span className="truncate">{archivoFoto ? archivoFoto.name : 'Cambiar / Subir Foto'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSeleccionarFoto}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className={`w-full text-white font-bold py-3 rounded-xl transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 shadow-md ${
                candidatoEditando
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {candidatoEditando ? (
                <>
                  <Edit2 className="w-4 h-4" />
                  {cargando ? 'Guardando Cambios...' : 'Actualizar Candidato'}
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  {cargando ? 'Guardando...' : 'Agregar al Tarjetón'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* LISTA DE CANDIDATOS CON FOTO GRANDE */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-slate-800 text-lg">Candidatos Activos en el Tarjetón</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {candidatos.map((cand) => (
              <div
                key={cand.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
              >
                <div>
                  {/* CABECERA DE LA TARJETA */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-3xl font-black text-emerald-600">
                      #{cand.numero < 10 ? `0${cand.numero}` : cand.numero}
                    </span>

                    {/* BOTONES DE EDICIÓN Y ELIMINACIÓN */}
                    {cand.numero !== 0 && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => iniciarEdicion(cand)}
                          className="text-slate-400 hover:text-amber-500 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                          title="Editar candidato"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => eliminarCandidato(cand.id, cand.numero)}
                          className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                          title="Eliminar candidato"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* FOTO DESTACADA EN FORMATO GRANDE (w-44 h-44) */}
                  <div className="w-44 h-44 bg-slate-50 rounded-2xl mx-auto mb-4 flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm">
                    {cand.foto_url ? (
                      <img
                        src={cand.foto_url}
                        alt={cand.nombre}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <User className="w-16 h-16 text-slate-300" />
                    )}
                  </div>

                  {/* NOMBRE DEL CANDIDATO */}
                  <h3 className="font-bold text-center text-slate-800 text-base leading-tight">
                    {cand.nombre}
                  </h3>

                  {/* FORMACIÓN ACADÉMICA */}
                  {(cand as any).formacion && (
                    <p className="text-xs font-semibold text-emerald-600 text-center mt-1 flex items-center justify-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {(cand as any).formacion}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}