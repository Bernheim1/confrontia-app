import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import 'flowbite';

// Cargar env.js solo en producción
function loadEnvironmentScript(): Promise<void> {
  // Solo cargar en producción si existe la propiedad production
  const isProduction = (environment as any).production === true;
  
  if (isProduction) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'assets/env.js';
      script.onload = () => resolve();
      script.onerror = () => {
        console.warn('No se pudo cargar env.js, usando valores por defecto');
        resolve(); // No fallar si no existe el archivo
      };
      document.head.appendChild(script);
    });
  }
  
  return Promise.resolve();
}

// Cargar el script y luego iniciar la aplicación
loadEnvironmentScript()
  .then(() => bootstrapApplication(AppComponent, appConfig))
  .catch((err) => console.error(err));
