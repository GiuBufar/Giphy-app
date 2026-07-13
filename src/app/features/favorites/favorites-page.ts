import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';

import { ApiService } from '../../../connectors/giphy/services/api.service';
import { Gif } from '../../../connectors/giphy/models/gif';
import { environment } from '../../../environments/environment';
import { StorageService } from '../../core/storage.service';
import { GifGrid } from '../gifs/gif-grid/gif-grid';

@Component({
  selector: 'app-favorites-page',
  imports: [GifGrid],
  templateUrl: './favorites-page.html',
  styleUrl: './favorites-page.css',
})
export class FavoritesPage {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly storage = inject(StorageService);

  protected readonly favoriteIds = this.storage.favoriteIds;

  private readonly cache = signal<ReadonlyMap<string, Gif>>(new Map());

  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  protected readonly visibleGifs = computed<readonly Gif[]>(() => {
    const ids = this.favoriteIds();
    const map = this.cache();
    const out: Gif[] = [];
    for (const id of ids) {
      const g = map.get(id);
      if (g) out.push(g);
    }
    return out;
  });

  private inflight: Subscription | null = null;

  constructor() {
    effect(() => {
      // Track favorite ids reactively; hydrate() is idempotent.
      this.favoriteIds();
      this.hydrate();
    });
  }

  protected onFavoriteToggled(id: string): void {
    this.storage.remove(id);
  }

  private hydrate(): void {
    const currentCache = this.cache();
    const missing: string[] = [];
    for (const id of this.favoriteIds()) {
      if (!currentCache.has(id)) missing.push(id);
    }
    if (missing.length === 0) return;

    this.inflight?.unsubscribe();
    this.loading.set(true);
    this.error.set(null);

    this.inflight = this.api
      .getGifsByIds({
        api_key: environment.giphyApiKey,
        ids: missing.join(','),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const next = new Map(this.cache());
          for (const gif of response.data ?? []) {
            if (gif.id) next.set(gif.id, gif);
          }
          this.cache.set(next);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Impossibile caricare i preferiti. Riprova più tardi.');
          this.loading.set(false);
        },
      });
  }
}
