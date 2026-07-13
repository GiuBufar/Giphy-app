import { Injectable, PLATFORM_ID, Signal, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'giphy:favorites';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _ids = signal<ReadonlySet<string>>(this.loadInitial());

  readonly favoriteIds: Signal<ReadonlySet<string>> = this._ids.asReadonly();

  isFavorite(id: string): boolean {
    return this._ids().has(id);
  }

  toggle(id: string): void {
    if (!id || !this.isBrowser) return;
    this._ids.update((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      this.persist(next);
      return next;
    });
  }

  remove(id: string): void {
    if (!id || !this.isBrowser) return;
    this._ids.update((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      this.persist(next);
      return next;
    });
  }

  private loadInitial(): ReadonlySet<string> {
    if (!this.isBrowser) return new Set();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return new Set();
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return new Set();
      return new Set(parsed.filter((v): v is string => typeof v === 'string'));
    } catch {
      return new Set();
    }
  }

  private persist(set: ReadonlySet<string>): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    } catch {
      // Silently ignore quota / access errors — favorites are non-critical state.
    }
  }
}
