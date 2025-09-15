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
  journalOpen = false;
  adminOpen = false;

  constructor(public auth: AuthService) {}

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  toggleJournal(): void {
    this.journalOpen = !this.journalOpen;
  }

  toggleAdmin(): void {
    this.adminOpen = !this.adminOpen;
  }

  goToSettings(): void {
    // Placeholder: navigate to /app/settings in the future
    this.profileMenuOpen = false;
  }

  logout(): void {
    this.auth.logout();
    // Route guards will redirect to login
    window.location.href = '/login';
  }
}
