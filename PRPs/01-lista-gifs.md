# PRP: Tab "Lista GIFs" — Shell applicativa, ricerca, griglia e paginazione

### Design: [Layout Principale — Figma](https://www.figma.com/design/m55WxynwtlfINws7cdd4ab/Untitled?node-id=1-2&t=VupFN6NmxXO8QaHE-4)

## 1. Contesto e Obiettivo

Costruire lo scheletro della SPA Giphy e il primo dei due tab funzionali ("Lista GIFs"). Questo PRP copre:

- La **shell** dell'applicazione con navigazione a tab ("Lista GIFs" / "Preferiti") gestita interamente via `signal()` (nessun `Router` richiesto: la navigazione è interna al componente).
- La **configurazione dei providers** globali (`HttpClient`, `ApiConfiguration`) necessari a far funzionare i servizi autogenerati in [src/connectors/giphy](src/connectors/giphy).
- Il **design system globale** (variabili CSS derivate da [docs/DESIGN.md](docs/DESIGN.md)) applicate a [src/styles.css](src/styles.css).
- Il tab "Lista GIFs" con: `SearchbarComponent`, `GifGridComponent` (dumb, riutilizzato anche dal tab Preferiti), toggle del cuore per aggiungere/rimuovere dai preferiti, paginazione (`limit=20`, `offset` incrementale), stato di loading e empty state.
- Un `StorageService` (introdotto qui perché il cuore in griglia lo consuma sia in lettura che in scrittura) che espone la lista degli ID preferiti come `signal`.

L'endpoint chiamato dipende dal contenuto della searchbar: `getTrendingGifs` se vuota, `searchGifs` se contiene testo. Entrambe le chiamate ricevono `limit` e `offset` per la paginazione.

## 2. Architettura & Regole

Vincoli da [.github/copilot-instructions.md](.github/copilot-instructions.md) da rispettare rigorosamente:

- [ ] **Standalone Components ovunque.** Nessun `NgModule`. NON scrivere `standalone: true` nei decoratori (default in Angular v20+).
- [ ] **Change detection.** NON impostare `changeDetection: ChangeDetectionStrategy.OnPush` (default in Angular v22+).
- [ ] **Stato solo con Signals** (`signal`, `computed`, `update`/`set`). Vietato `mutate`.
- [ ] **API dei componenti moderne.** Usare le funzioni `input()` e `output()`, mai i decoratori `@Input`/`@Output`.
- [ ] **Dependency Injection funzionale.** Usare `inject()`, mai iniezione via costruttore.
- [ ] **Host bindings** dentro l'oggetto `host` del `@Component`, mai `@HostBinding`/`@HostListener`.
- [ ] **Template pulito.** Solo native control flow (`@if`, `@for`, `@switch`). Vietati `*ngIf`, `*ngFor`, `*ngSwitch`, `ngClass`, `ngStyle`: usare `class`/`style` bindings.
- [ ] **Immagini.** Le immagini animate delle GIF (URL remoti dal payload) sono usate con `<img>` standard. `NgOptimizedImage` è riservato ad asset statici del design system (icone/loghi importati dal progetto).
- [ ] **Tipi stretti.** No `any`, usare `unknown` se necessario. Preferire type inference dove ovvio.
- [ ] **Servizi.** `providedIn: 'root'` per i singleton; il `StorageService` incapsula tutta la logica `localStorage`.
- [ ] **Accessibilità AA.** Il bottone cuore ha `aria-pressed` e `aria-label` dinamici; i tab hanno `role="tablist"`/`role="tab"` + gestione focus da tastiera (frecce ←/→); i pulsanti di paginazione hanno `aria-label` esplicito e `disabled` quando non navigabili.
- [ ] **Styling.** Nessuna dipendenza da framework CSS esterni: variabili CSS globali definite in `styles.css`, effetti glassmorphism e palette da [docs/DESIGN.md](docs/DESIGN.md). Componenti con CSS incapsulato.

## 3. Gestione Dati e API

- [ ] **Servizi API (autogenerati, NON riscrivere):**
  - `ApiService` da [src/connectors/giphy/services/api.service.ts](src/connectors/giphy/services/api.service.ts).
    - `searchGifs(params: SearchGifs$Params)` → `Observable<GifResponse>` — parametri: `api_key`, `q`, `limit?`, `offset?`.
    - `getTrendingGifs(params: GetTrendingGifs$Params)` → `Observable<GifResponse>` — parametri: `api_key`, `limit?`, `offset?`.
  - La `ApiConfiguration` ha già `rootUrl = 'https://api.giphy.com/v1'` (vedi [src/connectors/giphy/api-configuration.ts](src/connectors/giphy/api-configuration.ts)); non serve sovrascriverla.
- [ ] **Interfacce TypeScript (autogenerate, importare come tipi):**
  - `Gif` — [src/connectors/giphy/models/gif.ts](src/connectors/giphy/models/gif.ts) (contiene `id`, `title`, `alt_text`, `images`, ecc.).
  - `GifResponse` — [src/connectors/giphy/models/gif-response.ts](src/connectors/giphy/models/gif-response.ts) (contiene `data: Gif[]`, `pagination`, `meta`).
  - `Pagination` — [src/connectors/giphy/models/pagination.ts](src/connectors/giphy/models/pagination.ts) (`count`, `offset`, `total_count`).
  - `Images` / `ImageRendition` — [src/connectors/giphy/models/images.ts](src/connectors/giphy/models/images.ts), [src/connectors/giphy/models/image-rendition.ts](src/connectors/giphy/models/image-rendition.ts) (per scegliere la rendition da renderizzare, es. `fixed_height.url`).
- [ ] **API Key.** Recuperare `giphyApiKey` da [src/environments/environment.ts](src/environments/environment.ts) tramite `import { environment } from '../../environments/environment'`. NON hardcodare in nessun servizio.
- [ ] **Storage Locale.**
  - Chiave `localStorage`: `giphy:favorites`.
  - Payload salvato: solo `string[]` di ID GIF (JSON-encoded). NON memorizzare l'intero payload della GIF.
  - Il `StorageService` espone: `favoriteIds: Signal<ReadonlySet<string>>`, `isFavorite(id: string): boolean`, `toggle(id: string): void`, `remove(id: string): void`. Ogni scrittura sincronizza `localStorage` in modo idempotente.
  - Accesso a `localStorage` protetto: usare `inject(PLATFORM_ID)` + `isPlatformBrowser()` perché il progetto ha SSR attivo (vedi [src/app/app.routes.server.ts](src/app/app.routes.server.ts)); in ambiente server ritornare `Set` vuoto e no-op sulle scritture.

## 4. Piano di Implementazione Passo-Passo

> **REGOLA PER L'AGENTE:** Ogni step è granulare, sequenziale e indipendente. Sono indicati i comandi Angular CLI dove necessario. Non passare allo step successivo se la validazione dello step corrente fallisce.

### Step 1: Configurazione providers e stili globali

- [ ] Task 1: In [src/app/app.config.ts](src/app/app.config.ts) aggiungere `provideHttpClient(withFetch())` all'array `providers` (mantenere `provideBrowserGlobalErrorListeners()` e `provideClientHydration()`).
- [ ] Task 2: In [src/styles.css](src/styles.css) definire le CSS custom properties globali derivate da [docs/DESIGN.md](docs/DESIGN.md): palette (`--color-surface`, `--color-surface-container`, `--color-primary`, `--color-secondary`, `--color-on-surface`, `--color-outline`, ecc.), scala tipografica (`--font-family: 'Inter', sans-serif;` + variabili per `headline-*` / `body-*` / `label-*`), spacing (`--space-xs/sm/md/lg/xl`), radius (`--radius-sm/md/lg/xl/full`) e ambient glow (`--shadow-glow-primary`).
- [ ] Task 3: Applicare `background: var(--color-surface)`, `color: var(--color-on-surface)`, `font-family: var(--font-family)` a `html, body`. Importare il font Inter da `<link>` in [src/index.html](src/index.html) (`https://fonts.googleapis.com` con `preconnect`).
- **Validazione:** `npm start` avvia senza errori; la pagina ha sfondo scuro `#0b1326` e font Inter caricato correttamente (verificare in DevTools).

### Step 2: `StorageService` per i preferiti

- [ ] Task 1: `ng generate service core/storage --skip-tests=false --project=Giphy-app` (percorso finale: `src/app/core/storage.service.ts`).
- [ ] Task 2: Implementare il servizio con `@Injectable({ providedIn: 'root' })`:
  - Costante privata `STORAGE_KEY = 'giphy:favorites'`.
  - `platformId = inject(PLATFORM_ID)` per branching SSR-safe.
  - Signal privato `#ids = signal<ReadonlySet<string>>(new Set())`; getter `favoriteIds = this.#ids.asReadonly()`.
  - Al costruttore/inizializzazione: se `isPlatformBrowser(platformId)`, leggere e parseare la chiave, popolare il signal.
  - `isFavorite(id)`: legge dal signal.
  - `toggle(id)`: usa `update` per creare un nuovo `Set` (immutabile) aggiungendo/rimuovendo l'ID, poi persiste.
  - `remove(id)`: usa `update` per creare un nuovo `Set` senza l'ID, poi persiste.
  - Metodo privato `persist(set)`: se browser, `localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))`; try/catch silenzioso per quota exceeded.
- [ ] Task 3: Test unitari base (`storage.service.spec.ts`): toggle aggiunge/rimuove, `favoriteIds` è reattivo, in ambiente non-browser tutte le operazioni sono no-op.
- **Validazione:** `npm test` verde per il nuovo spec; nessun errore TypeScript in `strict` mode.

### Step 3: Componente `SearchbarComponent` (dumb)

- [ ] Task 1: `ng generate component features/gifs/searchbar --inline-template=false --inline-style=false`.
- [ ] Task 2: API pubblica del componente:
  - `value = input<string>('')` — valore iniziale del termine.
  - `search = output<string>()` — emesso con debounce di 300ms sull'input.
- [ ] Task 3: Implementazione con Signal Forms (`@angular/forms/signals`) — form con singolo campo `query`. Usare `effect` con `debounceTime` custom (o `setTimeout` gestito in `signal` + `effect` con cleanup) per emettere `search` solo dopo la pausa. In alternativa, se Signal Forms non offrono un debounce nativo, usare un `signal<string>` locale collegato a un `<input>` con `(input)` che aggiorna il signal e un `effect` che pipe il debounce.
- [ ] Task 4: Template: input pill-shaped, `type="search"`, `aria-label="Cerca GIF"`, con icona lente decorativa (`aria-hidden="true"`). Focus ring in `--color-primary`, `backdrop-filter: blur(12px)` sul contenitore glassmorphic.
- **Validazione:** Digitare nel campo emette `search` una sola volta dopo 300ms di inattività; nessun warning axe sul contrasto o sui label.

### Step 4: Componente `GifGridComponent` (dumb, riutilizzabile)

- [ ] Task 1: `ng generate component features/gifs/gif-grid`.
- [ ] Task 2: API pubblica:
  - `gifs = input.required<readonly Gif[]>()`.
  - `favoriteIds = input.required<ReadonlySet<string>>()`.
  - `loading = input<boolean>(false)`.
  - `favoriteToggled = output<string>()` — emette l'`id` della GIF cliccata.
- [ ] Task 3: Template:
  - `@if (loading())` → placeholder "Caricamento…" con `aria-live="polite"` e `role="status"`.
  - `@else if (gifs().length === 0)` → empty state con messaggio passato come `input` opzionale `emptyMessage = input<string>('Nessuna GIF trovata')`.
  - `@else` → griglia CSS (2 colonne mobile, fino a 4 desktop tramite `grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))`). Per ogni GIF:
    - `<img [src]="gif.images?.fixed_height?.url" [alt]="gif.alt_text || gif.title || 'GIF'" loading="lazy">` dentro un contenitore `rounded-2xl` con `overflow: hidden`.
    - Bottone cuore in overlay (`position: absolute; top: var(--space-sm); right: var(--space-sm)`) con `aria-pressed="{{ favoriteIds().has(gif.id!) }}"`, `aria-label` dinamico ("Aggiungi ai preferiti" / "Rimuovi dai preferiti"), classe di stato colorata via `[class.is-favorite]="favoriteIds().has(gif.id!)"`.
    - Click del bottone → `favoriteToggled.emit(gif.id!)`. Fermare la propagazione con `$event.stopPropagation()` se necessario.
- [ ] Task 4: Stili incapsulati: hover mostra overlay glassmorphic con blur, cuore sempre visibile su mobile (no hover), cuore attivo colorato in `--color-secondary` con glow diffuso.
- **Validazione:** Componente si monta in isolamento (test o Storybook) mostrando griglia, loader ed empty state. Axe non segnala violazioni AA.

### Step 5: `GifsListPageComponent` (smart) con fetch, paginazione e stato

- [ ] Task 1: `ng generate component features/gifs/gifs-list-page`.
- [ ] Task 2: Iniettare via `inject()`: `ApiService`, `StorageService`.
- [ ] Task 3: Signals di stato locali:
  - `query = signal<string>('')`.
  - `page = signal<number>(0)` (0-based).
  - `pageSize = 20 as const`.
  - `gifs = signal<readonly Gif[]>([])`.
  - `pagination = signal<Pagination | undefined>(undefined)`.
  - `loading = signal<boolean>(false)`.
  - `error = signal<string | null>(null)`.
  - `offset = computed(() => this.page() * this.pageSize)`.
  - `hasNext = computed(() => { const p = this.pagination(); return !!p && (p.offset ?? 0) + (p.count ?? 0) < (p.total_count ?? 0); })`.
  - `hasPrev = computed(() => this.page() > 0)`.
- [ ] Task 4: Metodo `load()` che decide l'endpoint: se `query().trim() === ''` chiama `getTrendingGifs`, altrimenti `searchGifs`. Entrambe con `api_key: environment.giphyApiKey`, `limit: pageSize`, `offset: offset()`. Su `next`: aggiorna `gifs`, `pagination`, `loading=false`. Su `error`: `error.set('...')`, `loading=false`, `gifs.set([])`. Prima della chiamata: `loading.set(true)`, `error.set(null)`.
- [ ] Task 5: Un `effect(() => { this.query(); this.page(); this.load(); })` (con `allowSignalWrites` se il costruttore lo richiede) per rieseguire il fetch a ogni cambio di query o pagina. Alternativa più esplicita: chiamare `load()` da `onSearch(q)` e `onNext()`/`onPrev()`. **Preferire l'approccio esplicito** per evitare re-fetch involontari durante inizializzazione.
- [ ] Task 6: Handler:
  - `onSearch(q: string)`: `this.query.set(q); this.page.set(0); this.load();`.
  - `onNext()`: `if (this.hasNext()) { this.page.update(p => p + 1); this.load(); }`.
  - `onPrev()`: `if (this.hasPrev()) { this.page.update(p => p - 1); this.load(); }`.
  - `onFavoriteToggled(id: string)`: `this.storage.toggle(id);`.
- [ ] Task 7: Template compone `SearchbarComponent` (in cima), `GifGridComponent` (con `[gifs]="gifs()"`, `[favoriteIds]="storage.favoriteIds()"`, `[loading]="loading()"`, `(favoriteToggled)="onFavoriteToggled($event)"`), e una barra di paginazione sotto con due bottoni: "Indietro" (`[disabled]="!hasPrev() || loading()"`) e "Avanti" (`[disabled]="!hasNext() || loading()"`), con label testuale "Pagina {{ page() + 1 }}".
- [ ] Task 8: `@if (error())` → messaggio d'errore accessibile (`role="alert"`).
- [ ] Task 9: Caricamento iniziale: chiamare `load()` una volta in `ngOnInit` (o in un `constructor` con effect a esecuzione singola). Accettabile un `constructor` che invoca `this.load()`.
- **Validazione:** Aprendo la pagina si vede la lista trending; digitando nella searchbar la lista si aggiorna dopo il debounce; "Avanti"/"Indietro" cambiano `offset`; il cuore aggiorna `localStorage` (verificabile in DevTools → Application → Local Storage → chiave `giphy:favorites`).

### Step 6: Shell applicativa `AppComponent` con navigazione a tab

- [ ] Task 1: Rinominare/aggiornare [src/app/app.ts](src/app/app.ts) per rappresentare la shell. Aggiungere in `imports`: `GifsListPageComponent` (e un placeholder per il futuro `FavoritesPageComponent` — vedi PRP #2).
- [ ] Task 2: Aggiungere signal locale `activeTab = signal<'list' | 'favorites'>('list')` + `computed` `isList = computed(() => this.activeTab() === 'list')`.
- [ ] Task 3: Template `app.html`:
  - `<header>` con logo/titolo "Giphy" e `<nav role="tablist" aria-label="Sezioni Giphy">` contenente due `<button role="tab">` — "Lista GIFs" e "Preferiti" — con `aria-selected` dinamico, `tabindex="0"` per l'attivo e `-1` per l'altro, gestione tasti freccia (handler `onTabKeydown`).
  - `<main>`:
    - `@if (isList())` renderizza `<app-gifs-list-page>`.
    - `@else` renderizza un placeholder temporaneo `<p>Preferiti — implementato nel PRP #2</p>` (verrà sostituito).
- [ ] Task 4: Stili shell: header sticky con `backdrop-filter: blur(20px)`, sottolineatura tab attivo con pill `--color-primary` (non underline), margini laterali `48px` desktop / `16px` mobile.
- **Validazione:** Click sui due tab cambia la vista senza ricaricare la pagina; navigazione da tastiera funziona; nessun errore console; `ng build` completa senza errori.

## 5. Criteri di Successo Finali

- [ ] `provideHttpClient(withFetch())` è registrato in `appConfig`; le chiamate HTTP a `https://api.giphy.com/v1` funzionano.
- [ ] Le variabili CSS globali del design system sono definite in `styles.css` e usate dai componenti.
- [ ] `StorageService` legge/scrive `giphy:favorites` come `string[]`, è SSR-safe e non memorizza mai il payload delle GIF.
- [ ] Il tab "Lista GIFs" carica GIF trending all'avvio e passa a `searchGifs` quando l'utente digita.
- [ ] La paginazione usa `limit=20` e aggiorna `offset` in modo consistente; i bottoni si disabilitano ai bordi.
- [ ] Il cuore su ogni GIF riflette lo stato reale del `StorageService` e persiste dopo un refresh (verificabile aggiornando il tab del browser).
- [ ] Sono presenti stato di loading ("Caricamento…") ed empty state ("Nessuna GIF trovata").
- [ ] Nessun uso di `NgModule`, `*ngIf`/`*ngFor`, `ngClass`/`ngStyle`, `@HostBinding`/`@HostListener`, `any` non giustificato, `mutate` su signal.
- [ ] Axe DevTools: 0 violazioni AA sulla pagina Lista GIFs.
- [ ] `ng build` termina senza errori TypeScript né warning bloccanti.
