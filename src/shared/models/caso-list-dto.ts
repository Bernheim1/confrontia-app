export interface CasoListDto {
  id: string;
  nroExpediente?: string;
  caratulaExpediente: string;
  juzgadoInterviniente: string;
  tipoDiligencia: string;
  domicilio: string;
  localidad: string;
  urgente: boolean;
  createdAt: string;
}
