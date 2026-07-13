# PRP: Tab "Preferiti" — Vista favoriti con hydration da API e persistenza locale

### Design: [Layout "Preferiti" — Figma](https://www.figma.com/design/m55WxynwtlfINws7cdd4ab/Untitled?node-id=2-3&t=VupFN6NmxXO8QaHE-4)

## 1. Contesto e Obiettivo

Implementare il secondo tab della SPA Giphy, "Preferiti", che mostra le sole GIF marcate dall'utente. Il tab:

- Legge gli **ID preferiti** dal `StorageService` (introdotto nel [PRP #1](PRPs/01-lista-gifs.md)), che li mantiene sincronizzati con `localStorage` sotto la chiave `giphy:favorites`.
- Quando si apre il tab (o quando la lista degli ID cambia), esegue **una singola chiamata batch** all'endpoint Giphy `getGifsByIds` per hydratare i media aggiornati partendo dagli ID.
- **Riutilizza `GifGridComponent`** (già dumb, già emette `favoriteToggled`) per mostrare i risultati con lo stesso stile della Lista GIFs.
- Consente di **rimuovere** una GIF dai preferiti cliccando il cuore: l'ID viene rimosso dallo storage e la vista si aggiorna immediatamente (rimozione ottimistica dal signal della lista, senza rifetch).
- Gestisce empty state ("Non hai ancora salvato nessun preferito"), loading ("Caricamento…") ed errori.

Il tab si aggancia alla shell (`AppComponent`) esistente sostituendo il placeholder lasciato nel PRP #1.

## 2. Architettura & Regole

Vincoli da [.github/copilot-instructions.md](.github/copilot-instructions.md), applicati a questo PRP:

- [ ] **Standalone Components.** Nessun `NgModule`. Non impostare `standalone: true` (default Angular v20+).
- [ ] **Change detection.** Non impostare `OnPush` esplicitamente (default Angular v22+).
- [ ] **Stato con Signals** (`signal`, `computed`, `update`/`set`). Vietato `mutate`.
- [ ] **API dei componenti moderne.** `input()`, `output()`, `inject()`; niente decoratori vecchi.
- [ ] **Nessuna duplicazione.** Riusare `GifGridComponent` e `StorageService` del PRP #1. NON creare un nuovo servizio API: usare l'`ApiService` autogenerato.
- [ ] **Template.** Solo `@if`/`@for`/`@switch`, `class`/`style` bindings; niente `*ngIf`, `ngClass`, `ngStyle`.
- [ ] **Tipi stretti.** `Gif`, `GifResponse` dai modelli autogenerati; niente `any`.
- [ ] **Accessibilità AA.** Empty state con `role="status"`; errore con `role="alert"`; il bottone cuore mantiene `aria-pressed` corretto anche dopo la rimozione ottimistica.
- [ ] **Lazy loading.** Se il tab diventasse una route in futuro, andrebbe lazy-loaded; in questa iterazione la navigazione è signal-based nella shell, quindi il componente resta importato staticamente.
- [ ] **SSR-safe.** `localStorage` è già isolato nel `StorageService`; il componente `FavoritesPageComponent` non deve accedervi direttamente.

## 3. Gestione Dati e API

- [ ] **Servizio API (autogenerato, NON riscrivere):**
  - `ApiService.getGifsByIds(params: GetGifsByIds$Params)` → `Observable<GifResponse>` (vedi [src/connectors/giphy/services/api.service.ts](src/connectors/giphy/services/api.service.ts) e [src/connectors/giphy/fn/operations/get-gifs-by-ids.ts](src/connectors/giphy/fn/operations/get-gifs-by-ids.ts)).
  - Parametri: `api_key: string` (da `environment.giphyApiKey`), `ids: string` — **ID multipli separati da virgola** (es. `"abc,def,ghi"`).
- [ ] **Interfacce TypeScript (autogenerate):**
  - `Gif` — [src/connectors/giphy/models/gif.ts](src/connectors/giphy/models/gif.ts).
  - `GifResponse` — [src/connectors/giphy/models/gif-response.ts](src/connectors/giphy/models/gif-response.ts) (campo `data: Gif[]`).
- [ ] **Storage Locale:**
  - Consumato **esclusivamente** tramite il `StorageService` del PRP #1 (`favoriteIds: Signal<ReadonlySet<string>>`, `remove(id)`, `toggle(id)`).
  - Nessuna scrittura diretta a `localStorage` dal componente.
- [ ] **Ordinamento.** L'ordine delle GIF restituite da Giphy non è garantito rispetto all'ordine degli `ids` inviati: preservare l'ordine di inserimento riordinando `response.data` in base all'ordine di iterazione del `Set` (o mantenere l'ordine ricevuto se accettabile — decidere per l'ordine ricevuto per semplicità, documentandolo).
- [ ] **Cache locale.** Mantenere un `signal<Map<string, Gif>>` interno al componente per non rifetchare GIF già scaricate quando si torna sul tab. Invalidare la cache solo se l'ID è nuovo (non presente in mappa).

## 4. Piano di Implementazione Passo-Passo

> **REGOLA PER L'AGENTE:** Ogni step è granulare e sequenziale. Non passare al successivo se la validazione fallisce. Il PRP #1 è prerequisito: `StorageService`, `GifGridComponent`, providers HTTP e shell con tab devono essere già in place.

### Step 1: Verifica prerequisiti dal PRP #1

- [ ] Task 1: Confermare che esistono e sono funzionanti:
  - `src/app/core/storage.service.ts` con `favoriteIds`, `toggle`, `remove`.
  - `src/app/features/gifs/gif-grid/gif-grid.ts` con input `gifs`, `favoriteIds`, `loading`, `emptyMessage` e output `favoriteToggled`.
  - `provideHttpClient(withFetch())` in [src/app/app.config.ts](src/app/app.config.ts).
  - Shell con signal `activeTab` in [src/app/app.ts](src/app/app.ts).
- [ ] Task 2: Se qualcosa manca, **fermarsi** e completare prima il PRP #1.
- **Validazione:** `npm start` funziona, il tab "Lista GIFs" carica GIF e il cuore persiste in `localStorage`.

### Step 2: `FavoritesPageComponent` (smart)

- [ ] Task 1: `ng generate component features/favorites/favorites-page`.
- [ ] Task 2: Iniettare via `inject()`: `ApiService`, `StorageService`.
- [ ] Task 3: Signals di stato locali:
  - `cache = signal<ReadonlyMap<string, Gif>>(new Map())` — dizionario `id → Gif` per evitare rifetch.
  - `loading = signal<boolean>(false)`.
  - `error = signal<string | null>(null)`.
  - `favoriteIds = this.storage.favoriteIds` — riferimento al signal readonly del servizio.
  - `visibleGifs = computed<readonly Gif[]>(() => { const ids = this.favoriteIds(); const map = this.cache(); const out: Gif[] = []; for (const id of ids) { const g = map.get(id); if (g) out.push(g); } return out; })` — deriva la lista visibile dagli ID correnti + cache.
- [ ] Task 4: Metodo `hydrate()`:
  - Calcola `missing = [...favoriteIds()].filter(id => !cache().has(id))`.
  - Se `missing.length === 0` → nessun fetch, esci.
  - `loading.set(true); error.set(null);`
  - Chiama `apiService.getGifsByIds({ api_key: environment.giphyApiKey, ids: missing.join(',') })`.
  - `next`: costruisci nuova mappa `new Map(cache())`, inserisci ogni `gif` da `response.data` per il suo `id`, aggiorna `cache.set(newMap)`; `loading.set(false)`.
  - `error`: `error.set('Impossibile caricare i preferiti.'); loading.set(false);`.
- [ ] Task 5: Effect di reazione: `effect(() => { const ids = this.favoriteIds(); this.hydrate(); })`. L'effect scatta a ogni cambio di `favoriteIds` (inclusa l'inizializzazione) e chiama `hydrate`, che è idempotente grazie al filtro `missing`.
- [ ] Task 6: Handler `onFavoriteToggled(id: string)`:
  - `this.storage.remove(id);` (nel contesto Preferiti il click sul cuore è sempre una rimozione — l'ID è per definizione già preferito).
  - Rimozione ottimistica implicita: `favoriteIds` cambia → `visibleGifs` (computed) si aggiorna automaticamente. Non serve rimuovere manualmente dalla cache (può restare, occupa poco).
- [ ] Task 7: Template `favorites-page.html`:
  - `@if (error())` → `<p role="alert" class="favorites__error">{{ error() }}</p>`.
  - `@else if (loading() && visibleGifs().length === 0)` → `<p role="status" aria-live="polite">Caricamento…</p>`.
  - `@else if (favoriteIds().size === 0)` → empty state accessibile: `<section role="status"><h2>Nessun preferito</h2><p>Non hai ancora salvato nessuna GIF. Torna alla Lista GIFs e clicca il cuore per aggiungerne.</p></section>`.
  - `@else` → `<app-gif-grid [gifs]="visibleGifs()" [favoriteIds]="favoriteIds()" [loading]="loading()" emptyMessage="Nessun preferito" (favoriteToggled)="onFavoriteToggled($event)" />`.
- [ ] Task 8: Stili (`favorites-page.css`): stesso layout della Lista GIFs (margini, spacing dal design system), heading dell'empty state con `--font-headline-md`, testo con `--color-on-surface-variant`.
- **Validazione:** Con storage vuoto la vista mostra l'empty state; aggiungendo un ID a mano in `localStorage` (`["xTiTnFZL3n8UM"]`) e ricaricando, il tab mostra la GIF corrispondente.

### Step 3: Integrazione nella shell `AppComponent`

- [ ] Task 1: In [src/app/app.ts](src/app/app.ts) aggiungere `FavoritesPageComponent` agli `imports`.
- [ ] Task 2: In `app.html`, sostituire il placeholder del ramo `@else` con `<app-favorites-page />`.
- [ ] Task 3: Verificare che passando dal tab "Lista GIFs" al tab "Preferiti":
  - Il `FavoritesPageComponent` viene istanziato (o rimane vivo se si scegliesse `@switch` con `case`; in ogni caso il comportamento deve essere corretto).
  - L'effect di hydration parte e recupera le GIF mancanti.
- **Validazione:** Sequenza end-to-end funziona:
  1. Da "Lista GIFs" cliccare il cuore su 3 GIF.
  2. Passare a "Preferiti" → si vedono le 3 GIF.
  3. Refresh della pagina (F5) → tornando su "Preferiti" le 3 GIF sono ancora presenti.
  4. Cliccare il cuore su una GIF nel tab Preferiti → sparisce immediatamente dalla griglia; `localStorage` contiene solo 2 ID.
  5. Tornare su "Lista GIFs" → la GIF rimossa non ha più il cuore attivo.

### Step 4: Rifinitura UX e accessibilità

- [ ] Task 1: Aggiungere un titolo `<h1>Preferiti</h1>` in cima alla pagina, coerente con la scala tipografica `--font-headline-lg`.
- [ ] Task 2: Verificare focus management: entrando nel tab "Preferiti" il focus rimane sul bottone del tab (comportamento tastiera dei tab pattern WAI-ARIA); il contenuto della pagina è raggiungibile con Tab.
- [ ] Task 3: Passare Axe DevTools sulla pagina Preferiti in tutti gli stati (empty, loading, popolato, errore simulato disconnettendo la rete).
- **Validazione:** 0 violazioni AA su tutti gli stati; heading semantico corretto; contrasto testo empty-state ≥ 4.5:1.

## 5. Criteri di Successo Finali

- [ ] Il tab "Preferiti" mostra solo le GIF i cui ID sono in `localStorage` sotto `giphy:favorites`.
- [ ] L'apertura del tab (o il cambio di `favoriteIds`) triggera **una sola** chiamata `getGifsByIds` per gli ID mancanti in cache; non ci sono chiamate ridondanti al ritorno sul tab.
- [ ] `NgOptimizedImage` non è usato per le GIF (URL remoti animati), coerentemente con il PRP #1.
- [ ] La rimozione dal cuore aggiorna immediatamente sia la griglia visibile sia `localStorage`; non serve refresh manuale.
- [ ] I preferiti sopravvivono al refresh della pagina.
- [ ] Empty state, loading state ed error state sono presenti e accessibili (`role="status"` / `role="alert"`).
- [ ] Nessuna dipendenza diretta da `localStorage` dentro `FavoritesPageComponent` — tutta la logica passa dal `StorageService`.
- [ ] Nessun uso di `NgModule`, `*ngIf`/`*ngFor`, `ngClass`/`ngStyle`, `@HostBinding`/`@HostListener`, `any` non giustificato, `mutate` su signal.
- [ ] `ng build` termina senza errori.
- [ ] Requisito globale (dai due PRP combinati): l'applicazione naviga tra "Lista GIFs" e "Preferiti" senza ricaricare la pagina, la ricerca/paginazione funzionano, i preferiti persistono nel `localStorage`.
