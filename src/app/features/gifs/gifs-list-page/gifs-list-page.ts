import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';

import { ApiService } from '../../../../connectors/giphy/services/api.service';
import { Gif } from '../../../../connectors/giphy/models/gif';
import { Pagination } from '../../../../connectors/giphy/models/pagination';
import { environment } from '../../../../environments/environment';
import { StorageService } from '../../../core/storage.service';
import { GifGrid } from '../gif-grid/gif-grid';
import { Searchbar } from '../searchbar/searchbar';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-gifs-list-page',
  imports: [Searchbar, GifGrid],
  templateUrl: './gifs-list-page.html',
  styleUrl: './gifs-list-page.css',
})
export class GifsListPage {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly storage = inject(StorageService);

  protected readonly query = signal<string>('');
  protected readonly page = signal<number>(0);
  protected readonly gifs = signal<readonly Gif[]>([]);
  protected readonly pagination = signal<Pagination | undefined>(undefined);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  protected readonly pageSize = PAGE_SIZE;
  protected readonly offset = computed(() => this.page() * PAGE_SIZE);

  protected readonly hasNext = computed(() => {
    const p = this.pagination();
    if (!p) return false;
    const seen = (p.offset ?? 0) + (p.count ?? 0);
    return seen < (p.total_count ?? 0);
  });

  protected readonly hasPrev = computed(() => this.page() > 0);

  protected readonly emptyMessage = computed(() =>
    this.query().trim().length > 0
      ? `Nessuna GIF trovata per "${this.query().trim()}"`
      : 'Nessuna GIF trending disponibile'
  );

  private inflight: Subscription | null = null;

  constructor() {
    this.load();
  }

  protected onSearch(q: string): void {
    this.query.set(q);
    this.page.set(0);
    this.load();
  }

  protected onNext(): void {
    if (!this.hasNext() || this.loading()) return;
    this.page.update((p) => p + 1);
    this.load();
  }

  protected onPrev(): void {
    if (!this.hasPrev() || this.loading()) return;
    this.page.update((p) => Math.max(0, p - 1));
    this.load();
  }

  protected onFavoriteToggled(id: string): void {
    this.storage.toggle(id);
  }

  private load(): void {
    this.inflight?.unsubscribe();
    this.loading.set(true);
    this.error.set(null);

    const trimmed = this.query().trim();
    const request$ =
      trimmed.length === 0
        ? this.api.getTrendingGifs({
            api_key: environment.giphyApiKey,
            limit: PAGE_SIZE,
            offset: this.offset(),
          })
        : this.api.searchGifs({
            api_key: environment.giphyApiKey,
            q: trimmed,
            limit: PAGE_SIZE,
            offset: this.offset(),
          });

    this.inflight = request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.gifs.set(response.data ?? []);
          this.pagination.set(response.pagination);
          this.loading.set(false);
        },
        error: () => {
          this.gifs.set([]);
          this.pagination.set(undefined);
          this.error.set('Impossibile caricare le GIF. Riprova più tardi.');
          this.loading.set(false);
        },
      });
  }
}
