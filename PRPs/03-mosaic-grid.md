# PRP: Griglia GIF in stile mosaic (proporzioni native)

### Design: rif. [docs/DESIGN.md](docs/DESIGN.md) § "Layout & Spacing" — *Fluid Masonry Grid*

## 1. Contesto e Obiettivo

Il componente [GifGridComponent](src/app/features/gifs/gif-grid/gif-grid.ts) renderizza attualmente ogni GIF in una card con `aspect-ratio: 4 / 3` e `object-fit: cover`, con conseguente **cropping** e **uniformità artificiale** dei tile. Questo contraddice sia il requisito dell'utente ("i rettangoli della lista non siano tutti uguali") sia la direzione del design system che parla esplicitamente di *Fluid Masonry Grid* con "varying GIF aspect ratios" ([docs/DESIGN.md](docs/DESIGN.md)).

Obiettivo del PRP: sostituire il layout uniforme con un **mosaic layout**, in cui:

- Ogni GIF conserva le **proporzioni originali** (`width` × `height` reali forniti dall'API).
- I tile hanno **larghezza di colonna costante** (per densità visiva coerente) e **altezza variabile** derivata dall'aspect ratio.
- Non c'è più cropping (`object-fit: cover` sparisce, l'immagine mostra il contenuto integrale).
- Il layout resta responsive: 2 colonne su mobile, densità maggiore su desktop.
- L'overlay cuore + caption resta ancorato all'immagine anche con altezze variabili.
- Non ci sono layout shifts (CLS): `width`/`height` attributi dell'`<img>` sono valorizzati dalla rendition selezionata, così il browser riserva lo spazio prima del caricamento.

La modifica **è localizzata al solo `GifGridComponent`**, che è dumb: nessun impatto su `GifsListPage`, `FavoritesPage`, `StorageService`. Entrambi i tab (`Lista GIFs` e `Preferiti`) beneficiano automaticamente del nuovo layout perché consumano lo stesso componente.

## 2. Architettura & Regole

Vincoli da [.github/copilot-instructions.md](.github/copilot-instructions.md) pertinenti a questa modifica:

- [ ] **Standalone Components.** Nessun `NgModule`. Non impostare `standalone: true` (default v20+).
- [ ] **Change detection.** Non impostare `OnPush` esplicitamente (default v22+).
- [ ] **Stato con Signals.** Se serve stato locale (es. rendition scelta), usare `signal`/`computed`. Vietato `mutate`.
- [ ] **API dei componenti moderne.** Le `input()`/`output()` esistenti restano invariate: **contratto pubblico immutato** (nessun `favoriteIds`, `gifs`, `loading`, `emptyMessage`, `favoriteToggled` viene aggiunto o rimosso).
- [ ] **Template.** Solo native control flow (`@if`, `@for`); niente `*ngIf`, `*ngFor`, `ngClass`, `ngStyle`. Le classi CSS statiche restano tali, quelle dinamiche stanno già in `[class.is-favorite]`.
- [ ] **Immagini.** Continuare a usare `<img>` standard con URL remoto della GIF. `NgOptimizedImage` **non applicabile** (URL remoti, formato animato, aspect ratio variabile). Attributi `width` e `height` obbligatori per evitare CLS.
- [ ] **Accessibilità AA.**
  - Il reading order DOM resta invariato (le `<li>` sono nell'ordine dell'array `gifs()`); un layout multi-colonna non deve alterare la sequenza logica.
  - Il bottone cuore continua a esporre `aria-pressed` e `aria-label` dinamici.
  - Contrasto caption/heart button ≥ 4.5:1 (nessuna modifica ai colori).
  - Reduce motion: eventuali transizioni di dimensione dei tile devono rispettare `prefers-reduced-motion` (già gestito globalmente in [src/styles.css](src/styles.css)).
- [ ] **Tipi stretti.** Nessun `any`. Le utility per estrarre `width`/`height`/`url` restano tipizzate come oggi (numero finito o `null`).
- [ ] **Design tokens.** Usare esclusivamente variabili CSS di [src/styles.css](src/styles.css) (`--space-*`, `--radius-*`, `--color-*`, `--blur-*`). Nessun magic number nuovo.
- [ ] **Nessuna regressione.** `Searchbar`, paginazione, empty state, loading state e favoriti devono continuare a funzionare senza modifiche.

## 3. Gestione Dati e API

Nessuna nuova chiamata API. La modifica è puramente presentazionale. La scelta della **rendition** è però centrale:

- [ ] **Rendition selezionata:** passare da `images.fixed_height` (200 px di altezza, larghezza variabile → **inadatta** al mosaic a colonne) a `images.fixed_width` (200 px di larghezza, **altezza variabile** → **ideale** per colonne mosaic).
- [ ] **Fallback chain** in caso di rendition mancante:
  `images.fixed_width` → `images.fixed_height` → `images.original` → `''`.
- [ ] **Modelli TypeScript coinvolti (autogenerati, invariati):**
  - [Gif](src/connectors/giphy/models/gif.ts): campo `images?: Images`.
  - [Images](src/connectors/giphy/models/images.ts): `fixed_width`, `fixed_height`, `original` di tipo `ImageRendition`.
  - [ImageRendition](src/connectors/giphy/models/image-rendition.ts): `width?: string`, `height?: string`, `url?: string` (attenzione: i valori numerici sono **stringhe**, vanno convertiti con `Number(...)` come già fatto per le utility esistenti).
- [ ] **Aspect ratio derivato:** dato `w = Number(rendition.width)` e `h = Number(rendition.height)`, l'aspect ratio è `w / h`. Se una delle due dimensioni non è finita o è zero, applicare un fallback ragionevole (`aspect-ratio: 1 / 1`) per non rompere il layout.

## 4. Piano di Implementazione Passo-Passo

> **REGOLA PER L'AGENTE:** Ogni step è granulare e sequenziale. Non passare al successivo se la validazione fallisce.

### Step 1: Verifica prerequisiti

- [ ] Task 1: Confermare che esistono e sono funzionanti:
  - [GifGrid](src/app/features/gifs/gif-grid/gif-grid.ts) con input/output attuali (`gifs`, `favoriteIds`, `loading`, `emptyMessage`, `favoriteToggled`).
  - [GifsListPage](src/app/features/gifs/gifs-list-page/gifs-list-page.ts) e [FavoritesPage](src/app/features/favorites/favorites-page.ts) che consumano `GifGrid`.
  - Design tokens globali in [src/styles.css](src/styles.css).
- [ ] Task 2: Se qualcosa manca, **fermarsi** e completare prima [PRPs/01-lista-gifs.md](PRPs/01-lista-gifs.md) e [PRPs/02-preferiti.md](PRPs/02-preferiti.md).
- **Validazione:** `ng build` corrente termina senza errori; entrambi i tab renderizzano la griglia (anche se ancora uniforme).

### Step 2: Aggiornare le utility di selezione rendition e dimensioni

- [ ] Task 1: In [gif-grid.ts](src/app/features/gifs/gif-grid/gif-grid.ts) rinominare/rifocalizzare le utility di estrazione dati per usare **`fixed_width`** come rendition primaria:
  - `imageUrl(gif)` → fallback chain `fixed_width.url` → `fixed_height.url` → `original.url` → `''`.
  - `imageWidth(gif)` / `imageHeight(gif)` → estrarre da `fixed_width` (invece di `fixed_height`), con stesso pattern `Number(...)` + `isFinite`.
- [ ] Task 2: Aggiungere una nuova utility `aspectRatio(gif: Gif): string` che:
  - Legge `width`/`height` dalla stessa rendition di `imageUrl`.
  - Ritorna `"${w} / ${h}"` come stringa CSS `aspect-ratio` valida se entrambi finiti e > 0.
  - Ritorna `"1 / 1"` come fallback.
- [ ] Task 3: Mantenere invariati tutti gli `input()`/`output()` esistenti: **il contratto pubblico non cambia**.
- **Validazione:** TypeScript compila senza errori (`ng build` verde); i test esistenti (`ng test`) restano verdi (nessun test copre direttamente `GifGrid`, ma la compilazione del componente è parte del build).

### Step 3: Adattare il template al layout proporzionale

- [ ] Task 1: In [gif-grid.html](src/app/features/gifs/gif-grid/gif-grid.html) applicare `[style.aspect-ratio]="aspectRatio(gif)"` **sul contenitore `.gif-card`** (non sull'`<img>`), così l'elemento riserva lo spazio corretto prima del caricamento immagine.
- [ ] Task 2: L'`<img>` deve stare **naturalmente** nel contenitore: gli attributi `[attr.width]` e `[attr.height]` restano valorizzati (double-defense contro il CLS) ma **le CSS rules** cambieranno nello Step 4 in modo che l'immagine occupi il 100% del contenitore senza cropping.
- [ ] Task 3: Verificare che il bottone cuore (`.gif-card__heart`) resti `position: absolute` ancorato al card container (nessun cambio HTML necessario — la modifica è solo CSS nello Step 4).
- [ ] Task 4: **Non** introdurre binding `ngStyle`/`ngClass`: usare esclusivamente `[style.aspect-ratio]` (property binding nativo).
- **Validazione:** Il template compila; la pagina renderizza; ogni card mostra ancora una GIF con il vecchio CSS ma già con la property `style="aspect-ratio: W / H"` visibile in DevTools.

### Step 4: Refactor CSS — mosaic a colonne CSS multi-column

- [ ] Task 1: In [gif-grid.css](src/app/features/gifs/gif-grid/gif-grid.css) sostituire il layout `display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))` della classe `.gif-grid` con un **CSS multi-column layout**:
  - `columns: 240px` (larghezza minima colonna; browser calcola quante colonne stanno in orizzontale) su desktop.
  - `columns: 2` su mobile (`< 640px`) con `column-gap: var(--space-md)`.
  - Rimuovere `display: grid` e `grid-template-columns`.
  - `column-gap: var(--space-lg)` (desktop) / `var(--space-md)` (mobile).
- [ ] Task 2: Sulla classe `.gif-grid__item`:
  - Aggiungere `break-inside: avoid` e `-webkit-column-break-inside: avoid` per evitare che una card venga spezzata tra due colonne.
  - Aggiungere `margin-bottom: var(--space-lg)` (desktop) / `var(--space-md)` (mobile) per creare il gap verticale (i column-gap CSS non spaziano verticalmente).
  - Impostare `display: block` (default nei `<li>`).
- [ ] Task 3: Sulla classe `.gif-card`:
  - **Rimuovere** `aspect-ratio: 4 / 3` (ora impostato inline sul singolo card via `[style.aspect-ratio]`).
  - Mantenere `position: relative`, `border-radius`, `overflow: hidden`, `background`, `border`, `isolation: isolate`.
- [ ] Task 4: Sulla classe `.gif-card__image`:
  - **Sostituire** `height: 100%; object-fit: cover` con `height: 100%; object-fit: contain` — meglio: `width: 100%; height: 100%; display: block; object-fit: cover` **ma** ora il contenitore ha aspect-ratio nativo, quindi `cover` non croppa più (larghezza container = larghezza colonna; altezza container = larghezza × 1/aspect_ratio). In alternativa più semplice e più fedele: `width: 100%; height: auto` con `.gif-card` che diventa `display: block` senza `height` — testare entrambe le varianti; **preferire `width: 100%; height: 100%; object-fit: cover`** perché il contenitore ha già l'aspect ratio giusto e questa combinazione mantiene il rendering coerente anche se il payload non ha `width`/`height` (fallback `1 / 1`).
- [ ] Task 5: Sulla classe `.gif-card__caption` e `.gif-card__heart`: **nessun cambio richiesto**; restano posizionati `absolute` rispetto al card container.
- **Validazione:**
  - Aprire il tab "Lista GIFs" con connessione attiva: le GIF appaiono in un mosaic con altezze variabili, senza cropping.
  - Il tab "Preferiti" mostra lo stesso layout mosaic (riuso automatico del componente).
  - Nessuna GIF viene divisa a metà tra due colonne (verificare visivamente scrollando).
  - Con DevTools → Rendering → *Highlight ads / layout shift regions* non compaiono flash di CLS quando le immagini caricano.

### Step 5: Ricalibrare la responsività

- [ ] Task 1: Definire i breakpoint effettivi:
  - `< 640px` → `columns: 2`.
  - `640px – 1024px` → `columns: 220px` (colonna minima).
  - `> 1024px` → `columns: 240px`.
- [ ] Task 2: Testare a mano il resize della finestra: le colonne devono aumentare/diminuire fluidamente senza produrre buchi di layout.
- [ ] Task 3: Su schermi molto stretti (< 380 px) confermare che 2 colonne restano leggibili (le GIF mantengono un'altezza ragionevole).
- **Validazione:** Resize da 320 px a 1920 px non produce colonne troppo strette (< 140 px) o troppo larghe (> 400 px). Nessun contenuto viene tagliato orizzontalmente.

### Step 6: Verifica accessibilità e stati non-immagine

- [ ] Task 1: Con storage vuoto o ricerca senza risultati, la vista mostra l'empty state centrato (nessun cambio HTML per gli stati loading/empty/error).
- [ ] Task 2: Passare Axe DevTools sulla pagina Lista GIFs con almeno 20 GIF caricate:
  - `aria-pressed` sul cuore riflette lo stato del `Set` preferiti.
  - Reading order screen reader = ordine DOM (verificabile con NVDA / VoiceOver in modalità sequenziale).
  - Focus ring visibile sul cuore (già gestito da `:focus-visible` globale).
- [ ] Task 3: Ripetere la verifica sul tab "Preferiti" con almeno 3 preferiti salvati.
- **Validazione:** 0 violazioni AA su entrambe le pagine; screen reader legge le GIF in ordine.

### Step 7: Validazione build & test

- [ ] Task 1: `ng build` termina senza errori né nuovi warning.
- [ ] Task 2: `ng test --watch=false` mantiene tutti i test attuali verdi (9/9 dai PRP precedenti); nessun test nuovo richiesto perché il contratto pubblico di `GifGrid` è invariato.
- [ ] Task 3: Verifica manuale end-to-end:
  - Ricerca "cat" → mosaic di gatti con aspect ratio variabili.
  - Cuore → aggiunge/rimuove; il tile non cambia dimensione al toggle (l'aspect-ratio è pinnato dal container).
  - Cambio pagina → nuovo mosaic renderizzato, nessun flash di layout uniforme.
- **Validazione:** Tutte le check sopra passano.

## 5. Criteri di Successo Finali

- [ ] Il componente `GifGrid` renderizza le GIF con **aspect ratio proporzionale** alle dimensioni reali fornite dall'API (nessun cropping).
- [ ] Il layout è **multi-colonna mosaic** con densità coerente su mobile (2 colonne) e desktop (colonne di ~240 px).
- [ ] Il **contratto pubblico** del componente (input/output) è **immutato**; nessun consumer (`GifsListPage`, `FavoritesPage`) richiede modifiche.
- [ ] Nessun **layout shift** significativo al caricamento (le card riservano lo spazio via `aspect-ratio` prima del load).
- [ ] Nessuna GIF viene **spezzata** tra due colonne (`break-inside: avoid`).
- [ ] Il **bottone cuore** e la **caption** restano correttamente ancorati alla card anche con altezze variabili.
- [ ] Empty state, loading state, error state e paginazione **continuano a funzionare** identici ai PRP precedenti.
- [ ] Nessun uso di `NgModule`, `*ngIf`/`*ngFor`, `ngClass`/`ngStyle`, `@HostBinding`/`@HostListener`, `any` non giustificato, `mutate` su signal.
- [ ] Nessun magic number CSS: tutti i valori derivano da variabili in [src/styles.css](src/styles.css).
- [ ] `ng build` termina senza errori.
- [ ] `ng test --watch=false` mantiene i 9 test esistenti verdi.
- [ ] Axe DevTools: 0 violazioni AA sui tab "Lista GIFs" e "Preferiti".
