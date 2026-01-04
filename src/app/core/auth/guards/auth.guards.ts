import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable, of, switchMap, take } from 'rxjs';
import { AuthService } from '../service/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    public constructor(
        private _authenticationService: AuthService
    ) { }

    public canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        return this._authenticationService.authenticated$.pipe(take(1)).pipe(
            switchMap((authenticated) => {
                if (!authenticated) {
                    console.log('No autenticado. Redirigiendo a login...');
                    this._authenticationService.logout();

                    return of(false);
                }

                // this.switchLayout(true);

                return of(true);
            })
        );
    }

    // private switchLayout(show: boolean): void {
    //     this._coreConfigService.getConfig().pipe(take(1)).subscribe((res) => {
    //         res.layout.menu.hidden = !show;
    //         res.layout.navbar.hidden = !show;
    //         this._coreConfigService.setConfig(res);
    //     });
    // }
}