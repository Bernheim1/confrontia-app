import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { environment } from '../environments/environment';
import { AuthService } from './core/auth/service/auth.service';
import { CoreConfig } from './core/types';
import { CORE_CUSTOM_CONFIG } from './core/services/config.service';
import { jwtInterceptor } from './core/auth/interceptors/jwt.interceptor';

export function initApp(authConfigService: AuthService): () => void {
    return () => authConfigService.init();
}

export function tokenGetter() {
  return localStorage.getItem('access_token'); 
}

export const coreConfig: CoreConfig = {
    app: {
        appName: 'assets/images/logo/logo2.png',                                        // app Name
        appTitle: 'Claims Services | 24Siete', // app Title
        appLogoImage: 'assets/images/logo/logo1.png',                  // app Logo
        appLanguage: 'es'                                           // app Default Language (en, fr, de, pt etc..)
    },
    layout: {
        skin: 'default',                        // default, dark, bordered, semi-dark
        type: 'vertical',                       // vertical, horizontal
        animation: 'fadeIn',                     // fadeInLeft, zoomIn , fadeIn, none
        menu: {
            hidden: false,           // boolean: true, false
            collapsed: false           // boolean: true, false
        },
        // ? For horizontal menu, navbar type will work for navMenu type
        navbar: {
            hidden: false,           // boolean: true, false
            type: 'fixed-top',  // navbar-static-top, fixed-top, floating-nav, d-none
            background: 'navbar-dark',  // navbar-light. navbar-dark
            customBackgroundColor: true,            // boolean: true, false
            backgroundColor: 'bg-primary'               // bS color i.e bg-primary, bg-success
        },
        footer: {
            hidden: false,           // boolean: true, false
            type: 'footer-static', // footer-static, footer-sticky, d-none
            background: 'footer-light',  // footer-light. footer-dark
            customBackgroundColor: false,           // boolean: true, false
            backgroundColor: ''               // bS color i.e bg-primary, bg-success
        },
        enableLocalStorage: true,
        customizer: false,                       // boolean: true, false (Enable theme customizer)
        scrollTop: true,                       // boolean: true, false (Enable scroll to top button)
        buyNow: false                        // boolean: true, false (Set false in real project, For demo purpose only)
    }
};


export const appConfig: ApplicationConfig = {
  providers: 
  [ 
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideHttpClient(withInterceptors([jwtInterceptor])),
    importProvidersFrom([
      JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: [new URL(environment.basePath).host]
        }
      })
    ]),
    {
        provide: APP_INITIALIZER,
        useFactory: initApp,
        deps: [AuthService],
        multi: true
    },
    {
        provide: CORE_CUSTOM_CONFIG,
        useValue: coreConfig
      }
  ]
};

