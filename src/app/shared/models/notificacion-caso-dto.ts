export interface CasoNotificacionDto {
  idNotificacion: number;
  fecha: string;
  organismo?: string;
  caratula?: string;
  texto?: string;
  url: string;
  tipoTramiteId?: number;
  tipoTramiteDescripcion?: string;
  createdAt: string;
  leida: boolean;
}

export interface CasoMevMetadataDto {
  numeroCausaMev?: string;
  organismoMev?: string;
  caratulaMev?: string;
  ultimaBusquedaMev?: string;
  encontradoEnMev: boolean;
  notificacionesIds: number[];
}
