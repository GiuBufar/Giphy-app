import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';

const DEBOUNCE_MS = 300;

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.html',
  styleUrl: './searchbar.css',
})
export class Searchbar {
  readonly value = input<string>('');
  readonly search = output<string>();

  protected readonly query = signal<string>('');

  private lastEmitted = '';
  private timerId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);

    effect(() => {
      const incoming = this.value();
      untracked(() => {
        this.query.set(incoming);
        this.lastEmitted = incoming;
      });
    });

    destroyRef.onDestroy(() => this.clearTimer());
  }

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const next = target.value;
    this.query.set(next);
    this.scheduleEmit(next);
  }

  protected onClear(): void {
    this.query.set('');
    this.clearTimer();
    if (this.lastEmitted !== '') {
      this.lastEmitted = '';
      this.search.emit('');
    }
  }

  private scheduleEmit(value: string): void {
    this.clearTimer();
    this.timerId = setTimeout(() => {
      this.timerId = null;
      if (value !== this.lastEmitted) {
        this.lastEmitted = value;
        this.search.emit(value);
      }
    }, DEBOUNCE_MS);
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}
