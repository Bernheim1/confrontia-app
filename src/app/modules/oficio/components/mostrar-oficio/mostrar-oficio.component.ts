import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { faCheck, faRepeat } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { HtmlHelper } from '../../../../shared/helpers/html-helper';
import { OficioDocumento } from '../../models/oficio-documento';

@Component({
  selector: 'app-mostrar-oficio',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule],
  templateUrl: './mostrar-oficio.component.html',
  styleUrl: './mostrar-oficio.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class MostrarOficioComponent implements OnInit, OnChanges, OnDestroy {
  private static readonly templateScopeClass = 'oficio-template-scope';

  @Input() documento?: OficioDocumento;
  @Input() masivo?: boolean = false;
  @Input() showCopyButton?: boolean = false;
  @Output() reingresar = new EventEmitter<void>();

  faCheck = faCheck;
  faRepeat = faRepeat;
  copiedOnce = false;
  canReingresar = false;
  rawHtml = '';
  processedHtml = '';
  processedHtmlForDisplay = '';
  processedHtmlSafe: SafeHtml | null = null;
  loading = false;
  error: string | null = null;
  private injectedStyleElements: HTMLStyleElement[] = [];
  private copiedTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadTemplate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['documento'] && !changes['documento'].firstChange) {
      this.loadTemplate();
    }
  }

  ngOnDestroy(): void {
    this.removeInjectedTemplateStyles();
  }

  copyRawText() {
    const contenido = this.processedHtml || this.documento?.textoGenerado || '';
    navigator.clipboard.writeText(contenido).then(() => {
      this.copiedOnce = true;
      this.canReingresar = true;
      if (this.copiedTimeout) clearTimeout(this.copiedTimeout);
      this.copiedTimeout = setTimeout(() => {
        this.copiedOnce = false;
      }, 2000);
      this.toastr.success('El contenido del oficio fue copiado', 'Exito');
    });
  }

  private loadTemplate(): void {
    if (!this.documento) {
      this.rawHtml = '';
      this.processedHtml = '';
      this.processedHtmlForDisplay = '';
      this.processedHtmlSafe = null;
      return;
    }

    this.loading = true;
    this.error = null;

    this.http.get(this.resolveTemplatePath(), { responseType: 'text' }).subscribe({
      next: template => {
        this.rawHtml = template;
        this.applyProcessedHtml(HtmlHelper.replacePlaceholders(this.buildTemplateData(), this.rawHtml));
        this.loading = false;
      },
      error: err => {
        this.error = `No se pudo cargar la plantilla del oficio: ${err?.message || err}`;
        this.loading = false;
      }
    });
  }

  private resolveTemplatePath(): string {
    return 'assets/templates/oficios/oficio-generico.html';
  }

  private buildTemplateData(): Record<string, string> {
    const valores = this.documento?.valores || {};
    const today = new Date();
    const fechaActual = this.formatDateLong(today);
    const normalizedTipoOficio = this.normalize(this.documento?.tipoOficioNombre || '');

    const valueMap = Object.entries(valores).reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = this.escapeHtml(this.stringifyValue(value));
      return acc;
    }, {});

    const pick = (...keys: string[]): string => {
      for (const key of keys) {
        const value = valueMap[key];
        if (value && value.trim()) {
          return value;
        }
      }

      return '';
    };

    const localidad = pick('localidadFecha', 'localidadOficio', 'localidad', 'ciudad');
    const localidadFecha = localidad ? `${localidad}, ${fechaActual}` : fechaActual;
    const destinatarioHtml = this.buildDestinatarioHtml();
    const cuerpoOficioHtml = this.buildCuerpoOficioHtml({
      normalizedTipoOficio,
      pick,
      textoGeneradoHtml: this.buildParagraphs(this.documento?.textoGenerado || '')
    });

    return {
      ...valueMap,
      tipoOficioNombre: this.escapeHtml(this.documento?.tipoOficioNombre || ''),
      categoriaNombre: this.escapeHtml(this.documento?.categoriaNombre || ''),
      organismoDestino: this.escapeHtml(this.documento?.organismoDestino || ''),
      proveido: this.escapeHtml(this.documento?.proveido || ''),
      textoGenerado: this.escapeHtml(this.documento?.textoGenerado || ''),
      textoGeneradoHtml: this.buildParagraphs(this.documento?.textoGenerado || ''),
      cuerpoOficioHtml,
      fechaActual,
      localidadFecha,
      destinatarioHtml,
      caratulaMateria: pick('caratulaMateria', 'caratula', 'caratulaExpediente'),
      fueroNumero: pick('fueroNumero', 'juzgado', 'juzgadoInterviniente', 'juzgadoTribunal'),
      departamento: pick('departamento', 'departamentoJudicial', 'localidad'),
      juezNombre: pick('juezNombre', 'juez', 'drJuez'),
      secretarioNombre: pick('secretarioNombre', 'secretaria', 'secretario', 'drSecretario'),
      direccion: pick('direccion', 'direccionJuzgado', 'domicilio'),
      tipoInscripcion: pick('tipoInscripcion', 'inscripcionTipo', 'tipoRegistro'),
      personaNombre: pick('personaNombre', 'nombrePersona', 'nombreRazonSocial', 'titular'),
      padresNombre: pick('padresNombre', 'nombrePadres'),
      lugarHecho: pick('lugarHecho', 'lugar', 'localidad'),
      fechaHechoCompleta: pick('fechaHechoCompleta', 'fechaCompleta', 'fecha'),
      hechoActoVital: pick('hechoActoVital', 'actoVital'),
      numeroExpediente: pick('numeroExpediente', 'expedienteNumero'),
      juzgado: pick('juzgado', 'juzgadoInterviniente', 'juzgadoTribunal'),
      juzgadoNumero: pick('juzgadoNumero', 'numeroJuzgado'),
      secretaria: pick('secretaria', 'secretarioNombre', 'secretario'),
      autoTexto: pick('autoTexto', 'sentenciaTexto', 'textoGenerado'),
      resultaTexto: pick('resultaTexto'),
      considerandoTexto: pick('considerandoTexto'),
      inhibidoNombre: pick('inhibidoNombre', 'nombreRazonSocial', 'titular', 'personaNombre'),
      inhibidoDocumento: pick('inhibidoDocumento', 'numeroDocumento', 'dni')
    };
  }

  private stringifyValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value);
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private buildParagraphs(text: string): string {
    return this.escapeHtml(text)
      .split(/\n{2,}/)
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
      .join('');
  }

  private buildDestinatarioHtml(): string {
    const organismoDestino = this.normalize(this.documento?.organismoDestino || '');

    if (organismoDestino.includes('registro provincial de las personas')) {
      return [
        '<p>AL SE&Ntilde;OR DIRECTOR</p>',
        '<p>DEL REGISTRO PROVINCIAL DE LAS PERSONAS</p>',
        '<p>DE LA PROVINCIA DE BUENOS AIRES</p>',
        '<p>Su Despacho</p>'
      ].join('');
    }

    return [
      '<p>AL SE&Ntilde;OR/A DIRECTOR/A</p>',
      `<p>${this.escapeHtml(this.documento?.organismoDestino || '')}</p>`,
      '<p>Su Despacho</p>'
    ].join('');
  }

  private buildCuerpoOficioHtml(context: {
    normalizedTipoOficio: string;
    pick: (...keys: string[]) => string;
    textoGeneradoHtml: string;
  }): string {
    const { normalizedTipoOficio, pick, textoGeneradoHtml } = context;

    if (normalizedTipoOficio.includes('busqueda datos') || normalizedTipoOficio.includes('busqueda de datos')) {
      return [
        '<p>Tengo el agrado de dirigirme a Ud. En los autos caratulados ' + this.withFallback(pick('caratulaMateria', 'caratula', 'caratulaExpediente')) + ' en tr&aacute;mite por ante el Juzgado de ' + this.withFallback(pick('fueroNumero', 'juzgado', 'juzgadoInterviniente', 'juzgadoTribunal')) + ' del Departamento Judicial de ' + this.withFallback(pick('departamento', 'departamentoJudicial', 'localidad')) + ' a cargo del/ de la Dr. /Dra. ' + this.withFallback(pick('juezNombre', 'juez', 'drJuez')) + ', Secretaria a cargo del/ de la Dr. /Dra. ' + this.withFallback(pick('secretarioNombre', 'secretaria', 'secretario', 'drSecretario')) + ' con domicilio en ' + this.withFallback(pick('direccion', 'direccionJuzgado', 'domicilio')) + ' a fin de solicitarle tenga a bien informar los datos correspondientes a la inscripci&oacute;n de ' + this.withFallback(pick('tipoInscripcion', 'inscripcionTipo', 'tipoRegistro')) + ' de ' + this.withFallback(pick('personaNombre', 'nombrePersona', 'nombreRazonSocial', 'titular')) + ', hijo de ' + this.withFallback(pick('padresNombre', 'nombrePadres')) + ', nacido en ' + this.withFallback(pick('lugarHecho', 'lugar', 'localidad')) + ' el d&iacute;a ' + this.withFallback(pick('fechaHechoCompleta', 'fechaCompleta', 'fecha')) + ', ' + this.withFallback(pick('hechoActoVital', 'actoVital')) + ' en caso afirmativo acomp&aacute;&ntilde;ese el acta correspondiente o, [en caso contrario s&iacute;rvase expedir el correspondiente informe negativo]</p>'
      ].join('');
    }

    if (normalizedTipoOficio.includes('inhibicion general de bienes')) {
      return [
        '<p>Tengo el agrado de dirigirme a Ud. en los autos caratulados: &ldquo;' + this.withFallback(pick('caratulaMateria', 'caratula', 'caratulaExpediente')) + ' S/ INHIBICI&Oacute;N GENERAL DE BIENES&rdquo; expediente nro. ' + this.withFallback(pick('numeroExpediente', 'expedienteNumero')) + ', que tramitan ante el Juzgado ' + this.withFallback(pick('juzgado', 'juzgadoInterviniente', 'juzgadoTribunal')) + ' Nro. ' + this.withFallback(pick('juzgadoNumero', 'numeroJuzgado')) + ' cargo del Dr. ' + this.withFallback(pick('juezNombre', 'juez', 'drJuez')) + ' Secretaria ' + this.withFallback(pick('secretaria', 'secretarioNombre', 'secretario')) + ' a cargo de ' + this.withFallback(pick('secretarioNombre', 'secretaria', 'secretario', 'drSecretario')) + ' del Departamento Judicial de ' + this.withFallback(pick('departamento', 'departamentoJudicial', 'localidad')) + ', a fin de que se sirva inscribir la sentencia que en lo pertinente se transcribe a continuaci&oacute;n.</p>',
        '<p>El auto que as&iacute; lo ordena dice: &ldquo;' + this.withFallback(pick('autoTexto', 'sentenciaTexto', 'textoGenerado')) + '&rdquo;</p>',
        '<p>AUTOS Y VISTOS: ' + this.withFallback(pick('autosVistos', 'resultaTexto')) + ' RESULTA: ' + this.withFallback(pick('resultaTexto')) + '</p>',
        '<p>CONSIDERANDO: ' + this.withFallback(pick('considerandoTexto')) + ' POR ELLO: RESUELVO: decretar la Inhibici&oacute;n General de Bienes del Sr. / Sra. ' + this.withFallback(pick('inhibidoNombre', 'nombreRazonSocial', 'titular', 'personaNombre')) + '</p>',
        '<p>' + this.withFallback(pick('inhibidoDocumento', 'numeroDocumento', 'dni')) + ' D.N.I. ' + this.withFallback(pick('inhibidoDocumento', 'numeroDocumento', 'dni')) + '. Inscr&iacute;base en el Registro Provincial de las Personas.</p>',
        '<p>Reg&iacute;strese. Notif&iacute;quese. Firmado Dr. ' + this.withFallback(pick('juezNombre', 'juez', 'drJuez')) + '. Juez</p>'
      ].join('');
    }

    return textoGeneradoHtml;
  }

  private withFallback(value: string): string {
    return value && value.trim() ? value : '................................';
  }

  private applyProcessedHtml(html: string): void {
    this.processedHtml = html;
    this.injectTemplateStyles(html);

    const displayHtml = this.stripDocumentWrapper(html);
    const isDarkMode = document.documentElement.classList.contains('dark');

    if (isDarkMode) {
      this.processedHtmlForDisplay = this.applyDarkModeStyles(displayHtml);
    } else {
      this.processedHtmlForDisplay = displayHtml;
    }

    this.processedHtmlSafe = this.sanitizer.bypassSecurityTrustHtml(this.processedHtmlForDisplay);
  }

  private injectTemplateStyles(html: string): void {
    this.removeInjectedTemplateStyles();

    const styleMatches = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];

    styleMatches.forEach(styleTag => {
      const styleElement = document.createElement('style');
      styleElement.setAttribute('data-oficio-template-style', 'true');
      styleElement.textContent = this.scopeTemplateStyles(
        styleTag
          .replace(/<style[^>]*>/i, '')
          .replace(/<\/style>/i, '')
          .trim()
      );

      document.head.appendChild(styleElement);
      this.injectedStyleElements.push(styleElement);
    });
  }

  private removeInjectedTemplateStyles(): void {
    this.injectedStyleElements.forEach(styleElement => styleElement.remove());
    this.injectedStyleElements = [];
  }

  private scopeTemplateStyles(cssText: string): string {
    const scope = `.${MostrarOficioComponent.templateScopeClass}`;

    return cssText.replace(/(^|})\s*([^@}{][^{}]*)\{/g, (match, separator: string, selectorGroup: string) => {
      const scopedSelectors = selectorGroup
        .split(',')
        .map(selector => selector.trim())
        .filter(Boolean)
        .map(selector => {
          if (selector === 'body' || selector === 'html' || selector === ':root') {
            return scope;
          }

          if (selector.startsWith(scope)) {
            return selector;
          }

          return `${scope} ${selector}`;
        })
        .join(', ');

      return `${separator} ${scopedSelectors} {`;
    });
  }

  private stripDocumentWrapper(html: string): string {
    let cleaned = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

    if (bodyMatch) {
      cleaned = bodyMatch[1];
    }

    return cleaned.trim();
  }

  private applyDarkModeStyles(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;

    const allElements = div.querySelectorAll('*');
    allElements.forEach((element: Element) => {
      const htmlElement = element as HTMLElement;
      const tagName = htmlElement.tagName.toLowerCase();

      if (tagName === 'p' || tagName === 'span' || tagName === 'div' || tagName === 'td' || tagName === 'th' || tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || tagName === 'h4' || tagName === 'strong' || tagName === 'b') {
        const currentStyle = htmlElement.getAttribute('style') || '';
        htmlElement.setAttribute('style', `${currentStyle}; color: #ffffff !important;`);
      }

      if (tagName === 'td' || tagName === 'th' || tagName === 'table') {
        const currentStyle = htmlElement.getAttribute('style') || '';
        htmlElement.setAttribute('style', `${currentStyle}; border-color: #ffffff !important;`);
      }
    });

    return div.innerHTML;
  }

  private formatDateLong(date: Date): string {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  onReingresar() {
    this.reingresar.emit();
  }
}
