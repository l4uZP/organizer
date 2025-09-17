import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pomodoro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pomodoro.component.html',
  styleUrls: ['./pomodoro.component.scss']
})
export class PomodoroComponent implements OnInit, OnChanges {
  @Input() longBreakInterval = 4;
  @Input() iterationsPerCycle = 4;
  

  get dotsArray() {
    let totalDotsInScreen = this.iterationsPerCycle * 2;
    let dots = Array(totalDotsInScreen);

    for (let i = 0; i < dots.length; i++) {
      if (i % 2 == 0){
        dots[i] = 'iteration inactive';
      }
      let longBreakIndex = (this.longBreakInterval*2)-1;
      if (longBreakIndex == i){
        dots[i] = 'long inactive';
      }
    }
    return dots;
  }

  // Inputs (state provided by container)
  @Input() focusMinutes = 25;
  @Input() shortBreakMinutes = 5;
  @Input() longBreakMinutes = 15;
  
  

  @Input() phase: 'focus' | 'short' | 'long' = 'focus';
  @Input() currentIteration = 1;
  @Input() completedIterations = 0;
  // @Input() dots: Array<'focus' | 'short' | 'long' | 'done'> = [];

  @Input() isRunning = false;
  @Input() autoContinue = true;
  @Input() percentage = 0;
  @Input() displayTime = '00:00';
  @Input() showSettings = false;
  @Input() showCompletion = false;
  @Input() extraIterations = 2;

  // Outputs (events to container)
  @Output() toggleRun = new EventEmitter<void>();
  @Output() skip = new EventEmitter<void>();
  @Output() toggleSettings = new EventEmitter<void>();
  @Output() applySettings = new EventEmitter<void>();
  @Output() continueAfterCompletion = new EventEmitter<void>();
  @Output() endSession = new EventEmitter<void>();

  // Settings changes
  @Output() autoContinueChange = new EventEmitter<boolean>();
  @Output() focusMinutesChange = new EventEmitter<number>();
  @Output() shortBreakMinutesChange = new EventEmitter<number>();
  @Output() longBreakMinutesChange = new EventEmitter<number>();
  @Output() longBreakIntervalChange = new EventEmitter<number>();
  @Output() iterationsPerCycleChange = new EventEmitter<number>();
  @Output() extraIterationsChange = new EventEmitter<number>();

  // Local state for settings UI so it works standalone and with a container
  autoContinueLocal = this.autoContinue;
  focusMinutesLocal = this.focusMinutes;
  shortBreakMinutesLocal = this.shortBreakMinutes;
  longBreakMinutesLocal = this.longBreakMinutes;
  longBreakIntervalLocal = this.longBreakInterval;
  iterationsPerCycleLocal = this.iterationsPerCycle;
  extraIterationsLocal = this.extraIterations;

  ngOnInit(): void {
    this.syncLocalsFromInputs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Keep local form values in sync if parent updates inputs
    if (
      changes['autoContinue'] ||
      changes['focusMinutes'] ||
      changes['shortBreakMinutes'] ||
      changes['longBreakMinutes'] ||
      changes['longBreakInterval'] ||
      changes['iterationsPerCycle'] ||
      changes['extraIterations']
    ) {
      this.syncLocalsFromInputs();
    }
  }

  private syncLocalsFromInputs(): void {
    this.autoContinueLocal = this.autoContinue;
    this.focusMinutesLocal = this.focusMinutes;
    this.shortBreakMinutesLocal = this.shortBreakMinutes;
    this.longBreakMinutesLocal = this.longBreakMinutes;
    this.longBreakIntervalLocal = this.longBreakInterval;
    this.iterationsPerCycleLocal = this.iterationsPerCycle;
    this.extraIterationsLocal = this.extraIterations;
  }

  onToggleSettings(): void {
    this.showSettings = !this.showSettings;
    this.toggleSettings.emit();
  }

  onApplySettings(): void {
    // Update internal inputs so the component works standalone
    this.autoContinue = this.autoContinueLocal;
    this.focusMinutes = this.focusMinutesLocal;
    this.shortBreakMinutes = this.shortBreakMinutesLocal;
    this.longBreakMinutes = this.longBreakMinutesLocal;
    this.longBreakInterval = this.longBreakIntervalLocal;
    this.iterationsPerCycle = this.iterationsPerCycleLocal;
    this.extraIterations = this.extraIterationsLocal;

    // Emit for containers that listen
    this.autoContinueChange.emit(this.autoContinue);
    this.focusMinutesChange.emit(this.focusMinutes);
    this.shortBreakMinutesChange.emit(this.shortBreakMinutes);
    this.longBreakMinutesChange.emit(this.longBreakMinutes);
    this.longBreakIntervalChange.emit(this.longBreakInterval);
    this.iterationsPerCycleChange.emit(this.iterationsPerCycle);
    this.extraIterationsChange.emit(this.extraIterations);

    this.applySettings.emit();
    this.showSettings = false;
  }
}
