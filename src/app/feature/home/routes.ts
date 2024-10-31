import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  {
    path: '',
    title: 'Inicio',
    loadComponent: () =>import('./pages/home/home.component')
  }
]
