import { Component, input, output } from '@angular/core';
import { Gif } from '../../../../connectors/giphy/models/gif';

@Component({
  selector: 'app-gif-grid',
  templateUrl: './gif-grid.html',
  styleUrl: './gif-grid.css',
})
export class GifGrid {
  readonly gifs = input.required<readonly Gif[]>();
  readonly favoriteIds = input.required<ReadonlySet<string>>();
  readonly loading = input<boolean>(false);
  readonly emptyMessage = input<string>('Nessuna GIF trovata');

  readonly favoriteToggled = output<string>();

  protected trackById(_index: number, gif: Gif): string {
    return gif.id ?? String(_index);
  }

  protected imageUrl(gif: Gif): string {
    return (
      gif.images?.fixed_width?.url ??
      gif.images?.fixed_height?.url ??
      gif.images?.original?.url ??
      ''
    );
  }

  protected imageWidth(gif: Gif): number | null {
    const w = gif.images?.fixed_width?.width;
    const n = w ? Number(w) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  protected imageHeight(gif: Gif): number | null {
    const h = gif.images?.fixed_width?.height;
    const n = h ? Number(h) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  protected aspectRatio(gif: Gif): string {
    const w = this.imageWidth(gif);
    const h = this.imageHeight(gif);
    return w && h ? `${w} / ${h}` : '1 / 1';
  }

  protected altFor(gif: Gif): string {
    return gif.alt_text || gif.title || 'GIF';
  }

  protected isFavorite(gif: Gif): boolean {
    const id = gif.id;
    return !!id && this.favoriteIds().has(id);
  }

  protected onHeartClick(event: MouseEvent, gif: Gif): void {
    event.stopPropagation();
    if (gif.id) {
      this.favoriteToggled.emit(gif.id);
    }
  }
}
