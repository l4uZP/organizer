import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { User, UserService } from './user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error: string | null = null;
  formError: string | null = null;

  // modal state
  showForm = false;
  formMode: 'create' | 'edit' = 'create';
  editingId: number | null = null;
  form = {
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    role: 'generic' as 'admin' | 'generic'
  };

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.userService.list().subscribe({
      next: (data) => { this.users = data; this.loading = false; },
      error: (err) => { this.error = err?.error?.error || 'Error loading users'; this.loading = false; }
    });
  }

  openCreate(): void {
    this.formMode = 'create';
    this.editingId = null;
    this.form = { first_name: '', last_name: '', email: '', username: '', password: '', role: 'generic' };
    this.formError = null;
    this.showForm = true;
  }

  openEdit(u: User): void {
    this.formMode = 'edit';
    this.editingId = u.id;
    this.form = { first_name: u.first_name, last_name: u.last_name, email: u.email, username: u.username, password: '', role: u.role };
    this.formError = null;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  save(): void {
    this.formError = null;
    if (this.formMode === 'create') {
      this.userService.create(this.form).subscribe({
        next: () => { this.showForm = false; this.load(); },
        error: (err) => { this.formError = err?.error?.error || 'Error creating user'; }
      });
    } else if (this.editingId != null) {
      const payload: any = { ...this.form };
      if (!payload.password) delete payload.password;
      this.userService.update(this.editingId, payload).subscribe({
        next: () => { this.showForm = false; this.load(); },
        error: (err) => { this.formError = err?.error?.error || 'Error updating user'; }
      });
    }
  }

  canDelete(): boolean {
    return this.users.length > 1;
  }

  remove(u: User): void {
    if (!this.canDelete()) {
      this.error = 'Cannot delete the last user';
      return;
    }
    if (!confirm(`Delete user ${u.username}?`)) return;
    this.userService.delete(u.id).subscribe({
      next: () => this.load(),
      error: (err) => { this.error = err?.error?.error || 'Error deleting user'; }
    });
  }
}


