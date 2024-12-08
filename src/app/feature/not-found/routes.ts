import { Routes } from '@angular/router';
import { NotFoundComponent } from './pages/not-found.component';

export const ROUTES: Routes = [
  {
    path: '**',
    component: NotFoundComponent
  }
]
