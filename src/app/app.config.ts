import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CustomeRouteReuseStrategy } from './data/class/CustomeRouteReuseStrategy';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
              provideRouter(routes), provideAnimationsAsync(),
              provideHttpClient(),
              { provide: RouteReuseStrategy, useClass: CustomeRouteReuseStrategy }]
};
