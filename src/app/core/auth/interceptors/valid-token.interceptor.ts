import {
    HttpRequest,
    HttpEvent,
    HttpErrorResponse,
    HttpHandlerFn
} from '@angular/common/http';
import { inject } from '@angular/core';

import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../service/auth.service';
import { ToastrService } from 'ngx-toastr';


export function validTokenInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    const authenticationService = inject(AuthService);
    const toastrService = inject(ToastrService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            const isAuthRequest = req.url.includes('v1/auth/');

            if (error.status === 401 && !isAuthRequest) {
                toastrService.error('Por favor, volvé a iniciar sesión.', 'Tu sesión ha caducado');
                authenticationService.logout();

                return of();
            }

            return throwError(() => error);
        })
    );
}
