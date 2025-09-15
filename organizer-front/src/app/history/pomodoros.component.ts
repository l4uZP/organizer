import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-history-pomodoros',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="history-pomos"><h2>Pomodoros for {{ date }}</h2><p>Screen under construction.</p></div>`,
  styles: [`.history-pomos{padding:12px;}`]
})
export class PomodorosComponent {
  date = '';
  constructor(route: ActivatedRoute) {
    route.queryParamMap.subscribe(p => this.date = p.get('date') || '');
  }
}


