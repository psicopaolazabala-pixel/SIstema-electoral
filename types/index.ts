export interface Candidato {
  id: string;
  numero: number;
  nombre: string;
  propuesta: string;
  foto_url?: string;
  created_at?: string;
}

export interface Aprendiz {
  id: string;
  documento: string;
  nombre: string;
  ficha: string;
  voto_realizado: boolean;
  created_at?: string;
}

export interface Voto {
  id: string;
  candidato_id: string;
  created_at: string;
}

export interface ResultadoConteo extends Candidato {
  votos: number;
  porcentaje: string;
}

export interface RespuestaVoto {
  success: boolean;
  message: string;
}