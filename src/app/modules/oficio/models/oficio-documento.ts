export type OficioCampoValor = string | number | boolean | null;

export interface OficioDocumento {
  casoId?: string;
  categoriaCodigo: string;
  categoriaNombre: string;
  tipoOficioCodigo: string;
  tipoOficioNombre: string;
  organismoDestino: string;
  proveido: string;
  textoGenerado: string;
  valores: Record<string, OficioCampoValor>;
}
