import { HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';

export function jwtInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authenticationService = inject(AuthService);
  const url = req.url;
  let request;

  request = req.clone({
    url,
    setHeaders: {
      authorization: authenticationService.getAuthorizationHeader()
    }
  });

  return next(request);
}