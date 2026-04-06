import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { NotificacionListDto } from "../../shared/models/notificacion-list-dto";
import { CasoNotificacionDto } from "../../shared/models/notificacion-caso-dto";
import { PagedResult } from "../../shared/models/paged-result";

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  public constructor(private http: HttpClient) { }

  protected basePath: string = environment.basePath;
  protected controller = 'v1/notificacion';

  public getNotificaciones(offset: number = 0, limit: number = 10): Observable<PagedResult<NotificacionListDto>> {
    const url = `${this.basePath}${this.controller}`;

    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    return this.http.get<PagedResult<NotificacionListDto>>(url, { params });
  }

  public getNotificacionesByCaso(casoId: string): Observable<CasoNotificacionDto[]> {
    const url = `${this.basePath}${this.controller}/caso/${casoId}`;

    return this.http.get<CasoNotificacionDto[]>(url);
  }
}
