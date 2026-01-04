import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { environment } from '../environments/environment';
import { AuthService } from './core/auth/service/auth.service';

export function initApp(authConfigService: AuthService): () => void {
    return () => authConfigService.init();
}

export function tokenGetter() {
  return localStorage.getItem('access_token'); 
}

export const appConfig: ApplicationConfig = {
  providers: 
  [ 
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideHttpClient(),
    importProvidersFrom([
      JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: environment.basePath
        }
      })
    ]),
    {
        provide: APP_INITIALIZER,
        useFactory: initApp,
        deps: [AuthService],
        multi: true
    }
    
  ]
};
