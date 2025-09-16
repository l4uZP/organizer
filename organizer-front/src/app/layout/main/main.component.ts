import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  isSidebarCollapsed = true;
  profileMenuOpen = false;
  journalOpen = false;
  adminOpen = false;
  pendingOpen = false;

  constructor(public auth: AuthService) {}

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth > 1024) {
      this.isSidebarCollapsed = false;
    } else {
      this.isSidebarCollapsed = true;
    }
  }

  ngOnInit() {
    this.onResize();
  }

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

  togglePending(): void {
    this.pendingOpen = !this.pendingOpen;
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
