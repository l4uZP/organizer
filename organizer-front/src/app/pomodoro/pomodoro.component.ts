import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pomodoro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pomodoro.component.html',
  styleUrls: ['./pomodoro.component.scss']
})
export class PomodoroComponent implements OnDestroy {
  // Settings
  focusMinutes = 25;
  shortBreakMinutes = 5;
  longBreakMinutes = 15;
  iterationsPerCycle = 4;

  // State
  phase: 'focus' | 'short' | 'long' = 'focus';
  currentIteration = 1; // 1..iterationsPerCycle
  completedCount = 0; // total completed focus sessions
  private lastCompletionWasSkip = false;
  isRunning = false;
  remainingSeconds = this.focusMinutes * 60;
  totalSeconds = this.remainingSeconds;
  timerId: number | null = null;
  showSettings = false;
  autoContinue = true;
  private audioCtx: AudioContext | null = null;
  showCompletion = false;
  extraIterations = 2;

  ngOnDestroy(): void {
    this.clearTimer();
  }

  toggleRun(): void {
    this.isRunning ? this.pause() : this.start();
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tick();
    this.timerId = window.setInterval(() => this.tick(), 1000);
  }

  pause(): void {
    this.isRunning = false;
    this.clearTimer();
  }

  resetPhase(): void {
    const seconds = this.phase === 'focus'
      ? this.focusMinutes * 60
      : this.phase === 'short'
        ? this.shortBreakMinutes * 60
        : this.longBreakMinutes * 60;
    this.totalSeconds = seconds;
    this.remainingSeconds = seconds;
  }

  private tick(): void {
    if (this.remainingSeconds > 0) {
      this.remainingSeconds -= 1;
      return;
    }
    // Phase complete: advance
    // Increase completed counter only when a focus ends naturally
    if (this.phase === 'focus') {
      this.completedCount += 1;
    }
    this.beep();
    if (this.phase === 'long') {
      // End of cycle → ask user
      this.pause();
      this.lastCompletionWasSkip = false;
      this.showCompletion = true;
      return;
    }
    const wasRunning = this.isRunning;
    this.advancePhase();
    if (!this.autoContinue) {
      this.pause();
      this.isRunning = false;
    } else if (!wasRunning) {
      this.start();
    }
  }

  private advancePhase(): void {
    if (this.phase === 'focus') {
      if (this.currentIteration % this.iterationsPerCycle === 0) {
        this.phase = 'long';
      } else {
        this.phase = 'short';
      }
    } else {
      // After a break, advance iteration and go to focus
      if (this.phase === 'long') {
        // Normally handled by completion modal
        this.currentIteration = 1;
      } else {
        this.currentIteration += 1;
      }
      this.phase = 'focus';
    }
    this.resetPhase();
  }

  private beep(): void {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = this.audioCtx;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = this.phase === 'focus' ? 880 : 660;
      g.gain.value = 0.001;
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.32);
    } catch {}
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  applySettings(): void {
    // Clamp values for sanity
    this.focusMinutes = Math.max(1, Math.floor(this.focusMinutes));
    this.shortBreakMinutes = Math.max(1, Math.floor(this.shortBreakMinutes));
    this.longBreakMinutes = Math.max(1, Math.floor(this.longBreakMinutes));
    this.iterationsPerCycle = Math.min(10, Math.max(1, Math.floor(this.iterationsPerCycle)));
    // Reset depending on current phase
    this.resetPhase();
    if (this.isRunning) {
      // Ensure timer continues with new total
      this.clearTimer();
      this.timerId = window.setInterval(() => this.tick(), 1000);
    }
    this.showSettings = false;
  }

  get percentage(): number {
    return this.totalSeconds === 0 ? 0 : (this.remainingSeconds / this.totalSeconds) * 100;
  }

  get displayTime(): string {
    const m = Math.floor(this.remainingSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(this.remainingSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Completed iterations shown in dots
  get completedIterations(): number {
    if (this.phase === 'long' || this.showCompletion) {
      // If completion triggered by skip, do not mark the last one as done
      return this.lastCompletionWasSkip ? (this.completedCount % this.iterationsPerCycle) : this.iterationsPerCycle;
    }
    return this.completedCount % this.iterationsPerCycle;
  }

  get dots(): Array<'focus' | 'short' | 'long' | 'done'> {
    const arr: Array<'focus' | 'short' | 'long' | 'done'> = [];
    for (let i = 1; i <= this.iterationsPerCycle; i++) {
      if (i <= this.completedIterations) arr.push('done');
      else arr.push('focus');
    }
    return arr;
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  // Called when the user chooses to continue after completing the cycle
  continueAfterCompletion(): void {
    const add = Math.max(1, Math.floor(this.extraIterations || 0));
    const prevTotal = this.iterationsPerCycle;
    this.iterationsPerCycle = prevTotal + add;
    this.showCompletion = false;
    this.phase = 'focus';
    // Continue from where it left: next iteration after the previous total
    this.currentIteration = prevTotal + 1;
    this.resetPhase();
    if (this.autoContinue) {
      this.start();
    }
  }

  // Called when the user ends the session
  endSession(): void {
    this.showCompletion = false;
    this.pause();
    alert('¡Gracias por tu trabajo! Sesión finalizada.');
    // Reset counters but keep user settings
    this.phase = 'focus';
    this.currentIteration = 1;
    this.resetPhase();
  }

  // Skip current phase
  skip(): void {
    const wasLong = this.phase === 'long';
    if (this.phase === 'focus') {
      // Do not count this iteration; jump directly to next iteration focus
      this.currentIteration += 1;
      if (this.currentIteration > this.iterationsPerCycle) {
        // Completed planned iterations (skipped the last one)
        this.pause();
        this.lastCompletionWasSkip = true;
        this.showCompletion = true;
        return;
      }
      this.phase = 'focus';
      this.resetPhase();
    } else if (this.phase === 'short') {
      // End break and move to next iteration
      this.currentIteration += 1;
      if (this.currentIteration > this.iterationsPerCycle) {
        // Reached end by skipping during break → show completion
        this.pause();
        this.lastCompletionWasSkip = true;
        this.showCompletion = true;
        return;
      }
      this.phase = 'focus';
      this.resetPhase();
    } else if (wasLong) {
      // Skipping long break => completion
      this.pause();
      this.lastCompletionWasSkip = true;
      this.showCompletion = true;
      return;
    }
  }
}
