import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, shareReplay } from "rxjs";
import { environment } from "../../../environments/environment";
import { MevFiltrosResponse } from "./contracts/mev-filtros-response";

@Injectable({
  providedIn: 'root'
})
export class MevService {
  private basePath: string = environment.basePath;
  private controller = 'v1/mev';

  private filtrosCache$: Observable<MevFiltrosResponse> | null = null;

  constructor(private http: HttpClient) {}

  public getFiltros(): Observable<MevFiltrosResponse> {
    if (!this.filtrosCache$) {
      const url = `${this.basePath}${this.controller}/filtros`;
      this.filtrosCache$ = this.http.get<MevFiltrosResponse>(url).pipe(
        shareReplay(1)
      );
    }
    return this.filtrosCache$;
  }

  public invalidarCache(): void {
    this.filtrosCache$ = null;
  }
}
