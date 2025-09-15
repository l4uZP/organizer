import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth.service';

export interface Note {
  id: number;
  user_id: number;
  note_date: string; // YYYY-MM-DD
  content: string;
  hidden: boolean;
  starred: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteRequest {
  note_date: string;
  content: string;
}

export interface UpdateNoteRequest {
  note_date?: string;
  content?: string;
  hidden?: boolean;
  starred?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/notes';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  listByDate(date: string, includeHidden = false): Observable<Note[]> {
    const params = `date=${encodeURIComponent(date)}&include_hidden=${includeHidden ? 'true' : 'false'}`;
    return this.http.get<Note[]>(`${this.baseUrl}?${params}`, { headers: this.authHeaders() });
  }

  create(payload: CreateNoteRequest): Observable<Note> {
    return this.http.post<Note>(this.baseUrl, payload, { headers: this.authHeaders() });
  }

  get(id: number): Observable<Note> {
    return this.http.get<Note>(`${this.baseUrl}/${id}`, { headers: this.authHeaders() });
  }

  update(id: number, payload: UpdateNoteRequest): Observable<Note> {
    return this.http.put<Note>(`${this.baseUrl}/${id}`, payload, { headers: this.authHeaders() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.authHeaders() });
  }

  setHidden(id: number, hidden: boolean): Observable<Note> {
    return this.update(id, { hidden });
  }

  setStarred(id: number, starred: boolean): Observable<Note> {
    return this.update(id, { starred });
  }
}


