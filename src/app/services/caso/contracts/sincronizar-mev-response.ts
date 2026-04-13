export interface SincronizarMevCasoResponse {
  sincronizado: boolean;
  encontradoEnMev: boolean;
  notificacionesNuevas: number;
  error?: string | null;
}

export interface SincronizarMevMasivoResponse {
  exitoso: boolean;
  totalNotificaciones: number;
  notificacionesAsociadas: number;
  notificacionesNuevas: number;
  error?: string | null;
  notificaciones: MevNotificacionBusquedaDto[];
}

export interface MevNotificacionBusquedaDto {
  idNotificacion: number;
  expediente: string;
  fecha: string;
  organismo?: string | null;
  caratula?: string | null;
  texto?: string | null;
  tipoTramiteId?: number | null;
  tipoTramiteDescripcion?: string | null;
  url: string;
  casoId?: string | null;
  yaExistente: boolean;
}
