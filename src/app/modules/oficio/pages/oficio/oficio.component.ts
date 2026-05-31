import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faRepeat } from '@fortawesome/free-solid-svg-icons';
import { TipoStepEnum } from '../../../../shared/enums/tipo-step-enum';
import { CasoService } from '../../../../services/caso/caso.service';
import { CasoDto } from '../../../../shared/models/caso-dto';
import { IngresoOficioComponent } from '../../components/ingreso-oficio/ingreso-oficio.component';
import { OficioTypeConfig } from '../../models/oficio-catalog';
import { OficioDocumento } from '../../models/oficio-documento';
import { MostrarOficioComponent } from '../../components/mostrar-oficio/mostrar-oficio.component';
import { SeleccionOficioComponent } from '../../components/seleccion-oficio/seleccion-oficio.component';

@Component({
  selector: 'app-oficio',
  templateUrl: './oficio.component.html',
  styleUrl: './oficio.component.scss'
})
export class OficioComponent implements OnInit {
  faRepeat = faRepeat;
  step: TipoStepEnum = TipoStepEnum.Inicio;
  oficios: Array<{ proveido: string }> = [];
  tipoOficio?: OficioTypeConfig;
  documentos: OficioDocumento[] = [];
  documentosRecolectados: Map<number, OficioDocumento> = new Map();
  formulariosValidos: Set<number> = new Set();
  casoId?: string;
  caso?: CasoDto;
  cargandoCaso = false;

  @ViewChildren(SeleccionOficioComponent) seleccionComponents!: QueryList<SeleccionOficioComponent>;

  constructor(
    private route: ActivatedRoute,
    private casoService: CasoService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const casoId = params.get('casoId');
      this.casoId = casoId || undefined;

      if (this.casoId) {
        this.cargarCaso(this.casoId);
      } else {
        this.caso = undefined;
      }
    });
  }

  private cargarCaso(casoId: string): void {
    this.cargandoCaso = true;
    this.casoService.getCasoById(casoId).subscribe({
      next: caso => {
        this.caso = caso;
        this.cargandoCaso = false;
      },
      error: () => {
        this.caso = undefined;
        this.cargandoCaso = false;
      }
    });
  }

  onOficioConfigurado(event: { proveidos: Array<{ proveido: string }>; tipoOficio: OficioTypeConfig }) {
    if (event.proveidos.length > 0) {
      this.oficios = event.proveidos;
      this.tipoOficio = event.tipoOficio;
      this.step = TipoStepEnum.SeleccionSalida;
    }
  }

  onOficioSeleccionado(event: { documento: OficioDocumento; index: number }) {
    this.documentosRecolectados.set(event.index, event.documento);

    if (this.documentosRecolectados.size === this.oficios.length) {
      this.documentos = Array.from({ length: this.oficios.length }, (_, index) => this.documentosRecolectados.get(index)!);
      this.step = TipoStepEnum.MostrarSalida;
    }
  }

  generarTodos() {
    this.documentosRecolectados.clear();
    this.documentos = [];

    this.seleccionComponents.forEach((component, index) => {
      component.submitFromParent(index);
    });
  }

  onFormularioCompletado(event: { index: number; valido: boolean }) {
    if (event.valido) {
      this.formulariosValidos.add(event.index);
    } else {
      this.formulariosValidos.delete(event.index);
    }
  }

  onReingresar() {
    this.step = TipoStepEnum.Inicio;
    this.oficios = [];
    this.tipoOficio = undefined;
    this.documentos = [];
    this.documentosRecolectados.clear();
    this.formulariosValidos.clear();
  }
}
