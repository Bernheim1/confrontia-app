import { Injectable } from '@angular/core';
import { TipoCedulaEnum, TipoMandamientoEnum, TipoSalidaEnum } from '../../enums/tipo-salida-enum';
import { PLANTILLAS } from '../despacho/despacho-plantillas.config';
import { TextoMonedaANumeroPipe } from '../../pipes/textoMonedaANumero.pipe';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

interface OrganoInfo {
  organo: string;
  juzgadoInterviniente: string;
  juzgadoTribunal: string;
  direccionJuzgado: string;
}
interface ExpedienteInfo {
  caratulaExpediente: string;
  numeroExpediente: string;
  copiasTraslado: boolean;
  tipoDiligencia: string;
}
interface CaracterInfo {
  urgente: boolean;
  habilitacionDiaHora: boolean;
  bajoResponsabilidad: boolean;
}
interface TipoDomicilioInfo {
  denunciado: boolean;
  constituido: boolean;
}
interface FacultadesInfo {
  allanamiento: boolean;
  allanamientoDomicilioSinOcupantes: boolean;
  auxilioFuerzaPublica: boolean;
  conCerrajero: boolean;
  denunciaOtroDomicilio: boolean;
  denunciaBienes: boolean;
  otros: boolean;
}
interface TextoContenidoInfo {
  requerido: string;
  montoCapitalTexto: string;
  montoCapitalNumerico: string;
  montoInteresesTexto: string;
  montoInteresesNumerico: string;
  textoNotificacion: string;
  textoDespacho: string;
}

interface SegmentoCapitalInfo {
  texto: string;
  esPrioritario: boolean;
}

interface CandidatoMontoCapital {
  literal: string;
  numeroBruto: string;
  valorNumerico: number;
  score: number;
  index: number;
}

interface JuzgadoCatalogEntry {
  juzgado: string;
  direccion?: string;
  raw?: any;
}

@Injectable({ providedIn: 'root' })
export class DespachoService {
  constructor(private monedaPipe: TextoMonedaANumeroPipe, private http: HttpClient) { }

  private catalogo: JuzgadoCatalogEntry[] = [];
  private catalogoReady$ = new BehaviorSubject<boolean>(false);
  private cargaEnCurso = false;
  private catalogoNormalizado: Map<string, { norm: string; num: string | null; zona: string | null; tokens: string[] }> = new Map();
  private debugMode = false; // Activar para logs detallados

  async inicializarCatalogoDesdeAssets(ruta: string = 'assets/database/direcciones-juzgados.csv'): Promise<void> {
    if (this.catalogoReady$.value || this.cargaEnCurso) return;
    this.cargaEnCurso = true;
    try {
      const csv = await firstValueFrom(this.http.get(ruta, { responseType: 'text' }));
      this.usarCatalogoJuzgadosCSV(csv);
      this.catalogoReady$.next(true);
    } catch (e) {
      console.warn('No se pudo cargar el catálogo de juzgados', e);
      this.catalogoReady$.next(false);
    } finally {
      this.cargaEnCurso = false;
    }
  }

  /**
   * Busca un juzgado en el catálogo a partir del nombre de organismo de la notificación.
   * Útil como fallback cuando el texto del despacho no contiene el juzgado.
   */
  matchDesdeMetadata(organismo: string): JuzgadoCatalogEntry | undefined {
    if (!this.catalogo?.length || !organismo) return undefined;
    const detectado = this.capitalizarFrase(organismo.replace(/\s+/g, ' ').trim());
    return this.matchJuzgadoCatalogoFlexible(detectado, false);
  }

  async procesarDespachoAsync(
    despachoTexto: string,
    tipoSalida: TipoSalidaEnum,
    subtipoSalida: TipoCedulaEnum | TipoMandamientoEnum
  ): Promise<any> {
    if (!this.catalogoReady$.value) {
      await this.inicializarCatalogoDesdeAssets();
    }
    return this.procesarDespacho(despachoTexto, tipoSalida, subtipoSalida);
  }

  procesarDespacho(
    despachoTexto: string,
    tipoSalida: TipoSalidaEnum,
    subtipoSalida: TipoCedulaEnum | TipoMandamientoEnum
  ): any {
    const tipoKey = TipoSalidaEnum[tipoSalida];
    let subtipoKey = '';
    if (tipoSalida === TipoSalidaEnum.Cedula) subtipoKey = TipoCedulaEnum[subtipoSalida];
    else if (tipoSalida === TipoSalidaEnum.Mandamiento) subtipoKey = TipoMandamientoEnum[subtipoSalida];

    console.log('🔍 DEBUG procesarDespacho:');
    console.log('  tipoSalida (enum):', tipoSalida);
    console.log('  subtipoSalida (enum):', subtipoSalida);
    console.log('  tipoKey (string):', tipoKey);
    console.log('  subtipoKey (string):', subtipoKey);
    console.log('  PLANTILLAS completo:', PLANTILLAS);
    console.log('  PLANTILLAS[tipoKey]:', PLANTILLAS[tipoKey]);
    console.log('  PLANTILLAS[tipoKey]?.[subtipoKey]:', PLANTILLAS[tipoKey]?.[subtipoKey]);

    const plantilla = PLANTILLAS[tipoKey]?.[subtipoKey] || {};
    console.log('  plantilla a aplicar:', plantilla);

    const textoNormalizado = this.normalizarTexto(despachoTexto);

    let resultado = tipoKey === 'Mandamiento'
      ? this.generarMandamiento(textoNormalizado, subtipoKey)
      : this.generarCedula(textoNormalizado, subtipoKey);

    console.log('  resultado ANTES de aplicar plantilla:', JSON.parse(JSON.stringify(resultado)));
    resultado = this.aplicarPlantilla(resultado, plantilla);
    console.log('  resultado DESPUÉS de aplicar plantilla:', JSON.parse(JSON.stringify(resultado)));
    console.log('  tipoDiligencia final:', resultado.expediente?.tipoDiligencia);

    return resultado;
  }

  private generarMandamiento(texto: string, subtipoSalida: string): any {
    return {
      organo: this.extraerJuzgado(texto),
      expediente: this.extraerExpediente(texto),
      caracter: this.extraerCaracter(texto),
      tipoDomicilio: this.extraerTipoDomicilio(texto),
      facultadesAtribuciones: this.extraerFacultadesAtribuciones(texto),
      textoContenido: this.extraerTextoContenido(texto),
      subtipo: subtipoSalida
    };
  }

  private generarCedula(texto: string, subtipoSalida: string): any {
    debugger
    return {
      organo: this.extraerJuzgado(texto),
      expediente: this.extraerExpediente(texto),
      caracter: this.extraerCaracter(texto),
      tipoDomicilio: this.extraerTipoDomicilio(texto),
      facultadesAtribuciones: this.extraerFacultadesAtribuciones(texto),
      textoContenido: this.extraerTextoContenido(texto),
      subtipo: subtipoSalida
    };
  }

  // ---------------- Normalización ----------------
  private normalizarTexto(raw: string): string {
    return raw
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/?(p|div|tr|li|h[1-6])\b[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#?\w+;/g, ' ')
      .replace(/[^\n\rA-Z0-9ÁÉÍÓÚÑa-záéíóúñ\/.,:()"%-]/g, ' ')
      .replace(/\t+/g, ' ')
      .replace(/\r/g, '\n')
      .replace(/\n{2,}/g, '\n')
      .replace(/ +/g, ' ')
      .trim();
  }

  private capitalizarFrase(txt: string): string {
    return txt
      .toLowerCase()
      .replace(/\b([a-záéíóúñ]+)/g, w => w.charAt(0).toUpperCase() + w.slice(1));
  }

  usarCatalogoJuzgados(rows: JuzgadoCatalogEntry[]) {
    this.catalogo = (rows || []).map(r => ({
      juzgado: r.juzgado?.trim() || '',
      direccion: r.direccion?.trim() || ''
    }));

    // Pre-procesar catálogo para mejor performance
    this.catalogoNormalizado.clear();
    this.catalogo.forEach(entry => {
      const norm = this.normalizarClaveJuzgado(entry.juzgado);
      const num = this.extraerNumeroJuzgado(norm);
      const zona = this.extraerZonaJuzgado(norm);
      const tokens = this.tokenizarZona(zona);
      this.catalogoNormalizado.set(entry.juzgado, { norm, num, zona, tokens });
    });
  }


  usarCatalogoJuzgadosCSV(csvTexto: string) {
    if (!csvTexto) {
      console.warn('CSV vacío');
      return;
    }

    const lineas = csvTexto
      .replace(/\r/g, '')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('//'));

    const parsed: JuzgadoCatalogEntry[] = [];

    for (const linea of lineas) {
      // Formato esperado: Juzgado..., "Dirección..."
      const match = linea.match(/^([^"]+),\s*"([^"]+)"$/);
      if (match) {
        parsed.push({
          juzgado: match[1].trim(),
          direccion: match[2].trim()
        });
      } else {
        // Línea sin dirección o formato diferente
        const partes = linea.split(',');
        if (partes.length >= 1) {
          parsed.push({
            juzgado: partes[0].trim(),
            direccion: partes[1]?.replace(/"/g, '').trim() || ''
          });
        }
      }
    }

    this.usarCatalogoJuzgados(parsed);
    console.log(`✅ Catálogo cargado: ${parsed.length} juzgados`);
  }

  // ---------------- Órgano ----------------
  extraerJuzgado(texto: string): OrganoInfo & { direccionJuzgado: string; juzgadoTribunal: string } {
    let organo = '';
    let juzgadoInterviniente = '';
    let juzgadoTribunal = '';
    let direccionJuzgado = '';

    // ========== PRIORIDAD MÁXIMA: Prefijo "JUZGADO:" ==========
    // Formato esperado más común: "Juzgado:\nJUZGADO EN LO CIVIL Y COMERCIAL Nº10 - SAN MARTIN"
    let detectado = '';
    let labelFlag = false;

    // Patrón mejorado: captura todo después de "JUZGADO:" hasta fin de línea o doble salto
    const prefijoMatch = texto.match(/JUZGADO:\s*\n?\s*(JUZGADO\s+[^\n]+?)(?:\n\n|\n(?=[A-Z][a-z]+:)|$)/i);
    if (prefijoMatch) {
      detectado = prefijoMatch[1].trim();
      labelFlag = true;
      console.log('🏷️ Detectado con prefijo JUZGADO:', detectado);
    }

    // Fallback: buscar sin salto de línea
    if (!detectado) {
      const prefijoDirecto = texto.match(/JUZGADO:\s*(JUZGADO\s+[^\n]+)/i);
      if (prefijoDirecto) {
        detectado = prefijoDirecto[1].trim();
        labelFlag = true;
        console.log('🏷️ Detectado con prefijo JUZGADO (directo):', detectado);
      }
    }

    // ========== PATRONES SECUNDARIOS (sin prefijo) ==========
    if (!detectado) {
      const patrones = [
        // Con "EN LO" y zona
        /JUZGADO\s+EN\s+LO\s+CIVIL\s+Y\s+COMERCIAL\s+N[º°]?\s*\d+(?:\s*[-–]\s*[A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]+)*)?/i,
        // Sin "EN LO" y con zona
        /JUZGADO\s+CIVIL\s+Y\s+COMERCIAL\s+N[º°]?\s*\d+(?:\s*[-–]\s*[A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]+)*)?/i,
        // Con "EN LO" sin símbolo º
        /JUZGADO\s+EN\s+LO\s+CIVIL\s+Y\s+COMERCIAL\s+N\s*\d+(?:\s*[-–]\s*[A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]+)*)?/i,
        // Sin "EN LO" sin símbolo º
        /JUZGADO\s+CIVIL\s+Y\s+COMERCIAL\s+N\s*\d+(?:\s*[-–]\s*[A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]+)*)?/i,
        // Juzgado de Paz Letrado
        /JUZGADO\s+DE\s+PAZ\s+LETRADO\s+N[º°]?\s*\d+(?:\s*[-–]\s*[A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]+)*)?/i
      ];

      for (const r of patrones) {
        const m = texto.match(r);
        if (m) {
          detectado = m[0];
          console.log('📋 Detectado sin prefijo:', detectado);
          break;
        }
      }
    }

    if (!detectado) {
      console.warn('⚠️ No se pudo extraer información de juzgado');
      return { organo, juzgadoInterviniente, direccionJuzgado, juzgadoTribunal };
    }

    // ========== LIMPIEZA Y NORMALIZACIÓN ==========
    // Limpiar caracteres extra al final, colapsar espacios
    detectado = detectado
      .replace(/\s+/g, ' ')
      .replace(/[.,;:]+\s*$/, '')
      .trim();

    // Capitalizar para presentación
    detectado = this.capitalizarFrase(detectado);

    // Valores por defecto (antes de buscar en catálogo)
    organo = juzgadoInterviniente = juzgadoTribunal = detectado;

    // ========== BÚSQUEDA EN CATÁLOGO ==========
    const mejor = this.matchJuzgadoCatalogoFlexible(detectado, labelFlag);
    if (mejor) {
      organo = mejor.juzgado;
      juzgadoInterviniente = mejor.juzgado;
      juzgadoTribunal = mejor.juzgado;
      direccionJuzgado = mejor.direccion || '';
      console.log('✅ Juzgado final desde catálogo:', mejor.juzgado);
    } else {
      console.log('⚠️ Usando juzgado detectado sin catálogo:', detectado);
    }

    return { organo, juzgadoInterviniente, direccionJuzgado, juzgadoTribunal };
  }

  private normalizarClaveJuzgado(texto: string): string {
    if (!texto) return '';
    return texto
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      // Expandir abreviaturas comunes
      .replace(/\bc\s*y\s*c\b/g, 'civil comercial')
      .replace(/\bciv\s*y\s*com\b/g, 'civil comercial')
      .replace(/\bciv\.\s*y\s*com\./g, 'civil comercial')
      // Normalizar frases completas
      .replace(/juzgado\s+en\s+lo\s+civil\s+y\s+comercial/g, 'juzgado civil comercial')
      .replace(/juzgado\s+civil\s+y\s+comercial/g, 'juzgado civil comercial')
      .replace(/juzgado\s+de\s+paz\s+letrado/g, 'juzgado paz letrado')
      // Normalizar numeración
      .replace(/\bn[º°]+/g, 'n')
      .replace(/\bnro\.?\s*/g, 'n')
      .replace(/\bnum\.?\s*/g, 'n')
      .replace(/\bnumero\s*/g, 'n')
      .replace(/\bn\s*(\d+)/g, 'n$1')
      // Limpiar separadores y puntuación
      .replace(/\s*-\s*/g, ' ')
      .replace(/[,.;:"()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extraerNumeroJuzgado(textoNorm: string): string | null {
    const match = textoNorm.match(/\bn(\d+)\b/);
    return match ? match[1] : null;
  }

  // (Se mantiene para compatibilidad; ahora sólo último token)
  private extraerCiudadJuzgado(textoNorm: string): string | null {
    const zona = this.extraerZonaJuzgado(textoNorm);
    if (!zona) return null;
    const toks = zona.split(' ').filter(t => !['de', 'del', 'la', 'el', 'los', 'las'].includes(t));
    return toks.length ? toks[toks.length - 1] : null;
  }

  private extraerZonaJuzgado(textoNorm: string): string | null {
    // patrón: ... n14 <resto>
    const m = textoNorm.match(/\bn\d+\b\s+(.*)$/);
    if (!m) return null;
    let zona = m[1]
      .trim()
      .replace(/\b(juzgado|civil|comercial|paz|letrado|penal|familia|trabajo|contencioso)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!zona) return null;
    // limitar a 6 tokens para evitar ruido excesivo
    const tokens = zona.split(' ').slice(0, 6);
    return tokens.join(' ');
  }


  private tokenizarZona(zona: string | null): string[] {
    if (!zona) return [];
    return zona
      .split(' ')
      .filter(t => t && !['de', 'del', 'la', 'el', 'los', 'las'].includes(t));
  }

  private extraerPalabrasClaveJuzgado(textoNorm: string): string[] {
    const claves = ['civil', 'comercial', 'paz', 'letrado', 'penal', 'familia', 'trabajo', 'contencioso'];
    return claves.filter(c => textoNorm.includes(c));
  }

  private matchJuzgadoCatalogoFlexible(detectado: string, labelFlag: boolean = false): JuzgadoCatalogEntry | undefined {
    if (!this.catalogo?.length) {
      console.warn('⚠️ Catálogo vacío - cargar CSV antes');
      return undefined;
    }

    const detNorm = this.normalizarClaveJuzgado(detectado);
    const numDet = this.extraerNumeroJuzgado(detNorm);
    const zonaDet = this.extraerZonaJuzgado(detNorm);
    const zonaTokensDet = this.tokenizarZona(zonaDet);
    const tipoJuzgadoDet = this.extraerTipoJuzgado(detNorm);

    if (this.debugMode) {
      console.log('🔍 Detectado normalizado:', detNorm);
      console.log('🔢 Número extraído:', numDet);
      console.log('📍 Zona detectada:', zonaDet);
      console.log('⚖️ Tipo juzgado:', tipoJuzgadoDet);
      if (labelFlag) console.log('🏷️ Prefijo JUZGADO: aplicado (boost zona)');
    }

    // ========== PASO 1: MATCH EXACTO (early return) ==========
    for (const entry of this.catalogo) {
      const cached = this.catalogoNormalizado.get(entry.juzgado);
      if (!cached) continue;

      if (cached.norm === detNorm) {
        console.log('✅ Match EXACTO:', entry.juzgado);
        return entry;
      }
    }

    // ========== PASO 2: BÚSQUEDA POR SCORING ==========
    interface Candidato {
      entry: JuzgadoCatalogEntry;
      puntos: number;
      penalizaciones: number;
      detalles: string[];
    }
    const candidatos: Candidato[] = [];

    for (const entry of this.catalogo) {
      const cached = this.catalogoNormalizado.get(entry.juzgado);
      if (!cached) continue;

      const { norm: catNorm, num: numCat, zona: zonaCat, tokens: zonaTokensCat } = cached;

      let puntos = 0;
      let penalizaciones = 0;
      const detalles: string[] = [];

      // -------- CRITERIO 1: NÚMERO (crítico) --------
      if (numDet && numCat) {
        if (numDet === numCat) {
          puntos += 700; // Aumentado de 600
          detalles.push(`num=${numDet}`);
        } else {
          // Números diferentes = descarte inmediato
          continue;
        }
      } else if (numDet || numCat) {
        // Uno tiene número y otro no = penalización fuerte
        penalizaciones += 300;
        detalles.push('num-mismatch');
      }

      // -------- CRITERIO 2: TIPO DE JUZGADO --------
      const tipoJuzgadoCat = this.extraerTipoJuzgado(catNorm);
      if (tipoJuzgadoDet && tipoJuzgadoCat) {
        if (tipoJuzgadoDet === tipoJuzgadoCat) {
          puntos += 200;
          detalles.push(`tipo=${tipoJuzgadoDet}`);
        } else {
          // Tipos diferentes (ej: civil vs paz) = descarte
          continue;
        }
      }

      // -------- CRITERIO 3: ZONA GEOGRÁFICA --------
      if (zonaDet && zonaCat) {
        if (zonaDet === zonaCat) {
          puntos += 500; // Aumentado de 400
          detalles.push('zona=exacta');
        } else {
          const inter = zonaTokensDet.filter(t => zonaTokensCat.includes(t));
          const porcentajeCoincidencia = inter.length / Math.max(zonaTokensDet.length, zonaTokensCat.length);

          if (porcentajeCoincidencia >= 0.66) { // Aumentado de 0.5
            const esPrefijo = zonaTokensDet.every((t, i) => zonaTokensCat[i] === t);
            if (esPrefijo && inter.length === zonaTokensDet.length) {
              puntos += 400; // Aumentado de 350
              detalles.push(`zona=prefijo(${inter.join('+')})`);
            } else if (inter.length >= 2) {
              puntos += 250; // Aumentado de 200
              detalles.push(`zona=parcial(${inter.join('+')})`);
            }
          } else if (porcentajeCoincidencia >= 0.33) {
            // Coincidencia baja = penalización leve
            penalizaciones += 50;
            puntos += 100;
            detalles.push(`zona=débil(${inter.length})`);
          } else {
            // Sin coincidencia significativa
            const baseDet = zonaTokensDet.slice(0, 2).join(' ');
            const baseCat = zonaTokensCat.slice(0, 2).join(' ');
            const distZona = this.calcularDistanciaTexto(baseDet, baseCat);

            if (distZona <= 2) {
              puntos += 120; // Aumentado de 100
              detalles.push(`zona~tipeo(dist:${distZona})`);
            } else {
              // Zonas muy diferentes = penalización
              penalizaciones += 100;
              detalles.push('zona-mismatch');
            }
          }
        }

        // Boost por prefijo label
        if (labelFlag && zonaTokensDet.length >= 2 && zonaTokensDet.every(t => zonaTokensCat.includes(t))) {
          puntos += 150; // Aumentado de 100
          detalles.push('boost=label+zona');
        }
      } else if (zonaDet || zonaCat) {
        // Uno tiene zona y otro no
        penalizaciones += 50;
        detalles.push('zona-parcial');
      }

      // -------- CRITERIO 4: PALABRAS CLAVE --------
      const palabrasDet = this.extraerPalabrasClaveJuzgado(detNorm);
      const palabrasCat = this.extraerPalabrasClaveJuzgado(catNorm);
      let palabrasMatch = 0;
      palabrasDet.forEach(p => {
        if (palabrasCat.includes(p)) {
          puntos += 60; // Aumentado de 50
          palabrasMatch++;
        }
      });
      if (palabrasMatch > 0) detalles.push(`+${palabrasMatch}palabras`);

      // -------- CRITERIO 5: SIMILARIDAD GLOBAL --------
      const distTotal = this.calcularDistanciaTexto(detNorm, catNorm);
      const longitudMax = Math.max(detNorm.length, catNorm.length);

      if (distTotal <= 2) {
        // Casi idéntico (errores mínimos)
        const similitud = 1 - (distTotal / longitudMax);
        const puntosSimil = Math.round(similitud * 100);
        puntos += puntosSimil + 120;
        detalles.push(`sim=${(similitud * 100).toFixed(0)}%+casi-exacto`);
      } else if (distTotal <= 4) {
        // Errores menores
        puntos += 60;
        detalles.push(`tipeo-menor(dist:${distTotal})`);
      } else if (distTotal <= 8) {
        // Errores moderados
        puntos += 20;
        detalles.push(`tipeo-mod(dist:${distTotal})`);
      } else {
        // Muy diferentes
        penalizaciones += Math.min(distTotal * 2, 100);
      }

      // -------- SCORING FINAL --------
      const puntosFinales = Math.max(0, puntos - penalizaciones);

      if (puntosFinales > 0) {
        candidatos.push({
          entry,
          puntos: puntosFinales,
          penalizaciones,
          detalles: [...detalles, `(${puntos}-${penalizaciones}=${puntosFinales})`]
        });
      }
    }

    // ========== PASO 3: SELECCIÓN DEL MEJOR ==========
    if (!candidatos.length) {
      console.warn('❌ Sin candidatos');
      return undefined;
    }

    candidatos.sort((a, b) => b.puntos - a.puntos);

    if (this.debugMode) {
      console.log('🏆 Top 5 candidatos:', candidatos.slice(0, 5).map(c => ({
        juzgado: c.entry.juzgado,
        puntos: c.puntos,
        detalles: c.detalles
      })));
    } else {
      // Solo mostrar top 3 en modo normal
      console.log('🏆 Top 3 candidatos:', candidatos.slice(0, 3).map(c => ({
        juzgado: c.entry.juzgado,
        puntos: c.puntos
      })));
    }

    // -------- OVERRIDE POR ZONA COMPLETA --------
    if (zonaTokensDet.length >= 2) {
      const topPuntos = candidatos[0].puntos;
      const grupo = candidatos.filter(c => topPuntos - c.puntos <= 15); // Aumentado de 10
      const preferente = grupo.find(c => {
        const cached = this.catalogoNormalizado.get(c.entry.juzgado);
        if (!cached) return false;
        return zonaTokensDet.every(t => cached.tokens.includes(t));
      });
      if (preferente && preferente.entry !== candidatos[0].entry) {
        console.log('➡️ Override por zona completa:', preferente.entry.juzgado);
        return preferente.entry;
      }
    }

    // -------- VALIDACIÓN DE UMBRAL --------
    const mejor = candidatos[0];
    const umbralMinimo = numDet ? 700 : 500; // Aumentado de 600/450

    if (mejor.puntos < umbralMinimo) {
      console.warn(`⚠️ Mejor candidato con ${mejor.puntos} puntos (<${umbralMinimo}) - baja confianza`);
      // Retornar de todos modos si el margen es razonable
      if (mejor.puntos >= umbralMinimo * 0.8) {
        console.log('⚡ Aceptado con confianza media:', mejor.entry.juzgado);
        return mejor.entry;
      }
      return undefined;
    }

    console.log('✅ Match seleccionado:', mejor.entry.juzgado, '→', mejor.entry.direccion);
    return mejor.entry;
  }

  /**
   * Extrae el tipo de juzgado (civil comercial, paz letrado, etc.)
   */
  private extraerTipoJuzgado(textoNorm: string): string {
    if (textoNorm.includes('juzgado civil comercial')) return 'civil-comercial';
    if (textoNorm.includes('juzgado paz letrado')) return 'paz-letrado';
    if (textoNorm.includes('juzgado penal')) return 'penal';
    if (textoNorm.includes('juzgado familia')) return 'familia';
    if (textoNorm.includes('juzgado trabajo')) return 'trabajo';
    if (textoNorm.includes('tribunal')) return 'tribunal';
    return '';
  }

  private calcularDistanciaTexto(a: string, b: string): number {
    if (a === b) return 0;
    if (!a) return b.length;
    if (!b) return a.length;

    const matriz: number[][] = [];

    for (let i = 0; i <= a.length; i++) {
      matriz[i] = [i];
    }
    for (let j = 0; j <= b.length; j++) {
      matriz[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const costo = a[i - 1] === b[j - 1] ? 0 : 1;
        matriz[i][j] = Math.min(
          matriz[i - 1][j] + 1,
          matriz[i][j - 1] + 1,
          matriz[i - 1][j - 1] + costo
        );
      }
    }

    return matriz[a.length][b.length];
  }


  // ---------------- Expediente ----------------
  private extraerExpediente(texto: string): ExpedienteInfo {
    // Busca variantes: EXPEDIENTE, EXPEDIENTE Nº, EXPEDIENTE N°, Número, con o sin dos puntos, salto de línea, etc.
    const numeroExpedienteMatch = texto.match(/(?:EXPEDIENTE\s*(?:N[º°]?)?|N[úu]mero)\s*[:\-]?\s*([A-Z]{2,}-\d{4,}-\d{4})/i)
      || texto.match(/EXPEDIENTE\s*[:\-]?\s*([A-Z]{2,}-\d{4,}-\d{4})/i)
      || texto.match(/Receptor[ií]a[\s-]*causa\s*[:\-]?\s*([A-Z]{2,}-\d{3,}-\d{4})/i)
      || texto.match(/Expte\.?\s*(?:Interno)?\s*(?:N[º°]?\s*[:\-]?\s*)?(\d{3,})/i)
      || texto.match(/([A-Z]{2,}-\d{4,}-\d{4})/);
    const numeroExpediente = numeroExpedienteMatch ? numeroExpedienteMatch[1].trim() : '';

    const caratulaMatch =
      texto.match(/Car[áa]tula:\s*"?(.*?)"?\s*(?:Juzgado:|Número:|Receptor[ií]a|\n)/i) ||
      texto.match(/Car[áa]tula:\s*"?([^"\n]+)/i) ||
      texto.match(/AUTOS\s*:?\s*"([^"]+)"/i) ||
      texto.match(/^"([^"]+)"\s*$/m);

    let caratulaExpediente = caratulaMatch ? caratulaMatch[1].trim() : '';
    caratulaExpediente = caratulaExpediente.replace(/"\.$/, '').replace(/"/g, '');

    const copiasTraslado = /código QR|copias de traslado|traslado.*QR/i.test(texto);

    // tipoDiligencia se dejará vacío aquí, se completará desde la plantilla
    const tipoDiligencia = '';

    return { caratulaExpediente, numeroExpediente, copiasTraslado, tipoDiligencia };
  }

  // ---------------- Caracter ----------------
  private extraerCaracter(texto: string): CaracterInfo {
    const urgente = /\b(urgente|urgentemente|carácter urgente|carácter de urgente)\b/i.test(texto);
    const habilitacionDiaHora = /\b(habilitación de d[ií]as y horas(?: inhábiles)?|con habilitación de día y hora(?: inhábiles)?|habilitación de días y horas inhábiles)\b/i.test(texto);
    const bajoResponsabilidad = /\b(bajo responsabilidad(?: de la parte actora)?|bajo su responsabilidad|y bajo responsabilidad(?: de la parte actora)?)\b/i.test(texto);
    return { urgente, habilitacionDiaHora, bajoResponsabilidad };
  }

  // ---------------- Tipo Domicilio ----------------
  extraerTipoDomicilio(texto: string): TipoDomicilioInfo {
    const denunciado = /\b(domicilio denunciado|domicilio que se denuncie|denunciado en autos|domicilio del requerido|domicilio real)\b/i.test(texto);
    const constituido = /\b(domicilio constituido|constituyó domicilio|domicilio procesal|constituido en autos)\b/i.test(texto);
    return { denunciado, constituido };
  }

  // ---------------- Facultades ----------------
  extraerFacultadesAtribuciones(texto: string): FacultadesInfo {
    const allanamiento = /allanamiento del domicilio|facúltese.*allanamiento|autorícese.*allanamiento|con facultad de allanamiento|\ballanamiento\b|para allanar|allanar/i.test(texto);
    const allanamientoDomicilioSinOcupantes = /inmueble.*desocupado|sin ocupantes|aunque no haya ocupantes|allanamiento sin ocupantes|siempre que no haya ocupantes|pudiendo allanar en caso de no haber ocupantes|pudiendose allanar en caso de no haber ocupantes/i.test(texto);
    const auxilioFuerzaPublica = /fuerza pública|intervención policial|pudiendo requerir fuerza pública|con auxilio de la fuerza pública|con el auxilio de la fuerza pública/i.test(texto);
    const conCerrajero = /\b(con\s+cerrajero|con\s+el\s+cerrajero|uso de cerrajero|valerse de cerrajero)\b/i.test(texto);
    const denunciaOtroDomicilio = /denuncie otro domicilio|otro domicilio que se denunciare|denunciar otro domicilio/i.test(texto);
    const denunciaBienes = /denuncie bienes|denunciar bienes|facúltese.*denunciar bienes|denuncia de bienes|denuncia de bienes a embargo|facultad de denunciar bienes|con la facultad de denunciar bienes|individualizar bienes|facultad de individualizar bienes/i.test(texto);
    const algunaFacultad = /facúltese|autorícese/i.test(texto);
    const algunaDetectada = allanamiento || allanamientoDomicilioSinOcupantes || auxilioFuerzaPublica || conCerrajero || denunciaOtroDomicilio || denunciaBienes;
    const otros = algunaFacultad && !algunaDetectada;

    return {
      allanamiento,
      allanamientoDomicilioSinOcupantes,
      auxilioFuerzaPublica,
      conCerrajero,
      denunciaOtroDomicilio,
      denunciaBienes,
      otros
    };
  }

  // ---------------- Texto contenido ----------------
  private extraerRequerido(texto: string): string {
    if (!texto) return 'NOMBRE REQUERIDO';

    const limpiar = (nombre: string): string =>
      (nombre || '')
        .replace(/^(SR\.?|SRA\.?|SRES\.?|SRAS\.?)\s+/i, '')
        .replace(/\b(DNI|CUIT|CUIL)\b.*$/i, '')
        .replace(/\bS\/.*$/i, '')
        .replace(/\s+Y\s+OTR[OA]S?(?:\/[OA]S?)?$/i, '')
        .replace(/[",.;:]+$/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();

    // PRIORIDAD 0: Carátula (si existe). Tomar texto entre C/ y S/
    // Ej: SANBERCON S.R.L. C/ LARRETAPE GABRIELA ILEANA S/ COBRO EJECUTIVO
    const caratulaLinea =
      (texto.match(/Car[áa]tula:\s*"?(.*?)"?\s*(?:Juzgado:|Número:|Receptor[ií]a|\n)/i) ||
        texto.match(/Car[áa]tula:\s*"?([^"\n]+)/i) ||
        texto.match(/AUTOS\s*:?\s*"([^"]+)"/i) ||
        texto.match(/^"([^"]+)"\s*$/m));
    if (caratulaLinea) {
      const linea = caratulaLinea[1]
        .replace(/"\s*$/, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase();

      // Buscar segmento entre C/ y S/
      const matchCS = linea.match(/C\/\s+([A-ZÁÉÍÓÚÑ /.]+?)\s+S\//i);
      if (matchCS) {
        const candidato = limpiar(matchCS[1]);
        if (candidato.length >= 3) return candidato;
      }
    }

    // PRIORIDAD 1: Frases de traslado / cédula
    const patronesTraslado: RegExp[] = [
      /C[ÓO]RRASE\s+TRASLADO\s+(?:AL?|A LA|A LOS|A LAS)?\s*(?:SRES?\.?|SRAS?\.?|SR\.?|SRA\.?)?\s*"?(?<nombre>[A-ZÁÉÍÓÚÑ ]{3,})(?:"|\s+S\/|\s+POR|\s+QUE|\s+CON|,|\.|$)/i,
      /LIBRESE\s+(?:NUEVA\s+)?CEDULA(?:\s+DIRIGIDA)?\s+(?:AL?|A LA|A LOS|A LAS)\s*(?:SRES?\.?|SRAS?\.?|SR\.?|SRA\.?)?\s*"?(?<nombre>[A-ZÁÉÍÓÚÑ ]{3,})(?:"|\s+S\/|\s+POR|\s+QUE|\s+CON|,|\.|$)/i,
      /TRASLADO\s+(?:AL?|A LA|A LOS|A LAS)\s*(?:SRES?\.?|SRAS?\.?|SR\.?|SRA\.?)?\s*"?(?<nombre>[A-ZÁÉÍÓÚÑ ]{3,})(?:"|\s+S\/|\s+POR|\s+QUE|\s+CON|,|\.|$)/i
    ];
    for (const r of patronesTraslado) {
      const m = texto.match(r);
      if (m?.groups?.['nombre']) {
        const candidato = limpiar(m.groups['nombre']);
        if (candidato.length >= 3) return candidato;
      }
    }

    // PRIORIDAD 2: "contra el ejecutado ..."
    const pContra = /CONTRA\s+(?:EL|LA)?\s*(?:EJECUTAD[OA]\s*)?(?<nombre>[A-ZÁÉÍÓÚÑ ]{3,})(?=\s+POR\s+LA\s+SUMA|\s+PESOS|\s+QUE|\s+CON\b|,|\.|$)/i;
    const mContra = texto.match(pContra);
    if (mContra?.groups?.['nombre']) {
      const candidato = limpiar(mContra.groups['nombre']);
      if (candidato) return candidato;
    }

    // PRIORIDAD 3: "ejecutado NOMBRE ..."
    const pEjec = /EJECUTAD[OA]\s+(?<nombre>[A-ZÁÉÍÓÚÑ ]{3,})(?=\s+POR\s+LA\s+SUMA|\s+PESOS|\s+QUE|\s+CON\b|,|\.|$)/i;
    const mEjec = texto.match(pEjec);
    if (mEjec?.groups?.['nombre']) {
      const candidato = limpiar(mEjec.groups['nombre']);
      if (candidato) return candidato;
    }

    // PRIORIDAD 4: AUTOS:"ACTOR C/ DEMANDADO S/ ..."
    const pAutos = /AUTOS:"[^"]+?C\/\s*(?<nombre>[A-ZÁÉÍÓÚÑ ]{3,})\s*S\/[^"]*"/i;
    const mAutos = texto.match(pAutos);
    if (mAutos?.groups?.['nombre']) {
      const candidato = limpiar(mAutos.groups['nombre']);
      if (candidato) return candidato;
    }

    // PRIORIDAD 5: Carátula alternativa (si no se tomó antes y viene entre comillas)
    const pCaratulaAlt = /CAR[ÁA]TULA:\s*"?.+?C\/\s*(?<nombre>[A-ZÁÉÍÓÚÑ ]{3,})\s*S\/.*"?/i;
    const mCaratulaAlt = texto.match(pCaratulaAlt);
    if (mCaratulaAlt?.groups?.['nombre']) {
      const candidato = limpiar(mCaratulaAlt.groups['nombre']);
      if (candidato) return candidato;
    }

    // PRIORIDAD 6: C/ DEMANDADO S/ (simple)
    const pSimpleC = /C\/\s*(?<nombre>[A-ZÁÉÍÓÚÑ ]{3,})\s*S\/[A-ZÁÉÍÓÚÑ ]+/i;
    const mSimpleC = texto.match(pSimpleC);
    if (mSimpleC?.groups?.['nombre']) {
      const candidato = limpiar(mSimpleC.groups['nombre']);
      if (candidato) return candidato;
    }

    return 'NOMBRE REQUERIDO';
  }

  // ---------------- Texto contenido ----------------
  private extraerTextoContenido(texto: string): TextoContenidoInfo {
    debugger
    const requerido = this.extraerRequerido(texto);
    const { montoCapitalTexto, montoCapitalNumerico } = this.extraerMontoCapital(texto);
    const { montoInteresesTexto, montoInteresesNumerico } = this.extraerMontoIntereses(texto);
    const textoNotificacion = this.extraerTextoNotificacion(texto);
    // textoDespacho es el mismo que textoNotificacion (el proveído completo)
    const textoDespacho = textoNotificacion;
    return {
      requerido,
      montoCapitalTexto,
      montoCapitalNumerico,
      montoInteresesTexto,
      montoInteresesNumerico,
      textoNotificacion,
      textoDespacho
    };
  }

  /**
   * Extrae el texto del proveído/resolución eliminando los campos del encabezado del sistema
   * (Número, Carátula, Juzgado, Lista de referencias, etc.)
   */
  private extraerTextoNotificacion(texto: string): string {
    if (!texto) return '';

    // Buscar el inicio del texto real después de los campos del sistema
    // Patrones comunes de inicio:
    const patronesInicio = [
      /Lista de referencias[\s\S]*?(?:PRIMER DESPACHO|SE PROVEE|AUTOS Y VISTOS)/i,
      /(?:PRIMER DESPACHO|SE PROVEE)[\s\S]*?(?=\n[A-Z])/i,
      /Juzgado:[\s\S]*?\n\n(.+)/i
    ];

    let textoLimpio = texto;

    // Intentar encontrar dónde comienza el proveído real
    for (const patron of patronesInicio) {
      const match = texto.match(patron);
      if (match) {
        const posicion = match.index! + match[0].length;
        textoLimpio = texto.substring(posicion).trim();
        break;
      }
    }

    // Si no encontramos patrones específicos, intentar otra estrategia:
    // Buscar después de "Juzgado:" y luego el primer párrafo que parece ser el proveído
    if (textoLimpio === texto) {
      const despuesJuzgado = texto.match(/Juzgado:[\s\S]*?\n\n([\s\S]+)/i);
      if (despuesJuzgado) {
        textoLimpio = despuesJuzgado[1].trim();

        // Quitar líneas que parecen encabezados del sistema
        const lineas = textoLimpio.split('\n');
        let inicioReal = 0;
        for (let i = 0; i < lineas.length; i++) {
          const linea = lineas[i].trim();
          // Si la línea parece ser parte del proveído (tiene palabras y no es un campo)
          if (linea.length > 30 && !linea.match(/^(Número|Carátula|Juzgado|Lista de referencias):/i)) {
            inicioReal = i;
            break;
          }
        }
        textoLimpio = lineas.slice(inicioReal).join('\n').trim();
      }
    }

    return textoLimpio;
  }

  private extraerMontoCapital(texto: string): { montoCapitalTexto: string; montoCapitalNumerico: string } {
    if (!texto) return { montoCapitalTexto: 'MONTO CAPITAL', montoCapitalNumerico: '' };
    const originalCompact = texto.replace(/\s+/g, ' ').trim();
    const normalizado = originalCompact
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const segmentos = this.obtenerSegmentosCapital(originalCompact, normalizado);
    const candidatos = segmentos.flatMap(segmento => this.extraerCandidatosMontoCapital(segmento.texto, segmento.esPrioritario));
    const mejorCandidato = this.seleccionarMejorCandidatoMontoCapital(candidatos);

    let numeroBruto = mejorCandidato?.numeroBruto || '';
    let literal = this.limpiarLiteralCapital(mejorCandidato?.literal || '');

    if (!literal) {
      for (const segmento of segmentos) {
        literal = this.extraerLiteralCapital(segmento.texto);
        if (literal) break;
      }
    }

    // Construcción del texto
    let montoCapitalTexto = 'MONTO CAPITAL';
    // Si hay literal, úsalo
    if (literal) {
      montoCapitalTexto = `PESOS ${literal}`;
    } else if (numeroBruto) {
      // Si no hay literal pero sí número, construir literal desde el número
      const numEntero = parseInt(numeroBruto.replace(/[^\d]/g, ''), 10);
      const literalAuto = this.numeroATextoGrande(numEntero);
      if (literalAuto) {
        montoCapitalTexto = `PESOS ${literalAuto.toUpperCase()}`;
      } else {
        // fallback mínimo si la conversión fallara
        montoCapitalTexto = `PESOS (NUMERICO)`;
      }
    }

    // Numerización usando el pipe (normalizar miles y decimales)
    let montoCapitalNumerico = '';
    if (numeroBruto) {
      const normalizadoNumero = numeroBruto
        .replace(/[^\d.,]/g, '')
        .replace(/\.(?=\d{3}(\D|$))/g, '')   // quita puntos de miles
        .replace(/,(\d{2})$/, '.$1');        // coma decimal -> punto
      montoCapitalNumerico = this.monedaPipe.transform(normalizadoNumero);
    } else if (literal) {
      const posible = this.monedaPipe.transform(literal);
      if (posible) montoCapitalNumerico = posible;
    }

    return {
      montoCapitalTexto: montoCapitalTexto.replace(/\s+/g, ' ').trim(),
      montoCapitalNumerico
    };
  }

  private obtenerSegmentosCapital(originalCompact: string, normalizado: string): SegmentoCapitalInfo[] {
    const segmentos: SegmentoCapitalInfo[] = [];
    const agregados = new Set<string>();
    const contextosPrioritarios = [
      'librese mandamiento de ejecucion',
      'importe del credito que se reclama',
      'credito que se reclama en autos'
    ];

    for (const contexto of contextosPrioritarios) {
      const index = normalizado.indexOf(contexto);
      if (index === -1) continue;
      const inicio = Math.max(0, index - 220);
      const fin = Math.min(originalCompact.length, index + contexto.length + 260);
      const segmento = this.recortarSegmentoCapital(originalCompact.slice(inicio, fin));
      if (!segmento) continue;
      const clave = `prioridad:${segmento}`;
      if (!agregados.has(clave)) {
        agregados.add(clave);
        segmentos.push({ texto: segmento, esPrioritario: true });
      }
    }

    let inicioFallback = [
      'por la suma reclamada',
      'por la suma de $',
      'por la suma de pesos ',
      'por la suma',
      'por las sumas',
      'pesos '
    ].map(k => normalizado.indexOf(k)).filter(i => i !== -1).sort((a, b) => a - b)[0];
    if (inicioFallback === undefined) inicioFallback = normalizado.indexOf('pesos ');
    if (inicioFallback === -1 || inicioFallback === undefined) inicioFallback = 0;

    let finFallback = [
      normalizado.indexOf('en concepto de capital', inicioFallback),
      normalizado.indexOf('con mas la suma', inicioFallback),
      normalizado.indexOf('con más la suma', inicioFallback),
      normalizado.indexOf('con mas una suma', inicioFallback),
      normalizado.indexOf('con más una suma', inicioFallback),
      normalizado.indexOf('para responder a intereses', inicioFallback),
      normalizado.indexOf('intereses y costas', inicioFallback)
    ].filter(index => index !== -1).sort((a, b) => a - b)[0];
    if (finFallback === undefined || finFallback < inicioFallback) finFallback = inicioFallback + 420;

    const fallback = this.recortarSegmentoCapital(
      originalCompact.slice(inicioFallback, Math.min(finFallback + 120, originalCompact.length))
    );
    if (fallback) {
      const clave = `fallback:${fallback}`;
      if (!agregados.has(clave)) {
        segmentos.push({ texto: fallback, esPrioritario: false });
      }
    }

    if (!segmentos.length) {
      segmentos.push({ texto: this.recortarSegmentoCapital(originalCompact.slice(0, 420)), esPrioritario: false });
    }

    return segmentos.filter(segmento => !!segmento.texto);
  }

  private recortarSegmentoCapital(segmento: string): string {
    if (!segmento) return '';
    const compacto = segmento.replace(/\s+/g, ' ').trim();
    if (!compacto) return '';

    const normalizado = compacto
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const cortes = [
      'con mas una suma',
      'con más una suma',
      'con mas la suma',
      'con más la suma',
      'para responder a intereses',
      'intereses y costas',
      'para responder intereses'
    ];

    let fin = compacto.length;
    for (const corte of cortes) {
      const index = normalizado.indexOf(corte);
      if (index !== -1 && index < fin) fin = index;
    }

    return compacto.slice(0, fin).trim();
  }

  private extraerCandidatosMontoCapital(segmento: string, esPrioritario: boolean): CandidatoMontoCapital[] {
    const candidatos: CandidatoMontoCapital[] = [];
    const vistos = new Set<string>();
    const patronPesosConParentesis = /PESOS?\s+([A-ZÁÉÍÓÚÑa-záéíóúñ ,\.]+?)\s*\(\s*\$?\s*([\d]+(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(?:[.\-–]{0,2})\s*\)/gi;
    const patronNumerico = /(?:por\s+la\s+suma(?:\s+reclamada)?\s+de\s+|importe\s+del\s+credito\s+que\s+se\s+reclama\s+en\s+autos\s*:?\s*|credito\s+que\s+se\s+reclama\s+en\s+autos\s*:?\s*)?\$\s*([\d]{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|[\d]{4,})/gi;
    const patronParentesis = /\(\s*\$?\s*([\d]{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|[\d]{4,})\s*(?:[.\-–]{0,2})\s*\)/gi;

    const registrar = (numeroBruto: string, index: number, baseScore: number, literal: string = '') => {
      const clave = `${index}:${numeroBruto}:${literal}`;
      if (!numeroBruto || vistos.has(clave)) return;
      vistos.add(clave);

      const valorNumerico = this.parseNumeroMonetario(numeroBruto);
      if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) return;

      const contexto = segmento.slice(Math.max(0, index - 80), Math.min(segmento.length, index + 120));
      const contextoNormalizado = contexto
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

      let score = baseScore + (esPrioritario ? 50 : 0);
      if (/credito\s+que\s+se\s+reclama|importe\s+del\s+credito|capital/.test(contextoNormalizado)) score += 45;
      if (/por\s+la\s+suma|mandamiento\s+de\s+ejecucion/.test(contextoNormalizado)) score += 20;
      if (/tasa\s+de\s+justicia|tasa\b|justicia\b|bono\b|jus\b|ius\b|aporte\b|adicional\b|intereses\b|costas\b/.test(contextoNormalizado)) score -= 90;

      candidatos.push({
        literal: this.limpiarLiteralCapital(literal),
        numeroBruto,
        valorNumerico,
        score,
        index
      });
    };

    for (const match of segmento.matchAll(patronPesosConParentesis)) {
      registrar(match[2], match.index ?? 0, 130, match[1]);
    }

    for (const match of segmento.matchAll(patronNumerico)) {
      registrar(match[1], match.index ?? 0, 70);
    }

    for (const match of segmento.matchAll(patronParentesis)) {
      registrar(match[1], match.index ?? 0, 55);
    }

    return candidatos;
  }

  private seleccionarMejorCandidatoMontoCapital(candidatos: CandidatoMontoCapital[]): CandidatoMontoCapital | null {
    if (!candidatos.length) return null;

    return [...candidatos].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.valorNumerico !== a.valorNumerico) return b.valorNumerico - a.valorNumerico;
      return a.index - b.index;
    })[0];
  }

  private extraerLiteralCapital(segmento: string): string {
    if (!segmento) return '';
    const regexLiteralPrincipal = /PESOS?\s+([A-ZÁÉÍÓÚÑa-záéíóúñ ,\.]+?)(?:\s+CON\s+[0-9]{1,3}\/[0-9]{1,3}|\s*\(|\s+EN\s+CONCEPTO|\s+CON\s+MAS|\s+CON\s+MÁS|$)/i;
    const matchPrincipal = segmento.match(regexLiteralPrincipal);
    if (matchPrincipal?.[1]) return this.limpiarLiteralCapital(matchPrincipal[1]);

    const matchAlternativo = /POR\s+LA\s+SUMA(?:\s+RECLAMADA)?\s+DE\s+PESOS?\s+([A-ZÁÉÍÓÚÑa-záéíóúñ ,\.]+?)(?:\s+CON\s+[0-9]{1,3}\/[0-9]{1,3}|\s*\(|\s+EN\s+CONCEPTO|$)/i.exec(segmento);
    return this.limpiarLiteralCapital(matchAlternativo?.[1] || '');
  }

  private parseNumeroMonetario(numeroBruto: string): number {
    const limpio = (numeroBruto || '').replace(/[^\d.,]/g, '');
    if (!limpio) return NaN;

    const tienePunto = limpio.includes('.');
    const tieneComa = limpio.includes(',');
    let normalizado = limpio;

    if (tienePunto && tieneComa) {
      if (limpio.lastIndexOf(',') > limpio.lastIndexOf('.')) {
        normalizado = limpio.replace(/\./g, '').replace(',', '.');
      } else {
        normalizado = limpio.replace(/,/g, '');
      }
    } else if (tieneComa) {
      const decimales = limpio.length - limpio.lastIndexOf(',') - 1;
      normalizado = decimales <= 2 ? limpio.replace(/\./g, '').replace(',', '.') : limpio.replace(/,/g, '');
    } else if (tienePunto) {
      const decimales = limpio.length - limpio.lastIndexOf('.') - 1;
      normalizado = decimales <= 2 ? limpio : limpio.replace(/\./g, '');
    }

    return Number(normalizado);
  }

  private limpiarLiteralCapital(raw: string): string {
    return (raw || '')
      .replace(/EN\s+CONCEPTO\s+DE\s+CAPITAL.*$/i, '')
      .replace(/CON\s+MAS\s+LA\s+SUMA.*$/i, '')
      .replace(/CON\s+MÁS\s+LA\s+SUMA.*$/i, '')
      .replace(/CON\s+MAS\s+UNA\s+SUMA.*$/i, '')
      .replace(/CON\s+MÁS\s+UNA\s+SUMA.*$/i, '')
      .replace(/QUE\s+SE\s+PRESUPUESTA.*$/i, '')
      .replace(/PARA\s+RESPONDER.*$/i, '')
      .replace(/INTERESES\s+Y\s+COSTAS.*$/i, '')
      .replace(/[",;:]+$/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  private numeroATexto(n: number): string {
    const unidades = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciseis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const decenas = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    if (n < 10) return unidades[n];
    if (n < 20) return especiales[n - 10];
    if (n < 100) {
      const d = Math.floor(n / 10);
      const u = n % 10;
      if (u === 0) return decenas[d];
      if (d === 2) return 'veinti' + unidades[u];
      return decenas[d] + ' y ' + unidades[u];
    }
    if (n < 1000) {
      const c = Math.floor(n / 100);
      const resto = n % 100;
      const cientos = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
      if (n === 100) return 'cien';
      return cientos[c] + (resto ? ' ' + this.numeroATexto(resto) : '');
    }
    return String(n);
  }

  private extraerMontoIntereses(texto: string): { montoInteresesTexto: string; montoInteresesNumerico: string } {
    if (!texto) return { montoInteresesTexto: 'MONTO INTERESES', montoInteresesNumerico: '' };
    const original = texto;
    const normalizado = original
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ');

    let inicio = [
      'con mas la suma de pesos ',
      'con más la suma de pesos ',
      'con mas la suma de ',
      'con más la suma de ',
      'con mas la suma',
      'con más la suma',
      'con mas la de',
      'con más la de'
    ].map(k => normalizado.indexOf(k)).filter(i => i !== -1).sort((a, b) => a - b)[0];

    if (inicio === undefined) {
      const posInteresesPal = normalizado.indexOf('intereses');
      if (posInteresesPal !== -1) {
        const posPesos = normalizado.indexOf('pesos ', posInteresesPal);
        if (posPesos !== -1) inicio = posPesos;
      }
    }
    if (inicio === undefined) return { montoInteresesTexto: 'MONTO INTERESES', montoInteresesNumerico: '' };

    const finFrases = [
      'para responder a intereses',
      'para responder intereses',
      'para intereses',
      'por intereses',
      'por interes',
      'para interes',
      'que se presupuesta',
      'que se presuponen',
      'costas del juicio',
      'costas'
    ];
    let fin = -1;
    for (const f of finFrases) {
      const p = normalizado.indexOf(f, inicio);
      if (p !== -1 && (fin === -1 || p < fin)) fin = p;
    }
    if (fin === -1 || fin < inicio) fin = inicio + 400;

    const originalCompact = original.replace(/\s+/g, ' ');
    const segmento = originalCompact.slice(inicio, Math.min(fin + 60, originalCompact.length));

    const numeroMatch = segmento.match(/\(\s*\$?\s*([\d]{1,3}(?:[.\,]\d{3})*(?:[.,]\d{2})?)\s*(?:[.\-–]{0,2})\s*\)/);
    let numeroBruto = numeroMatch ? numeroMatch[1] : '';
    if (!numeroBruto) {
      const inlineMatch = segmento.match(/\b\$?\s*([\d]{1,3}(?:[.\,]\d{3})*(?:[.,]\d{2})?)\b/);
      numeroBruto = inlineMatch ? inlineMatch[1] : '';
    }
    let montoInteresesNumerico = numeroBruto ? this.monedaPipe.transform(
      numeroBruto
        .replace(/[^\d.,]/g, '')
        .replace(/\.(?=\d{3}(\D|$))/g, '')
        .replace(/,(\d{2})$/, '.$1')
    ) : '';

    let literal = '';
    const regexLiteral =
      /PESOS?\s+([A-ZÁÉÍÓÚÑ ]+?)(?:\s+CON\s+\d{1,3}\/\d{1,3}|\s*\(|\s*,\s+QUE\s+SE|\s+QUE\s+SE\s+PRESUPONEN|\s+QUE\s+SE\s+PRESUPUESTA|\s+PARA\s+RESPONDER|\s+POR\s+INTERESES|\s+POR\s+INTERES|\s+PARA\s+INTERESES|\s+PARA\s+INTERES|$)/i;
    const mLit = segmento.match(regexLiteral);
    if (mLit) {
      literal = mLit[1]
        .replace(/\s{2,}/g, ' ')
        .trim()
        .replace(/^(Y\s+)?/, '');
    }

    literal = this.limpiarLiteralIntereses(literal);

    if (literal.includes('(')) {
      literal = literal.split('(')[0].trim();
    }

    let montoInteresesTexto = 'MONTO INTERESES';
    if (literal) {
      montoInteresesTexto = `PESOS ${literal}`;
    } else if (!literal && numeroBruto) {
      // construir texto desde número si no se pudo extraer literal
      // Normalizar correctamente: quitar puntos de miles, convertir coma decimal a punto, tomar solo parte entera
      const numeroNormalizado = numeroBruto
        .replace(/[^\d.,]/g, '')
        .replace(/\.(?=\d{3}(\D|$))/g, '')   // quita puntos de miles
        .replace(/,(\d{2})$/, '.$1');         // coma decimal -> punto
      const numEntero = parseInt(numeroNormalizado.split('.')[0], 10);
      const literalAuto = this.numeroATextoGrande(numEntero);
      if (literalAuto) montoInteresesTexto = `PESOS ${literalAuto.toUpperCase()}`;
    }

    if (!montoInteresesNumerico && numeroBruto) {
      montoInteresesNumerico = this.monedaPipe.transform(numeroBruto);
    }
    if (!montoInteresesNumerico && literal) {
      const posible = this.monedaPipe.transform(literal);
      if (posible) montoInteresesNumerico = posible;
    }

    return {
      montoInteresesTexto: montoInteresesTexto.replace(/\s+/g, ' ').trim(),
      montoInteresesNumerico
    };
  }

  // Extensión para números grandes (hasta millones)
  private numeroATextoGrande(n: number): string {
    if (n === 0) return 'cero';
    const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciseis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const decenas = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

    const toTextoMenor100 = (x: number): string => {
      if (x < 10) return unidades[x];
      if (x < 20) return especiales[x - 10];
      const d = Math.floor(x / 10), u = x % 10;
      if (u === 0) return decenas[d];
      if (d === 2) return 'veinti' + unidades[u];
      return decenas[d] + ' y ' + unidades[u];
    };
    const toTextoMenor1000 = (x: number): string => {
      if (x === 100) return 'cien';
      if (x < 100) return toTextoMenor100(x);
      const c = Math.floor(x / 100);
      const resto = x % 100;
      return centenas[c] + (resto ? ' ' + toTextoMenor100(resto) : '');
    };

    let partes: string[] = [];
    const millones = Math.floor(n / 1_000_000);
    const miles = Math.floor((n % 1_000_000) / 1000);
    const resto = n % 1000;

    if (millones) partes.push(millones === 1 ? 'un millón' : `${toTextoMenor1000(millones)} millones`);
    if (miles) partes.push(miles === 1 ? 'mil' : `${toTextoMenor1000(miles)} mil`);
    if (resto) partes.push(toTextoMenor1000(resto));
    return partes.join(' ').replace(/\s+/g, ' ').trim();
  }

  private limpiarLiteralIntereses(raw: string): string {
    return (raw || '')
      .replace(/para responder a intereses.*$/i, '')
      .replace(/para responder intereses.*$/i, '')
      .replace(/que se presupuesta.*$/i, '')
      .replace(/para intereses.*$/i, '')
      .replace(/para interes.*$/i, '')
      .replace(/por intereses.*$/i, '')
      .replace(/por interes.*$/i, '')
      .replace(/en concepto de intereses.*$/i, '')
      .replace(/[",;:]+$/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  // ---------------- Plantilla ----------------
  private aplicarPlantilla(resultado: any, plantilla: any): any {
    Object.keys(plantilla).forEach(key => {
      if (typeof plantilla[key] === 'object' && plantilla[key] !== null && !Array.isArray(plantilla[key])) {
        // Si el resultado no tiene la clave o no es un objeto, inicializar
        if (!resultado[key] || typeof resultado[key] !== 'object') {
          resultado[key] = {};
        }
        // Merge profundo: mantener valores del resultado y sobrescribir con plantilla
        resultado[key] = { ...resultado[key], ...plantilla[key] };
      } else {
        // Para valores primitivos, sobrescribir directamente
        resultado[key] = plantilla[key];
      }
    });
    return resultado;
  }
}