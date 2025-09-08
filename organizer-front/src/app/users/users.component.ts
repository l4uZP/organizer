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
  styleUrl: './users.component.scss'
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
    nombres: '',
    apellidos: '',
    correo: '',
    usuario: '',
    contrasena: ''
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
      error: (err) => { this.error = err?.error?.error || 'Error cargando usuarios'; this.loading = false; }
    });
  }

  openCreate(): void {
    this.formMode = 'create';
    this.editingId = null;
    this.form = { nombres: '', apellidos: '', correo: '', usuario: '', contrasena: '' };
    this.formError = null;
    this.showForm = true;
  }

  openEdit(u: User): void {
    this.formMode = 'edit';
    this.editingId = u.id;
    this.form = { nombres: u.nombres, apellidos: u.apellidos, correo: u.correo, usuario: u.usuario, contrasena: '' };
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
        error: (err) => { this.formError = err?.error?.error || 'Error creando usuario'; }
      });
    } else if (this.editingId != null) {
      const payload: any = { ...this.form };
      if (!payload.contrasena) delete payload.contrasena;
      this.userService.update(this.editingId, payload).subscribe({
        next: () => { this.showForm = false; this.load(); },
        error: (err) => { this.formError = err?.error?.error || 'Error actualizando usuario'; }
      });
    }
  }

  canDelete(): boolean {
    return this.users.length > 1;
  }

  remove(u: User): void {
    if (!this.canDelete()) {
      this.error = 'No se puede eliminar el último usuario';
      return;
    }
    if (!confirm(`¿Eliminar usuario ${u.usuario}?`)) return;
    this.userService.delete(u.id).subscribe({
      next: () => this.load(),
      error: (err) => { this.error = err?.error?.error || 'Error eliminando usuario'; }
    });
  }
}


