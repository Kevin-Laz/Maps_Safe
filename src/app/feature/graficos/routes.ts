import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  { path: 'graficos', loadComponent: () =>import('./pages/graficos/graficos.component')}
];
