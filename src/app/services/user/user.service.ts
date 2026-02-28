import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { ChangePasswordCommand } from "./commands/change-password-command";
import { PagedResult } from "../../../shared/models/paged-result";
import { UserDto } from "./contracts/user-dto";
import { UpdateUsuarioCommand } from "./commands/update-usuario-command";
import { CreateUsuarioCommand } from "./commands/create-usuario-command";

@Injectable({
  providedIn: 'root'
})
export class UserService {
    public constructor(private http: HttpClient) { }

    protected basePath: string = environment.basePath;
    protected controller = 'v1/user';

    public changePassword(userId: string, command: ChangePasswordCommand): Observable<void> {
      const url = `${this.basePath}${this.controller}/${userId}/change-password`;

      return this.http.put<void>(url, command);
    }

    public update(userId: string, command: UpdateUsuarioCommand): Observable<void> {
      const url = `${this.basePath}${this.controller}/${userId}`;

      return this.http.put<void>(url, command);
    }

    public create(command: CreateUsuarioCommand): Observable<void> {
      const url = `${this.basePath}${this.controller}`;

      return this.http.post<void>(url, command);
    }

    public getById(userId: string): Observable<UserDto> {
      const url = `${this.basePath}${this.controller}/${userId}`;

      return this.http.get<UserDto>(url);
    }

    public getUsuarios(offset: number = 0, limit: number = 10, username: string | undefined = undefined): Observable<PagedResult<UserDto>> {
        const url = `${this.basePath}${this.controller}/grilla`;

        var params = new HttpParams()
            .set('offset', offset.toString())
            .set('limit', limit.toString());

        if(username)
          params = params.set('username', username);

        return this.http.get<PagedResult<UserDto>>(url, { params });
    }
}