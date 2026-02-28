import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { Perfiles } from '../../../services/user/contracts/perfiles-enum';

@Injectable({
  providedIn: 'root'
})
export class RolesGuard implements CanActivate {

  private _defaultRedirectionRoute = '';
  private _userProfile: Perfiles | undefined = undefined;

  public constructor(
    private readonly _router: Router,
    private readonly _authService: AuthService
  ) { this.getCurrentUserData(); }

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    if (!('allowedProfiles' in route.data) || ('allowedProfiles' in route.data && route.data['allowedProfiles'].includes(this._userProfile))) {

      return true;
    }

      console.log('No tienes permisos para acceder a esta ruta. Redirigiendo a la ruta por defecto...');
      this._router.navigate([`${this._defaultRedirectionRoute}`]);

      return false;

  }

  private getCurrentUserData(): void {
    this._authService.currentUser$.subscribe((res) => {
      if (res) {
        this._userProfile = res.perfil as Perfiles ;
      }
    });
  }
}
