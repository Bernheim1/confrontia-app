import { TipoSalidaEnum } from "../enums/tipo-salida-enum";

export interface CasoDto {
  id: string;
  numeroExpediente?: string;
  tipoSalida: TipoSalidaEnum;
  
  // Órgano
  organo: string;
  juzgadoInterviniente: string;
  juzgadoTribunal: string;
  direccionJuzgado: string;
  
  // Domicilio requerido
  localidad: string;
  domicilio: string;
  nro: number | null;
  piso: number | null;
  depto: string;
  unidad: string;
  
  // Expediente
  tipoDiligencia: string;
  caratulaExpediente: string;
  copiasTraslado: boolean;
  
  // Carácter
  urgente: boolean;
  habilitacionDiaHora: boolean;
  bajoResponsabilidad: boolean;
  
  // Tipo domicilio
  denunciado: boolean;
  constituido: boolean;
  
  // Facultades y atribuciones
  allanamiento: boolean;
  allanamientoDomicilioSinOcupantes: boolean;
  auxilioFuerzaPublica: boolean;
  conCerrajero: boolean;
  denunciaOtroDomicilio: boolean;
  denunciaBienes: boolean;
  otrosFacultades: string;
  
  // Texto contenido
  textoRequerido: string;
  montoCapitalTexto: string;
  montoCapitalNumero: number | null;
  montoCostasTexto: string;
  montoCostasNumero: number | null;
  montoHonorariosTexto: string;
  montoHonorariosNumero: number | null;
  montoTotalTexto: string;
  montoTotalNumero: number | null;
  
  createdAt?: string;
  updatedAt?: string;
}
