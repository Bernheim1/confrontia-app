import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, catchError, map, of, take, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../models/user';
import { CoreConfigService } from '../../services/config.service';


const TOKEN_KEY = `${environment.sessionName}_TOKEN`;
const AUTH_SERVER_ADDRESS = `${environment.basePath}v1/auth`;
const CHANNEL_NAME = `${environment.sessionName}_CHANNEL`;

@Injectable({ providedIn: 'root' })
export class AuthService {

    private readonly currentUserSubject$ = new BehaviorSubject(undefined as User | undefined);
    private readonly authenticatedSubject$ = new BehaviorSubject(undefined as boolean | undefined);
    private _token: string | undefined;
    private _broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    private _user: User | undefined;

    public constructor(
        private _router: Router,
        private _helper: JwtHelperService,
        private _coreConfigService: CoreConfigService,
        private _httpClient: HttpClient
    ) {
        // disable console logs in production
        if (!environment.debug) {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            console.log = (): void => { };
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            window.console.log = (): void => { };
        }

        this._broadcastChannel.addEventListener('message', (event) => {
            if (event.data.action === 'token_removed') {
                this.logout();
            } else if (event.data.action === 'token_updated') {
                this._token = event.data.token;
                this.loadUserFromToken(this._token ?? '');
                this.authenticatedSubject$.next(true);
            }
        });
    }


    public readonly currentUser$: Observable<User | undefined> = this.currentUserSubject$.asObservable();
    public readonly authenticated$: Observable<boolean | undefined> = this.authenticatedSubject$.asObservable();

    public init(): void {
        if (AuthService.getStoredAccessToken()) {
            this._token = AuthService.getStoredAccessToken() ?? undefined;

            if(this._token) {
                this.loadUserFromToken(this._token);
                this.switchLayout(true);
                this.authenticatedSubject$.next(true);
            }
        }
        else { this.logout(); }
    }

    public getAuthorizationHeader(): string {
        return `Bearer ${this._token}`;
    }

    public login(username: string, password: string): Observable<{ success: boolean; requiresCode: boolean }> {
        const request = {
            username,
            password
        };

        return this._httpClient
            .post(`${AUTH_SERVER_ADDRESS}/login`, request, { withCredentials: true })
            .pipe(
                map((res: any) => {
                    this._token = res.accessToken;
                    this.loadUserFromToken(res.accessToken);

                    this.storeAccessToken(res.accessToken);
                    this.authenticatedSubject$.next(true);

                    return { success: true, requiresCode: false };
                }),
                catchError((e) => {
                    console.log(
                        `💥 Login error: ${e.error?.detail}`
                    );

                    return of({ success: false, requiresCode: false });
                })
            );
    }


    public logout(): void {
        AuthService.clearLocalStorageTokens();
        this.authenticatedSubject$.next(false);
        this.currentUserSubject$.next(undefined);
        this.switchLayout(false);
        this._router.navigate(['/login']).then(
            () => {}
        );
    }

    private loadUserFromToken(jwt: string): void {
        const decoded: any = this._helper.decodeToken(jwt);

        this._user = {
            id: decoded?.userId,
            username: decoded?.unique_name,
            fullName: decoded?.name,
            email: decoded?.email,
            perfil: decoded?.perfil 
        };

        this.currentUserSubject$.next(this._user);
        console.log('🔑 User loaded: ', this._user);
    }

    private switchLayout(show: boolean): void {
        this._coreConfigService.getConfig().pipe(take(1)).subscribe((res: any) => {
            res.layout.menu.hidden = !show;
            res.layout.navbar.hidden = !show;
            this._coreConfigService.setConfig(res);
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    private storeAccessToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
        this._broadcastChannel.postMessage({ action: 'token_updated', token });
    }

    private static getStoredAccessToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    private static clearLocalStorageTokens(): void {
        localStorage.removeItem(TOKEN_KEY);
    }
}