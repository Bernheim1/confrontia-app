import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { CreateCasoCommand } from "./commands/create-caso-command";
import { CasoListDto } from "../../shared/models/caso-list-dto";
import { PagedResult } from "../../shared/models/paged-result";
import { CasoDto } from "../../shared/models/caso-dto";
import { SincronizarMevCasoResponse, SincronizarMevMasivoResponse } from "./contracts/sincronizar-mev-response";
import { MevBusquedaCommand } from "../mev/commands/mev-busqueda-command";
import { GetGrillaCasosQuery } from "./queries/get-grilla-casos-query";
import { QueryStringHelper } from "../../shared/helpers/query-string.helper";

@Injectable({
  providedIn: 'root'
})
export class CasoService {
    public constructor(private http: HttpClient) { }

    protected basePath: string = environment.basePath;
    protected controller = 'v1/caso';

    public create(command: CreateCasoCommand): Observable<string[]> {
        const url = `${this.basePath}${this.controller}`;

        return this.http.post<string[]>(url, command);
    }

    // Método para obtener la lista paginada de casos
    public getCasos(request: GetGrillaCasosQuery): Observable<PagedResult<CasoListDto>> {
        const url = `${this.basePath}${this.controller}`;

        const queryString = QueryStringHelper.getFromObject(request);

        return this.http.get<PagedResult<CasoListDto>>(`${url}${queryString}`);
    }

    // Método para obtener un caso por ID
    public getCasoById(id: string): Observable<CasoDto> {
        const url = `${this.basePath}${this.controller}/${id}`;

        return this.http.get<CasoDto>(url);
    }

    // Sincronizar un caso puntual con MEV
    public sincronizarMevCaso(casoId: string): Observable<SincronizarMevCasoResponse> {
        const url = `${this.basePath}${this.controller}/${casoId}/sincronizar-mev`;

        return this.http.post<SincronizarMevCasoResponse>(url, null);
    }

    // Búsqueda masiva de notificaciones MEV
    public sincronizarMevMasivo(command: MevBusquedaCommand = {}): Observable<SincronizarMevMasivoResponse> {
        const url = `${this.basePath}${this.controller}/sincronizar-mev`;

        return this.http.post<SincronizarMevMasivoResponse>(url, command);
    }
}
