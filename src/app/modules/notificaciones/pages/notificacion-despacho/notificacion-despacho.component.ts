import { Component, ViewChild, ViewChildren, QueryList, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRepeat, faArrowLeft, faCopy } from '@fortawesome/free-solid-svg-icons';
import { SeleccionSalidaComponent } from '../../../despacho/components/seleccion-salida/seleccion-salida.component';
import { MostrarSalidaComponent } from '../../../despacho/components/mostrar-salida/mostrar-salida.component';
import { MevNotificacionBusquedaDto } from '../../../../services/caso/contracts/sincronizar-mev-response';
import { TipoStepEnum } from '../../../../shared/enums/tipo-step-enum';
import { TipoSalidaEnum } from '../../../../shared/enums/tipo-salida-enum';
import { Salida } from '../../../../shared/models/salida';
import { detectarTipoSalida } from '../../../../shared/helpers/tipo-salida-detector';

@Component({
  selector: 'app-notificacion-despacho',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, SeleccionSalidaComponent, MostrarSalidaComponent],
  templateUrl: './notificacion-despacho.component.html',
  styleUrls: ['./notificacion-despacho.component.scss']
})
export class NotificacionDespachoComponent implements OnInit {
  faRepeat = faRepeat;
  faArrowLeft = faArrowLeft;
  faCopy = faCopy;
  copiedOnce = false;

  notificacion!: MevNotificacionBusquedaDto;
  step: TipoStepEnum = TipoStepEnum.SeleccionSalida;
  tipoSalida: TipoSalidaEnum = TipoSalidaEnum.SinAsignar;
  subtipoSalida: any;
  salida: Salida[] = [];
  salidasRecolectadas: Map<number, Salida> = new Map();
  formulariosValidos: Set<number> = new Set();

  @ViewChildren(SeleccionSalidaComponent) seleccionComponents!: QueryList<SeleccionSalidaComponent>;
  @ViewChild(MostrarSalidaComponent) mostrarSalidaComponent?: MostrarSalidaComponent;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state || history.state;

    if (!state?.notificacion) {
      this.router.navigate(['/notificaciones']);
      return;
    }

    this.notificacion = state.notificacion;
    const texto = this.notificacion.texto || '';
    const detectado = detectarTipoSalida(texto);
    this.tipoSalida = detectado.tipoSalida;
    this.subtipoSalida = detectado.subtipoSalida;
  }

  onSalidaSeleccionada(event: { salida: Salida; index: number }): void {
    this.salidasRecolectadas.set(event.index, event.salida);

    if (this.salidasRecolectadas.size === 1) {
      this.salida = [this.salidasRecolectadas.get(0)!];
      this.step = TipoStepEnum.MostrarSalida;
    }
  }

  onFormularioCompletado(event: { index: number; valido: boolean }): void {
    if (event.valido) {
      this.formulariosValidos.add(event.index);
    } else {
      this.formulariosValidos.delete(event.index);
    }
  }

  generarSalida(): void {
    this.salidasRecolectadas.clear();
    this.salida = [];

    this.seleccionComponents.forEach((component, index) => {
      component.submitFromParent(index);
    });
  }

  reiniciar(): void {
    this.step = TipoStepEnum.SeleccionSalida;
    this.salida = [];
    this.salidasRecolectadas.clear();
    this.formulariosValidos.clear();
    this.copiedOnce = false;
  }

  copiarSalida(): void {
    this.mostrarSalidaComponent?.copyRawHtml();
    this.copiedOnce = true;
  }

  volver(): void {
    this.router.navigate(['/notificaciones']);
  }
}
