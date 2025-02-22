import { Routes } from '@angular/router';
import { ROUTES as HOME_ROUTES } from './feature/home/routes';
import { ROUTES as GRAFICOS_ROUTES } from './feature/graficos/routes';
import { ROUTES as HISTORIAL_ROUTES } from './feature/historial/routes';
import { ROUTES as NOT_FOUND} from './feature/not-found/routes';
export const routes: Routes = [
  ...HOME_ROUTES,
  ...GRAFICOS_ROUTES,
  ...HISTORIAL_ROUTES,
  ...NOT_FOUND
];
