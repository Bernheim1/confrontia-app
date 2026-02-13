import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { CreateCasoCommand } from "./commands/create-caso-command";

@Injectable({
  providedIn: 'root'
})
export class CasoService {
    public constructor(private http: HttpClient) { }

    protected basePath: string = environment.basePath;
    protected controller = 'v1/caso';

    public create(command: CreateCasoCommand): Observable<void> {
        const url = `${this.basePath}${this.controller}`;

        return this.http.post<void>(url, command);
    }
}