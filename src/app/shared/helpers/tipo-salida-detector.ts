import { TipoCedulaEnum, TipoMandamientoEnum, TipoSalidaEnum } from '../enums/tipo-salida-enum';

export interface TipoSalidaDetectado {
  tipoSalida: TipoSalidaEnum;
  subtipoSalida: TipoCedulaEnum | TipoMandamientoEnum;
}

const KEYWORDS_CEDULA = [
  'traslado de demanda',
  'cédula',
  'cedula',
  'notifíquese por cédula',
  'notifiquese por cedula',
];

const KEYWORDS_MANDAMIENTO = [
  'intimación de pago',
  'intimacion de pago',
  'intímase',
  'intimase',
  'mandamiento',
  'embargo',
  'intímese',
  'intimese',
];

export function detectarTipoSalida(texto: string): TipoSalidaDetectado {
  const textoLower = texto.toLowerCase();

  const esCedula = KEYWORDS_CEDULA.some(kw => textoLower.includes(kw));
  const esMandamiento = KEYWORDS_MANDAMIENTO.some(kw => textoLower.includes(kw));

  if (esCedula && !esMandamiento) {
    return {
      tipoSalida: TipoSalidaEnum.Cedula,
      subtipoSalida: TipoCedulaEnum.TrasladoDemanda
    };
  }

  // Default: Mandamiento (más común para primer despacho)
  return {
    tipoSalida: TipoSalidaEnum.Mandamiento,
    subtipoSalida: TipoMandamientoEnum.IntimacionPago
  };
}
