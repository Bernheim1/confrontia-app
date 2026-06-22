import { Injectable } from '@angular/core';
import { getOficioTypeByCode, OficioTypeConfig } from '../../modules/oficio/models/oficio-catalog';
import { OficioCampoValor } from '../../modules/oficio/models/oficio-documento';
import { ProcesarOficioCommand } from './commands/procesar-oficio-command';
import { OficioProcesadoResponse } from './contracts/oficio-procesado-response';

interface DetectionRule {
  code: string;
  patterns: RegExp[];
  negative?: RegExp[];
  minScore: number;
}

@Injectable({ providedIn: 'root' })
export class OficioService {

  private readonly DETECTION_RULES: DetectionRule[] = [
    // OMN – Oficina Mandamientos y Notificaciones
    { code: 'OMN-2', patterns: [/reiteraci[oó]n/i, /mandamientos/i, /no.*obten.*resultado/i], minScore: 2 },
    { code: 'OMN-3', patterns: [/devoluci[oó]n.*c[eé]dula/i, /c[eé]dula.*diligenciada/i], minScore: 1 },
    { code: 'OMN-1', patterns: [/oficina.*mandamientos/i, /mandamientos.*notificaciones/i, /resultado.*diligencia/i], minScore: 1 },
    // RPI – Registro Propiedad Inmueble
    { code: 'RPI-2', patterns: [/embargo/i, /inmueble/i, /anotaci[oó]n.*inmueble/i], minScore: 2 },
    { code: 'RPI-3', patterns: [/levantamiento/i, /embargo|inhibici[oó]n/i, /registro.*propiedad inmueble/i], minScore: 2 },
    { code: 'RPI-1', patterns: [/registro.*propiedad inmueble/i, /bienes inmuebles/i, /dominio.*inhibici[oó]n/i, /inhibici[oó]n/i], negative: [/embargo/i, /levantamiento/i], minScore: 1 },
    // RPA – Registro Propiedad Automotor
    { code: 'RPA-2', patterns: [/embargo/i, /automotor|veh[ií]cul/i, /patente/i, /anotaci[oó]n.*automotor/i], minScore: 2 },
    { code: 'RPA-1', patterns: [/registro.*automotor/i, /propiedad automotor/i, /veh[ií]culos automotores/i, /titularidad.*veh[ií]/i, /automotor/i, /informe.*veh[ií]cul/i], negative: [/embargo/i], minScore: 2 },
    // BCRA
    { code: 'BCRA-1', patterns: [/banco central/i, /\bbcra\b/i, /cuentas bancarias.*entidades/i], minScore: 1 },
    // BNK – Entidades Bancarias
    { code: 'BNK-2', patterns: [/movimientos.*banco|banco.*movimientos/i, /movimientos.*cuenta/i], minScore: 1 },
    { code: 'BNK-1', patterns: [/embargo.*fondos|embargo.*cuenta/i, /trabar embargo.*banco/i], minScore: 1 },
    // AFIP / ARCA
    { code: 'AFIP-2', patterns: [/afip|arca/i, /inhibici[oó]n.*bienes/i], negative: [/informe/i], minScore: 2 },
    { code: 'AFIP-1', patterns: [/\bafip\b/i, /\barca\b/i, /administraci[oó]n federal.*ingresos/i, /fiscal.*declaraci[oó]n/i], minScore: 1 },
    // ANSES
    { code: 'ANS-2', patterns: [/anses/i, /embargo.*haberes/i, /retener.*haberes/i], minScore: 2 },
    { code: 'ANS-1', patterns: [/anses/i, /seguridad social/i, /haberes.*jubilat/i, /jubilat|pensi[oó]n.*previsional/i], negative: [/embargo/i], minScore: 1 },
    // RENAPER
    { code: 'REN-1', patterns: [/renaper/i, /registro nacional.*personas/i, /domicilio.*registrado/i], minScore: 1 },
    // CNE – Cámara Nacional Electoral
    { code: 'CNE-2', patterns: [/fallecimiento/i, /baja.*padr[oó]n/i, /c[aá]mara.*electoral/i], minScore: 2 },
    { code: 'CNE-1', patterns: [/padr[oó]n electoral/i, /c[aá]mara.*electoral/i, /domicilio electoral/i], minScore: 1 },
    // IGJ
    { code: 'IGJ-3', patterns: [/(?:inspecci[oó]n.*justicia|\bigj\b)/i, /cautelar/i, /tomar raz[oó]n/i], minScore: 2 },
    { code: 'IGJ-2', patterns: [/(?:inspecci[oó]n.*justicia|\bigj\b)/i, /representantes.*igj|igj.*representantes|apoderados/i], minScore: 2 },
    { code: 'IGJ-1', patterns: [/inspecci[oó]n.*justicia/i, /\bigj\b/i, /persona jur[ií]dica/i], minScore: 1 },
    // DPPJ
    { code: 'DPPJ-3', patterns: [/direcci[oó]n.*personas jur[ií]dicas/i, /\bdppj\b/i, /anotaci[oó]n.*cautelar/i], minScore: 2 },
    { code: 'DPPJ-2', patterns: [/direcci[oó]n.*personas jur[ií]dicas/i, /representantes/i], minScore: 2 },
    { code: 'DPPJ-1', patterns: [/direcci[oó]n.*personas jur[ií]dicas/i, /\bdppj\b/i], minScore: 1 },
    // Mercado Libre
    { code: 'ML-2', patterns: [/mercado libre/i, /bloqueo/i, /cautelar.*mercado libre/i], minScore: 2 },
    { code: 'ML-3', patterns: [/mercado libre/i, /publicaciones/i, /bienes.*mercado/i], minScore: 2 },
    { code: 'ML-1', patterns: [/mercado libre/i, /operaciones/i], minScore: 1 },
    // Mercado Pago
    { code: 'MP-2', patterns: [/mercado pago/i, /embargo.*billetera|billetera.*virtual/i], minScore: 2 },
    { code: 'MP-3', patterns: [/mercado pago/i, /transferencias/i], minScore: 2 },
    { code: 'MP-4', patterns: [/mercado pago/i, /cr[eé]ditos.*otorgados/i], minScore: 2 },
    { code: 'MP-1', patterns: [/mercado pago/i], minScore: 1 },
  ];

  detectarTipo(proveido: string): OficioTypeConfig | undefined {
    const texto = this.normalizar(proveido);
    if (!texto.trim()) return undefined;

    let bestCode: string | null = null;
    let bestScore = 0;

    for (const rule of this.DETECTION_RULES) {
      const negativeHit = rule.negative?.some(neg => neg.test(texto)) ?? false;
      const score = rule.patterns.filter(p => p.test(texto)).length - (negativeHit ? 2 : 0);

      if (score >= rule.minScore && score > bestScore) {
        bestScore = score;
        bestCode = rule.code;
      }
    }

    return bestCode ? getOficioTypeByCode(bestCode) : undefined;
  }

  public procesarOficioAsync(command: ProcesarOficioCommand): Promise<OficioProcesadoResponse> {
    const tipo = getOficioTypeByCode(command.tipoOficioCodigo);
    const valores: Record<string, OficioCampoValor> = tipo
      ? this.extraerValoresDeProveido(command.proveido, tipo)
      : {};

    return Promise.resolve({
      tipoOficioCodigo: command.tipoOficioCodigo,
      valores,
      observaciones: null
    });
  }

  private extraerValoresDeProveido(
    proveido: string,
    tipo: OficioTypeConfig
  ): Record<string, OficioCampoValor> {
    const resultado: Record<string, OficioCampoValor> = {};

    const dni = this.extraerDNI(proveido);
    if (dni) resultado['numeroDocumento'] = dni;

    const nombre = this.extraerNombrePersona(proveido);
    if (nombre) {
      resultado['nombreRazonSocial'] = nombre;
      resultado['titular'] = nombre;
      resultado['razonSocial'] = nombre;
      resultado['inhibidoNombre'] = nombre;
    }

    const monto = this.extraerMonto(proveido);
    if (monto !== null) resultado['monto'] = monto;

    switch (tipo.code) {
      case 'RPA-1': {
        const regNum = this.extraerNumeroRegistroRPA(proveido);
        if (regNum) resultado['registroNumero'] = regNum;
        const localidad = this.extraerLocalidadRPA(proveido);
        if (localidad) resultado['localidad'] = localidad;
        break;
      }
      case 'RPA-2': {
        const patente = this.extraerPatente(proveido);
        if (patente) resultado['patente'] = patente;
        break;
      }
      case 'RPI-1': {
        const partido = this.extraerPartido(proveido);
        if (partido) resultado['partido'] = partido;
        break;
      }
      case 'BNK-1':
      case 'BNK-2': {
        const banco = this.extraerBanco(proveido);
        if (banco) resultado['bancoNombre'] = banco;
        break;
      }
    }

    return resultado;
  }

  // ──────────────── Helpers de normalización ────────────────

  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  // ──────────────── Extractores genéricos ────────────────

  private extraerDNI(texto: string): string | null {
    // Handles: DNI 12345678, DNI/CUIT 20436730048, CUIT Nro. 20436730048
    const match = texto.match(/\b(?:DNI|CUIT)(?:\/CUIT|\/DNI)?\s*(?:N[°º]|Nro\.?|n[úu]mero)?\s*(\d{7,11})/i);
    return match?.[1] ?? null;
  }

  private extraerNombrePersona(texto: string): string | null {
    const patterns = [
      // "informe si NOMBRE, DNI" — handles ALL CAPS and Title Case
      /\binforme si\s+(.+?),?\s*(?:DNI|CUIT)/i,
      /\brespecto\s+del?\s+(?:Sr\.?|Sra\.?)?\s*(.+?),?\s*(?:DNI|CUIT)/i,
      /\ba\s+nombre\s+de\s+(.+?),?\s*(?:DNI|CUIT)/i,
      /\btitular\s+(.+?),?\s*(?:DNI|CUIT)/i,
      /percibe\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,4})/,
    ];

    for (const p of patterns) {
      const match = texto.match(p);
      if (match?.[1]) {
        const nombre = match[1].trim().replace(/\s+/g, ' ');
        // Descartar si el match es muy corto o es solo un pronombre/artículo
        if (nombre.length >= 5 && !/^(el|la|los|las|si|que)$/i.test(nombre)) {
          return nombre;
        }
      }
    }
    return null;
  }

  private extraerMonto(texto: string): number | null {
    const match = texto.match(/\$\s*([\d.,]+)/);
    if (!match) return null;
    const raw = match[1].replace(/\./g, '').replace(',', '.');
    const num = parseFloat(raw);
    return isNaN(num) ? null : num;
  }

  // ──────────────── Extractores específicos por tipo ────────────────

  private extraerNumeroRegistroRPA(texto: string): string | null {
    const match = texto.match(/[Nn][°º]\s*(\d+)\s+de\s+[A-ZÁÉÍÓÚÑ]/);
    return match?.[1] ?? null;
  }

  private extraerLocalidadRPA(texto: string): string | null {
    const match = texto.match(/[Nn][°º]\s*\S+\s+de\s+([A-ZÁÉÍÓÚÑ][^\n,]+?)(?:\s+y\/o|\s+a\s+fin)/i);
    return match?.[1]?.trim() ?? null;
  }

  private extraerPatente(texto: string): string | null {
    const match = texto.match(/\b([A-Z]{2}\d{3}[A-Z]{2}|[A-Z]{3}\d{3})\b/i);
    return match?.[1]?.toUpperCase() ?? null;
  }

  private extraerPartido(texto: string): string | null {
    const match = texto.match(/partido\s+de\s+([A-ZÁÉÍÓÚÑ][^\n,]+?)(?:\s+o\s+en|\s+como|\s*,)/i);
    return match?.[1]?.trim() ?? null;
  }

  private extraerBanco(texto: string): string | null {
    const match = texto.match(/\bal\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ\s]+?)(?:,|\s+a\s+fin|\s+sucursal)/i);
    return match?.[1]?.trim() ?? null;
  }
}
