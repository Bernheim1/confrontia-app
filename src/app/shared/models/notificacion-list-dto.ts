export interface NotificacionListDto {
  idNotificacion: number;
  casoId: string;
  nroExpediente?: string;
  fecha: string;
  organismo?: string;
  caratula?: string;
  texto?: string;
  url: string;
  createdAt: string;
  leida: boolean;
}
