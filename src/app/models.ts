export type Nota = 'CHOLLO' | 'BUENO' | 'NEGOCIABLE' | 'DESCARTADO';

export interface PiezaValorada {
  nombre: string;
  confianza: 'segura' | 'probable' | 'posible';
  precio_min_eur: number;
  precio_max_eur: number;
  fuente: string;
}

/** Respuesta estructurada que pedimos al modelo. */
export interface Evaluacion {
  nota: Nota;
  motivo: string;
  categoria: string;
  multiplo: number;
  coste_total_eur: number;
  ingreso_neto_eur: number;
  beneficio_neto_eur: number;
  oferta_maxima_eur: number | null;
  piezas: PiezaValorada[];
  revender_o_guardar: string;
  como_venderlo: string;
  riesgos: string[];
  preguntas_vendedor: string[];
}

/** Lo que guardamos en el historial. */
export interface RegistroEvaluacion {
  id: string;
  fecha: string;
  titulo: string;
  precio: number | null;
  miniatura: string | null;
  evaluacion: Evaluacion;
}

export interface Ajustes {
  apiKey: string;
  /** Modelo para la evaluación completa (fotos + búsqueda de precios). */
  modelo: string;
  /** Modelo barato y rápido para el filtro de notificaciones (solo texto). */
  modeloRapido: string;
  buscarPrecios: boolean;
  /** Vigilar las notificaciones de Vinted y Wallapop (solo Android). */
  vigilar: boolean;
  /** Modo demostración: respuestas de ejemplo sin llamar a Gemini. */
  demo: boolean;
}

/** Algo que has comprado: para saber cuánto tienes invertido y cuánto has ganado de verdad. */
export interface ArticuloCartera {
  id: string;
  titulo: string;
  categoria: string;
  estrategia: 'revender' | 'guardar';
  fechaCompra: string;
  costeTotal: number;
  /** Valor de reventa estimado (al comprar o revisado después). */
  valorEstimado: number | null;
  estado: 'en_stock' | 'vendido';
  precioVenta: number | null;
  canalVenta: string;
  fechaVenta: string | null;
  horas: number | null;
  ubicacion: string;
  notas: string;
  miniatura: string | null;
  /** Último anuncio de venta redactado para este artículo. */
  anuncio?: AnuncioVenta;
}

/** Anuncio de venta redactado por la IA para revender un artículo. */
export interface AnuncioVenta {
  titulo: string;
  descripcion: string;
  precio_salida_eur: number;
  precio_minimo_eur: number;
  canal: string;
  palabras_clave: string[];
  consejos_fotos: string[];
}

/** Dónde y cómo se compra: cambia las comisiones y el envío que se suman al coste. */
export type Plataforma = 'vinted' | 'wallapop_envio' | 'wallapop_mano' | 'otra';

export const NOMBRE_PLATAFORMA: Record<Plataforma, string> = {
  vinted: 'Vinted',
  wallapop_envio: 'Wallapop con envío',
  wallapop_mano: 'Wallapop en mano',
  otra: 'Otra plataforma',
};

/** Un anuncio en la cola de evaluación. */
export interface ElementoCola {
  id: string;
  texto: string;
  precio: number | null;
  plataforma: Plataforma;
  /** Precio total que muestra la app al pagar (con envío y comisiones), si se conoce. */
  precioTotal: number | null;
  fotos: File[];
  miniatura: string | null;
  estado: 'pendiente' | 'evaluando' | 'hecho' | 'error';
  error?: string;
  evaluacion?: Evaluacion;
}

/** Aviso detectado por el vigilante de notificaciones (lo guarda el servicio Android). */
export interface Aviso {
  id: string;
  fecha: number;
  app: string;
  titulo: string;
  texto: string;
  nota: Nota | null;
  motivo: string;
  multiplo: number | null;
}

/** Orden para listas: mejores notas primero y, a igual nota, más beneficio. */
export const ORDEN_NOTA: Record<Nota, number> = {
  CHOLLO: 0,
  BUENO: 1,
  NEGOCIABLE: 2,
  DESCARTADO: 3,
};

/** Algo que la app ha aprendido de ti: correcciones, ventas reales o notas que añades. */
export interface Aprendizaje {
  id: string;
  fecha: string;
  categoria: string;
  texto: string;
  origen: 'correccion' | 'venta' | 'manual';
}
