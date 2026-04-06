export interface CasoListDto {
  id: string;
  nroExpediente?: string;
  caratulaExpediente: string;
  juzgadoInterviniente: string;
  tipoSalida: number;
  tipoDiligencia: string;
  domicilio: string;
  localidad: string;
  urgente: boolean;
  createdAt: string | null;
  tieneNotificacionesNoLeidas: boolean;
}
