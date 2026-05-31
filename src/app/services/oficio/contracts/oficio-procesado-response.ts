import { OficioCampoValor } from '../../../modules/oficio/models/oficio-documento';

export interface OficioProcesadoResponse {
  tipoOficioCodigo?: string;
  valores: Record<string, OficioCampoValor>;
  observaciones?: string | null;
}
