import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent {
  date = '';

  constructor(private router: Router, private route: ActivatedRoute) {
    this.route.queryParamMap.subscribe(params => {
      this.date = params.get('date') || '';
    });
  }

  goNotes(): void {
    this.router.navigate(['./notes'], { relativeTo: this.route, queryParams: { date: this.date } });
  }

  goPomodoros(): void {
    this.router.navigate(['./pomodoros'], { relativeTo: this.route, queryParams: { date: this.date } });
  }
}


