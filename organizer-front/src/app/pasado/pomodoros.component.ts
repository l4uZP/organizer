import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pomodoros-pasado',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="pasado-pomos"><h2>Pomodoros del {{ date }}</h2><p>Pantalla en construcción.</p></div>`,
  styles: [`.pasado-pomos{padding:12px;}`]
})
export class PomodorosComponent {
  date = '';
  constructor(route: ActivatedRoute) {
    route.queryParamMap.subscribe(p => this.date = p.get('date') || '');
  }
}


