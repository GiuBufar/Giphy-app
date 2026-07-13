import { Component, ElementRef, computed, signal, viewChildren } from '@angular/core';
import { GifsListPage } from './features/gifs/gifs-list-page/gifs-list-page';
import { FavoritesPage } from './features/favorites/favorites-page';

type TabId = 'list' | 'favorites';

const TAB_ORDER: readonly TabId[] = ['list', 'favorites'] as const;

@Component({
  selector: 'app-root',
  imports: [GifsListPage, FavoritesPage],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Giphy');
  protected readonly activeTab = signal<TabId>('list');
  protected readonly isList = computed(() => this.activeTab() === 'list');

  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabBtn');

  protected selectTab(tab: TabId): void {
    this.activeTab.set(tab);
  }

  protected onTabKeydown(event: KeyboardEvent, index: number): void {
    const last = TAB_ORDER.length - 1;
    let nextIndex: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = index === last ? 0 : index + 1;
        break;
      case 'ArrowLeft':
        nextIndex = index === 0 ? last : index - 1;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = last;
        break;
      default:
        return;
    }

    event.preventDefault();
    const targetTab = TAB_ORDER[nextIndex];
    this.activeTab.set(targetTab);
    queueMicrotask(() => {
      this.tabButtons()[nextIndex!]?.nativeElement.focus();
    });
  }
}
