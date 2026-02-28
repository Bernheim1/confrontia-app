import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DropdownItem } from "../../../shared/models/dropdown-item";

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
}