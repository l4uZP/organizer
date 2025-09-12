import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pasado',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pasado.component.html',
  styleUrls: ['./pasado.component.scss']
})
export class PasadoComponent {
  date = '';

  constructor(private router: Router, private route: ActivatedRoute) {
    this.route.queryParamMap.subscribe(params => {
      this.date = params.get('date') || '';
    });
  }

  goNotas(): void {
    this.router.navigate(['./notas'], { relativeTo: this.route, queryParams: { date: this.date } });
  }

  goPomodoros(): void {
    this.router.navigate(['./pomodoros'], { relativeTo: this.route, queryParams: { date: this.date } });
  }
}


