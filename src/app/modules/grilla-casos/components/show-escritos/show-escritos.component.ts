import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { PathEscritos } from '../../../../../assets/templates/escritos/path-escritos';
import { CasoDto } from '../../../../shared/models/caso-dto';
import { HtmlHelper } from '../../../../shared/helpers/html-helper';
import { FirmaAbogadoDto } from '../../../../services/estudio/contracts/firma-abogado-dto';
import { categoriaFiscalCollection } from '../../../../services/estudio/contracts/categorias-ficales-dto';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-show-escritos',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './show-escritos.component.html',
  styleUrl: './show-escritos.component.scss'
})
export class ShowEscritosComponent {

  @Input() caso: CasoDto | undefined;
  @Input() firma: FirmaAbogadoDto | undefined;
  
  constructor(private http: HttpClient, private toastr: ToastrService) {}

  faDownload = faDownload;
  pathEscritos = PathEscritos;
  
  public getEscrito(path: string) {
    this.http.get(path, { responseType: 'text' }).subscribe({
      next: (html) => {
        const recordObject = this.getEscritoDto();

        var result = HtmlHelper.replacePlaceholders(recordObject, html);

        this.copyToClipboard(result);
      },
      error: (err) => {
        
      }
    });
  }

  public copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
        const message = `El escrito fue copiado correctamente`
        this.toastr.success(message, 'Exito');
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
