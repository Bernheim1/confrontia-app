import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef } from '../../services/modal/dialog-ref';
import { DIALOG_DATA } from '../../services/modal/dialog-token';
import { MostrarSalidaComponent } from '../../../modules/despacho/components/mostrar-salida/mostrar-salida.component';
import { Salida } from '../../models/salida';
import { TipoSalidaEnum } from '../../enums/tipo-salida-enum';

export interface SalidaModalData {
  salida: Salida;
  tipoSalida: TipoSalidaEnum;
}

@Component({
  selector: 'app-salida-modal',
  standalone: true,
  imports: [CommonModule, MostrarSalidaComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[90vw] max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
      <div class="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white">
          {{ data.tipoSalida === 1 ? 'Cédula' : 'Mandamiento' }} enviado
        </h3>
        <button (click)="close()" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-4">
        <app-mostrar-salida
          [tipoSalida]="data.tipoSalida"
          [salida]="data.salida"
          [showCopyButton]="true">
        </app-mostrar-salida>
      </div>
    </div>
  `
})
export class SalidaModalComponent {
  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: SalidaModalData
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
