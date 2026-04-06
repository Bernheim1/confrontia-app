import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { PathEscritos } from '../../../../../assets/templates/escritos/path-escritos';
import { CasoDto } from '../../../../shared/models/caso-dto';
import { HtmlHelper } from '../../../../shared/helpers/html-helper';
import { FirmaAbogadoDto } from '../../../../services/estudio/contracts/firma-abogado-dto';
import { categoriaFiscalCollection } from '../../../../services/estudio/contracts/categorias-ficales-dto';
import { ToastrService } from 'ngx-toastr';
import { DialogService } from '../../../../shared/services/modal/modal.service';
import { HtmlViewerComponent } from '../../../../shared/components/html-viewer/html-viewer.component';
import { SalidaModalComponent } from '../../../../shared/components/salida-modal/salida-modal.component';
import { Salida } from '../../../../shared/models/salida';
import { TipoSalidaEnum } from '../../../../shared/enums/tipo-salida-enum';

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
    this.http.get(path, { responseType: 'text' }).subscribe({
      next: (html) => {
        const recordObject = this.getEscritoDto();

        var result = HtmlHelper.replacePlaceholders(recordObject, html);

        const ref = this.dialogService.open(HtmlViewerComponent, { data: result});
      },
      error: (err) => {
        
      }
    });
  }

  private getEscritoDto(): Record<string, string> {
    const categoria = categoriaFiscalCollection.find(c => c.id === this.firma?.categoriaFiscal)?.description;

    const escrito: Record<string, string> = {
      nombreAbogado: this.firma?.nombre ?? '',
      cuit: this.firma?.cuit ?? '',
      categoriaFiscal: categoria ?? '',
      cuil: this.firma?.cuil ?? '',
      domicilioAbogado: this.firma?.domicilio ?? '',
      domicilioElectronicoAbogado: this.firma?.domicilioElectronico ?? '',
      parteRepresentada: 'parteRepresentada',
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
