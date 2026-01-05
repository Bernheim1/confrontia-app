import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { ChangePasswordCommand } from "./commands/change-password-command";

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
}