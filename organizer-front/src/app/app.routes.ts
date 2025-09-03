import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './layout/main/main.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'app',
    component: MainComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'calendario',
        loadComponent: () => import('./calendario/calendario.component').then(m => m.CalendarioComponent)
      },
      {
        path: 'pomodoro',
        loadComponent: () => import('./pomodoro/pomodoro.component').then(m => m.PomodoroComponent)
      }
    ]
  }
];