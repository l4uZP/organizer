import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { NotesService, Note } from './notes.service';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent {
  today = new Date();
  todayStr = this.formatDate(this.today);
  form: FormGroup;
  notes: Note[] = [];
  selected: Note | null = null;
  editing = false;
  modalOpen = false;
  editingContent = '';

  constructor(private fb: FormBuilder, private notesSvc: NotesService) {
    this.form = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(20000)]]
    });
    this.loadNotes();
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  loadNotes(): void {
    this.notesSvc.listByDate(this.todayStr).subscribe((n) => this.notes = n);
  }

  addNote(): void {
    if (this.form.invalid) return;
    const content = this.form.value.content as string;
    this.notesSvc.create({ note_date: this.todayStr, content }).subscribe((n) => {
      this.form.reset();
      this.notes.unshift(n);
    });
  }

  select(note: Note): void {
    this.selected = note;
    this.editing = false;
    this.modalOpen = true;
  }

  startEdit(): void {
    if (!this.selected) return;
    this.editing = true;
    this.editingContent = this.selected.content;
  }

  saveEdit(): void {
    if (!this.selected) return;
    const id = this.selected.id;
    const newContent = this.editingContent;
    this.notesSvc.update(id, { content: newContent }).subscribe((n) => {
      const idx = this.notes.findIndex(x => x.id === id);
      if (idx >= 0) this.notes[idx] = n;
      this.selected = n;
      this.editing = false;
    });
  }

  deleteSelected(): void {
    if (!this.selected) return;
    const id = this.selected.id;
    this.notesSvc.delete(id).subscribe(() => {
      this.notes = this.notes.filter(x => x.id !== id);
      this.selected = null;
      this.modalOpen = false;
    });
  }

  closeModal(): void {
    this.modalOpen = false;
    this.editing = false;
    this.selected = null;
  }
}


