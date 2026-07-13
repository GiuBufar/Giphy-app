import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { StorageService } from './storage.service';

installLocalStorageShim();

function installLocalStorageShim(): void {
  const g = globalThis as unknown as { localStorage?: Storage };
  if (g.localStorage) return;
  let store: Record<string, string> = {};
  const shim: Storage = {
    get length(): number {
      return Object.keys(store).length;
    },
    clear(): void {
      store = {};
    },
    getItem(key: string): string | null {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    key(index: number): string | null {
      return Object.keys(store)[index] ?? null;
    },
    removeItem(key: string): void {
      delete store[key];
    },
    setItem(key: string, value: string): void {
      store[key] = String(value);
    },
  };
  g.localStorage = shim;
}

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function makeService(platformId: unknown = 'browser'): StorageService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: platformId }],
    });
    return TestBed.inject(StorageService);
  }

  it('starts with an empty set when localStorage is empty', () => {
    const service = makeService();
    expect(service.favoriteIds().size).toBe(0);
  });

  it('hydrates initial state from localStorage', () => {
    localStorage.setItem('giphy:favorites', JSON.stringify(['abc', 'def']));
    const service = makeService();
    expect([...service.favoriteIds()]).toEqual(['abc', 'def']);
    expect(service.isFavorite('abc')).toBe(true);
    expect(service.isFavorite('xyz')).toBe(false);
  });

  it('toggle adds an unknown id and persists', () => {
    const service = makeService();
    service.toggle('abc');
    expect(service.favoriteIds().has('abc')).toBe(true);
    expect(JSON.parse(localStorage.getItem('giphy:favorites')!)).toEqual(['abc']);
  });

  it('toggle removes an existing id and persists', () => {
    const service = makeService();
    service.toggle('abc');
    service.toggle('abc');
    expect(service.favoriteIds().has('abc')).toBe(false);
    expect(JSON.parse(localStorage.getItem('giphy:favorites')!)).toEqual([]);
  });

  it('remove is a no-op for unknown ids', () => {
    const service = makeService();
    const before = service.favoriteIds();
    service.remove('nope');
    expect(service.favoriteIds()).toBe(before);
  });

  it('is a no-op on non-browser platforms', () => {
    localStorage.setItem('giphy:favorites', JSON.stringify(['abc']));
    const service = makeService('server');
    expect(service.favoriteIds().size).toBe(0);
    service.toggle('abc');
    expect(service.favoriteIds().size).toBe(0);
    // Existing localStorage entry is not touched by the server-side no-op.
    expect(JSON.parse(localStorage.getItem('giphy:favorites')!)).toEqual(['abc']);
  });

  it('produces a new set instance on every mutation (immutability)', () => {
    const service = makeService();
    const s1 = service.favoriteIds();
    service.toggle('abc');
    const s2 = service.favoriteIds();
    expect(s1).not.toBe(s2);
  });
});
