import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProcesarOficioCommand } from './commands/procesar-oficio-command';
import { OficioProcesadoResponse } from './contracts/oficio-procesado-response';

@Injectable({
  providedIn: 'root'
})
export class OficioService {
  public constructor(private http: HttpClient) {}

  protected basePath: string = environment.basePath;
  protected controller = 'v1/oficio';

  public procesar(command: ProcesarOficioCommand): Observable<OficioProcesadoResponse> {
    const url = `${this.basePath}${this.controller}/procesar`;

    return this.http.post<OficioProcesadoResponse>(url, command);
  }

  public procesarOficioAsync(command: ProcesarOficioCommand): Promise<OficioProcesadoResponse> {
    return firstValueFrom(this.procesar(command));
  }
}
