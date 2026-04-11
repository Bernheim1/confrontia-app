import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { PathEscritos } from '../../../../../assets/templates/escritos/path-escritos';
import { CasoDto } from '../../../../shared/models/caso-dto';
import { HtmlHelper } from '../../../../shared/helpers/html-helper';
import { DataEscritosDto, FirmaAbogadoDto } from '../../../../services/estudio/contracts/firma-abogado-dto';
import { categoriaFiscalCollection } from '../../../../services/estudio/contracts/categorias-ficales-dto';
import { ToastrService } from 'ngx-toastr';
import { DialogService } from '../../../../shared/services/modal/modal.service';
import { HtmlViewerComponent } from '../../../../shared/components/html-viewer/html-viewer.component';
import { SalidaModalComponent } from '../../../../shared/components/salida-modal/salida-modal.component';
import { Salida } from '../../../../shared/models/salida';
import { TipoSalidaEnum } from '../../../../shared/enums/tipo-salida-enum';
import { DataEscritosConfigDialogComponent } from '../data-escritos-config-dialog/data-escritos-config-dialog.component';

@Component({
  selector: 'app-show-escritos',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './show-escritos.component.html',
  styleUrl: './show-escritos.component.scss'
})
export class ShowEscritosComponent {

  @Input() caso: CasoDto | undefined;
  @Input() firma: FirmaAbogadoDto | undefined;
  @Input() salida: Salida | undefined;
  @Input() tipoSalida: TipoSalidaEnum = TipoSalidaEnum.SinAsignar;
  
  constructor(private http: HttpClient, private toastr: ToastrService, private dialogService: DialogService) {}

  faDownload = faDownload;
  pathEscritos = PathEscritos;

  verSalidaEnviada(): void {
    if (!this.salida) return;
    this.dialogService.open(SalidaModalComponent, {
      data: { salida: this.salida, tipoSalida: this.tipoSalida }
    });
  }
  
  public getEscrito(path: string) {
    const recordObject = this.getEscritoDto();
    const ref = this.dialogService.open(DataEscritosConfigDialogComponent, { data: recordObject});

    (ref.componentInstance as DataEscritosConfigDialogComponent | undefined)
      ?.generarEvent
      .subscribe((escritoData: Record<string, string>) => {
        this.showEscrito(path, escritoData);
        ref.close();
      });
  }

  private showEscrito(path: string, escritoData: Record<string, string>): void {
    this.http.get(path, { responseType: 'text' }).subscribe({
      next: (html) => {
        const categoria = categoriaFiscalCollection.find(c => c.id === +escritoData?.['categoriaFiscal'])?.description;

        const updatedEscritoData = { ...escritoData, categoriaFiscal: categoria };

        const result = HtmlHelper.replacePlaceholders(updatedEscritoData, html);
        this.dialogService.open(HtmlViewerComponent, { data: result });
      },
      error: () => {
        this.toastr.error('No fue posible generar el escrito.', 'Error');
      }
    });
  }

  private getEscritoDto(): DataEscritosDto {
    const escrito: DataEscritosDto = {
      id: this.firma?.id,
      nombre: this.firma?.nombre ?? '',
      cuit: this.firma?.cuit ?? '',
      categoriaFiscal: this.firma?.categoriaFiscal,
      cuil: this.firma?.cuil ?? '',
      domicilio: this.firma?.domicilio ?? '',
      domicilioElectronico: this.firma?.domicilioElectronico ?? '',
      parteRepresentada: this.caso.caratulaExpediente,
      nombreExpediente: this.caso?.caratulaExpediente ?? '',
      nroLegajo: this.firma?.nroLegajo ?? '',
      nroCajaPrevisoria: this.firma?.nroCajaPrevisoria ?? ''
    }

    return escrito;
  }
}


export interface escritosDto {
  nombreAbogado: string;
  cuit: string;
  categoriaFiscal: string;
  cuil: string;
  domicilioAbogado: string;
  domicilioElectronicoAbogado: string;
  parteRepresentada: string;
  nombreExpediente: string;
}
