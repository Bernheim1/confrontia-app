import { TipoCedulaEnum, TipoMandamientoEnum, TipoSalidaEnum } from '../enums/tipo-salida-enum';

export interface TipoSalidaDetectado {
  tipoSalida: TipoSalidaEnum;
  subtipoSalida: TipoCedulaEnum | TipoMandamientoEnum;
  autoDetectado: boolean;
}

interface DetectionRule {
  tipoSalida: TipoSalidaEnum;
  subtipoSalida: TipoCedulaEnum | TipoMandamientoEnum;
  patterns: RegExp[];
  negative?: RegExp[];
  minScore: number;
}

const DETECTION_RULES: DetectionRule[] = [
  {
    tipoSalida: TipoSalidaEnum.Mandamiento,
    subtipoSalida: TipoMandamientoEnum.IntimacionPago,
    patterns: [
      /\bmandamiento\b/i,
      /\bintimaci[oó]n\s+de\s+pago\b/i,
      /\bintimaci[oó]n\s+y\s+embargo\b/i,
      /\bl[ií]brese\s+mandamiento\b/i,
      /\bembargo\b/i,
      /\bint[ií]m[eé]se\b|\bint[ií]mase\b/i,
      /art[\.\s]*529\b/i,
    ],
    negative: [
      /traslado\s+(de|al)\s+(la\s+)?demanda/i,
      /traslado\s+al\s+demandado/i,
    ],
    minScore: 1,
  },
  {
    tipoSalida: TipoSalidaEnum.Cedula,
    subtipoSalida: TipoCedulaEnum.TrasladoDemanda,
    patterns: [
      /\bc[eé]dula\b/i,
      /traslado\s+(de|al)\s+(la\s+)?demanda/i,
      /traslado\s+al\s+demandado/i,
      /cit[eé]se\s+y\s+empl[aá]cese\b/i,
      /cita\s+y\s+emplaza\b/i,
      /\bconteste\b.*\bdemanda\b|\bdemanda\b.*\bconteste\b/i,
    ],
    negative: [
      /\bmandamiento\b/i,
      /\bintimaci[oó]n\s+de\s+pago\b/i,
    ],
    minScore: 1,
  },
];

export function detectarTipoSalida(texto: string): TipoSalidaDetectado {
  let bestRule: DetectionRule | null = null;
  let bestScore = 0;

  for (const rule of DETECTION_RULES) {
    const negativeHit = rule.negative?.some(neg => neg.test(texto)) ?? false;
    const score = rule.patterns.filter(p => p.test(texto)).length - (negativeHit ? 2 : 0);

    if (score >= rule.minScore && score > bestScore) {
      bestScore = score;
      bestRule = rule;
    }
  }

  if (bestRule) {
    return {
      tipoSalida: bestRule.tipoSalida,
      subtipoSalida: bestRule.subtipoSalida,
      autoDetectado: true,
    };
  }

  // Default fallback (no strong match): Mandamiento
  return {
    tipoSalida: TipoSalidaEnum.Mandamiento,
    subtipoSalida: TipoMandamientoEnum.IntimacionPago,
    autoDetectado: false,
  };
}

