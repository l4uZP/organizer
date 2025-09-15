import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotesService, Note } from '../journal/notes/notes.service';

@Component({
  selector: 'app-history-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history-notes.component.html',
  styleUrls: ['./history-notes.component.scss']
})
export class HistoryNotesComponent {
  date = '';
  includeHidden = false;
  notes: Note[] = [];

  constructor(private route: ActivatedRoute, private notesSvc: NotesService) {
    this.route.queryParamMap.subscribe(p => {
      this.date = p.get('date') || '';
      this.load();
    });
  }

  load(): void {
    this.notesSvc.listByDate(this.date, this.includeHidden).subscribe((n) => this.notes = n);
  }

  toggleHidden(note: Note): void {
    this.notesSvc.setHidden(note.id, !note.hidden).subscribe((updated) => {
      const idx = this.notes.findIndex(x => x.id === note.id);
      if (idx >= 0) this.notes[idx] = updated;
      this.resort();
    });
  }

  toggleStarred(note: Note): void {
    this.notesSvc.setStarred(note.id, !note.starred).subscribe((updated) => {
      const idx = this.notes.findIndex(x => x.id === note.id);
      if (idx >= 0) this.notes[idx] = updated;
      this.resort();
    });
  }

  resort(): void {
    const visible = this.notes.filter(n => !n.hidden).sort((a,b) => (Number(b.starred) - Number(a.starred)) || (a.created_at.localeCompare(b.created_at)));
    const hidden = this.notes.filter(n => n.hidden).sort((a,b) => a.created_at.localeCompare(b.created_at));
    this.notes = this.includeHidden ? [...visible, ...hidden] : visible;
  }
}


