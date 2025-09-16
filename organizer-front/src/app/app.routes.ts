import { Routes, CanActivateFn } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './layout/main/main.component';
import { authGuard } from './core/auth.guard';
import { inject } from '@angular/core';
import { AuthService } from './core/auth.service';
import { HistoryComponent } from './history/history.component';
import { HistoryNotesComponent } from './history/history-notes.component';
import { PomodorosComponent } from './history/pomodoros.component';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAdmin();
};

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
        path: 'calendar',
        loadComponent: () => import('./calendar/calendar.component').then(m => m.CalendarComponent)
      },
      {
        path: 'pomodoro',
        loadComponent: () => import('./pomodoro/pomodoro.component').then(m => m.PomodoroComponent)
      }
      ,
      {
        path: 'users',
        loadComponent: () => import('./users/users.component').then(m => m.UsersComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'journal',
        children: [
          { path: '', redirectTo: 'emotions', pathMatch: 'full' },
          {
            path: 'emotions',
            loadComponent: () => import('./journal/emotions/emotions.component').then(m => m.EmotionsComponent)
          },
          {
            path: 'notes',
            loadComponent: () => import('./journal/notes/notes.component').then(m => m.NotesComponent)
          }
        ]
      },
      {
        path: 'pending',
        children: [
          { path: '', redirectTo: 'reminders', pathMatch: 'full' },
          {
            path: 'reminders',
            loadComponent: () => import('./pending/reminders/reminders.component').then(m => m.RemindersComponent)
          },
          {
            path: 'todos',
            loadComponent: () => import('./pending/todos/todos.component').then(m => m.TodosComponent)
          }
        ]
      },
      {
        path: 'history',
        children: [
          { path: '', component: HistoryComponent },
          { path: 'notes', component: HistoryNotesComponent },
          { path: 'pomodoros', component: PomodorosComponent }
        ]
      }
    ]
  }
];