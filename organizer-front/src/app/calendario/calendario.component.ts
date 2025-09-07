import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.scss'
})
export class CalendarioComponent implements OnInit {
  today = new Date();
  viewYear = this.today.getFullYear();
  viewMonth = this.today.getMonth(); // 0-11
  weeks: (Date | null)[][] = [];
  monthPickerOpen = false;
  yearPickerOpen = false;
  monthOptions: string[] = [];
  yearInputValue: number = this.viewYear;

  ngOnInit(): void {
    this.buildMonthOptions();
    this.buildCalendar();
  }

  get monthLabel(): string {
    const d = new Date(this.viewYear, this.viewMonth, 1);
    // Mes en español, capitalizado
    const formatter = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });
    const label = formatter.format(d);
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  get monthName(): string {
    const d = new Date(this.viewYear, this.viewMonth, 1);
    const formatter = new Intl.DateTimeFormat('es-ES', { month: 'long' });
    const label = formatter.format(d);
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  get isOnCurrentMonth(): boolean {
    return (
      this.viewYear === this.today.getFullYear() &&
      this.viewMonth === this.today.getMonth()
    );
  }

  private buildMonthOptions(): void {
    this.monthOptions = [];
    for (let i = 0; i < 12; i++) {
      const label = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date(2000, i, 1));
      this.monthOptions.push(label.charAt(0).toUpperCase() + label.slice(1));
    }
  }

  buildCalendar(): void {
    const firstDay = new Date(this.viewYear, this.viewMonth, 1);
    const lastDay = new Date(this.viewYear, this.viewMonth + 1, 0);
    const startIdxMondayBased = (firstDay.getDay() + 6) % 7; // Lunes=0
    const numDays = lastDay.getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startIdxMondayBased; i++) {
      cells.push(null);
    }
    for (let day = 1; day <= numDays; day++) {
      cells.push(new Date(this.viewYear, this.viewMonth, day));
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    this.weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      this.weeks.push(cells.slice(i, i + 7));
    }
  }

  isToday(date: Date | null): boolean {
    if (!date) return false;
    const t = this.today;
    return (
      date.getFullYear() === t.getFullYear() &&
      date.getMonth() === t.getMonth() &&
      date.getDate() === t.getDate()
    );
  }

  iso(date: Date): string {
    // YYYY-MM-DD
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  prevMonth(): void {
    if (this.viewMonth === 0) {
      this.viewMonth = 11;
      this.viewYear -= 1;
    } else {
      this.viewMonth -= 1;
    }
    this.buildCalendar();
  }

  nextMonth(): void {
    if (this.viewMonth === 11) {
      this.viewMonth = 0;
      this.viewYear += 1;
    } else {
      this.viewMonth += 1;
    }
    this.buildCalendar();
  }

  goToToday(): void {
    if (this.isOnCurrentMonth) return;
    this.viewYear = this.today.getFullYear();
    this.viewMonth = this.today.getMonth();
    this.buildCalendar();
  }

  toggleMonthPicker(): void {
    this.monthPickerOpen = !this.monthPickerOpen;
    if (this.monthPickerOpen) this.yearPickerOpen = false;
  }

  toggleYearPicker(): void {
    this.yearPickerOpen = !this.yearPickerOpen;
    if (this.yearPickerOpen) this.monthPickerOpen = false;
    if (this.yearPickerOpen) this.yearInputValue = this.viewYear;
  }

  onMonthSelect(value: string): void {
    const idx = this.monthOptions.map(m => m.toLowerCase()).indexOf(value.toLowerCase());
    if (idx >= 0) {
      this.viewMonth = idx;
      this.buildCalendar();
      this.monthPickerOpen = false;
    }
  }

  onYearInput(value: string): void {
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      this.viewYear = parsed;
      this.buildCalendar();
      this.yearPickerOpen = false;
    }
  }

  onMonthSelectIndex(value: string): void {
    const idx = parseInt(value, 10);
    if (!Number.isNaN(idx) && idx >= 0 && idx <= 11) {
      this.viewMonth = idx;
      this.buildCalendar();
      this.monthPickerOpen = false;
    }
  }

  applyYear(): void {
    const parsed = Number(this.yearInputValue);
    if (!Number.isNaN(parsed)) {
      this.viewYear = parsed;
      this.buildCalendar();
      this.yearPickerOpen = false;
    }
  }
}
