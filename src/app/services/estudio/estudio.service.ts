import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { DropdownItem } from "../../shared/models/dropdown-item";
import { EstudioDto } from "./contracts/estudio-dto";
import { CreateEstudioCommand } from "./commands/create-estudio-command";
import { UpdateEstudioCommand } from "./commands/update-estudio-command";
import { ConfigurarMevEstudioCommand } from "./commands/configurar-mev-estudio-command";
import { MevConfigDto } from "../user/contracts/mev-config-dto";
import { UpdateFirmaAbogadoCommand } from "./commands/update-firma-abogado-command";
import { FirmaAbogadoDto } from "./contracts/firma-abogado-dto";
import { PagedResult } from "../../shared/models/paged-result";

@Injectable({
  providedIn: 'root'
})
export class EstudioService {
    public constructor(private http: HttpClient) { }

    protected basePath: string = environment.basePath;
    protected controller = 'v1/estudio';

    public getDropdown(): Observable<DropdownItem[]> {
      const url = `${this.basePath}${this.controller}/dropdown`;

      return this.http.get<DropdownItem[]>(url);
    }

    public create(command: CreateEstudioCommand): Observable<string> {
      const url = `${this.basePath}${this.controller}`;

      return this.http.post<string>(url, command);
    }

    public update(estudioId: string, command: UpdateEstudioCommand): Observable<void> {
      const url = `${this.basePath}${this.controller}/${estudioId}`;

      return this.http.put<void>(url, command);
    }

    public getById(estudioId: string): Observable<EstudioDto> {
      const url = `${this.basePath}${this.controller}/${estudioId}`;

      return this.http.get<EstudioDto>(url);
    }

    public getAll(offset: number = 0, limit: number = 10, nombre: string = ''): Observable<PagedResult<EstudioDto>> {
      const url = `${this.basePath}${this.controller}`;

      const params = new HttpParams()
                  .set('offset', offset.toString())
                  .set('nombre', nombre)
                  .set('limit', limit.toString());
                  
      return this.http.get<PagedResult<EstudioDto>>(url, { params });
    }

    public updateFirmaAbogado(estudioId: string, command: UpdateFirmaAbogadoCommand): Observable<void> {
      const url = `${this.basePath}${this.controller}/${estudioId}/firma`;
      return this.http.put<void>(url, command);
    }

    public getFirmaAbogado(estudioId: string): Observable<FirmaAbogadoDto | undefined> {
      const url = `${this.basePath}${this.controller}/${estudioId}/firma`;
      return this.http.get<FirmaAbogadoDto | undefined>(url);
    }

    public configurarMev(estudioId: string, command: ConfigurarMevEstudioCommand): Observable<void> {
      const url = `${this.basePath}${this.controller}/${estudioId}/mev`;
      return this.http.put<void>(url, command);
    }

    public getMev(estudioId: string): Observable<MevConfigDto | null> {
      const url = `${this.basePath}${this.controller}/${estudioId}/mev`;
      return this.http.get<MevConfigDto | null>(url);
    }

    public eliminarMev(estudioId: string): Observable<void> {
      const url = `${this.basePath}${this.controller}/${estudioId}/mev`;
      return this.http.delete<void>(url);
    }
}