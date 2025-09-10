import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  isSidebarCollapsed = false;
  profileMenuOpen = false;
  diarioOpen = false;

  constructor(private auth: AuthService) {}

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  toggleDiario(): void {
    this.diarioOpen = !this.diarioOpen;
  }

  goToSettings(): void {
    // Placeholder: aquí se podría navegar a /app/configuraciones
    this.profileMenuOpen = false;
  }

  logout(): void {
    this.auth.logout();
    // La protección de rutas redirigirá al login
    window.location.href = '/login';
  }
}
