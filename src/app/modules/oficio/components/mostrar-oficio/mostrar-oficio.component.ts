import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faRepeat } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { OficioDocumento } from '../../models/oficio-documento';

@Component({
  selector: 'app-mostrar-oficio',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule],
  templateUrl: './mostrar-oficio.component.html',
  styleUrl: './mostrar-oficio.component.scss'
})
export class MostrarOficioComponent {
  @Input() documento?: OficioDocumento;
  @Input() masivo?: boolean = false;
  @Input() showCopyButton?: boolean = false;

  faCheck = faCheck;
  faRepeat = faRepeat;
  copiedOnce = false;
  canReingresar = false;
  private copiedTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor(private toastr: ToastrService) {}

  copyRawText() {
    const texto = this.documento?.textoGenerado || '';
    navigator.clipboard.writeText(texto).then(() => {
      this.copiedOnce = true;
      this.canReingresar = true;
      if (this.copiedTimeout) clearTimeout(this.copiedTimeout);
      this.copiedTimeout = setTimeout(() => {
        this.copiedOnce = false;
      }, 2000);
      this.toastr.success('El contenido del oficio fue copiado', 'Exito');
    });
  }

  onReingresar() {
    window.location.reload();
  }
}
