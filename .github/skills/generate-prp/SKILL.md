---
name: generate-prp
description: 'Genera un PRP (Product Requirements Prompt) granulare e implementation-ready per una singola feature del progetto Giphy-app, seguendo lo stile e la struttura del template dei PRP /PRPs/templates/prp_base.md. USA QUANDO: l''utente chiede di "scrivere un PRP", "generare un PRP", "creare piano di implementazione", "preparare la spec di una feature", "next PRP", "prossimo PRP", o menziona una nuova feature da progettare prima di scrivere codice. Il PRP prodotto è auto-contenuto, cita file specifici del repo con link cliccabili, definisce step atomici con validazione, e rispetta i vincoli di .github/copilot-instructions.md. NON USARE PER: implementare direttamente codice (i PRP servono a pianificare, non a scrivere codice); modifiche minori a un PRP esistente (editare direttamente il file).'
argument-hint: 'Nome o breve descrizione della feature (opzionale — altrimenti verrà chiesto)'
---

# Generate PRP (Product Requirements Prompt)

Skill workflow per produrre un PRP granulare e coerente con i pattern del progetto Giphy-app. Il PRP risultante è pensato per essere consumato da un agent di implementazione: ogni step è atomico, contiene comandi Angular CLI espliciti dove serve, e termina con un criterio di validazione oggettivo.

## Quando usarla

Attiva questa skill quando l'utente vuole **pianificare** una feature prima di scriverla. Trigger tipici:
- "genera il PRP di ..."
- "scrivi il prossimo PRP"
- "prepara la spec per la feature X"
- "voglio pianificare la feature Y"

**NON** usarla per implementare codice: il PRP è l'artefatto di pianificazione, non l'implementazione.

## Output atteso

Un file Markdown nuovo in [PRPs/](../../../PRPs/) chiamato `NN-nome-feature-kebab.md`, dove `NN` è il progressivo a due cifre successivo al PRP più recente (es. se esiste `02-preferiti.md`, il nuovo sarà `03-...md`).

Il file deve rispettare **esattamente** la struttura di [PRPs/templates/prp_base.md](../../../PRPs/templates/prp_base.md).

## Procedura

### Step 1 — Raccogli il contesto della feature

1. Se l'utente **ha già indicato** la feature nell'invocazione (argomento), procedi.
2. Se **manca il nome/scope**, chiedi conferma minima con l'ask-questions tool:
   - Qual è il nome breve della feature? (usato per il filename)
   - Riassunto in 1-2 frasi dello scope.
   - Ci sono link Figma o riferimenti visivi?
3. Leggi sempre [INITIAL.md](../../../INITIAL.md): se contiene una sezione o requisiti riferibili alla feature richiesta, usali come fonte primaria di verità.
4. Se la feature è la **prossima naturale** di una serie già iniziata (es. dopo `01-lista-gifs.md`, `02-preferiti.md`), leggi gli ultimi 1-2 PRP esistenti per capire cosa è già implementato e cosa dare per prerequisito.

### Step 2 — Ispeziona il repo per popolare le sezioni tecniche

Prima di scrivere, raccogli i dati che finiranno nel PRP. Esegui questi controlli in parallelo dove possibile:

- **Vincoli architetturali:** leggi [.github/copilot-instructions.md](../../copilot-instructions.md) ed estrai le regole rilevanti alla feature (signals, standalone components, native control flow, `inject()`, accessibilità, ecc.).
- **API & modelli:** ispeziona [src/connectors/giphy/services/](../../../src/connectors/giphy/services/) e [src/connectors/giphy/models/](../../../src/connectors/giphy/models/) per identificare metodi e interfacce da riusare. **Non riscrivere** i connectors autogenerati.
- **Environment / API key:** se la feature fa chiamate API, ricorda che la key va letta da [src/environments/environment.ts](../../../src/environments/environment.ts) come `environment.giphyApiKey`.
- **Storage:** se la feature persiste dati locali, verifica se [src/app/core/storage.service.ts](../../../src/app/core/storage.service.ts) copre già il caso o va esteso. Ricorda i vincoli SSR (`isPlatformBrowser`).
- **Design system:** consulta [docs/DESIGN.md](../../../docs/DESIGN.md) e le variabili CSS globali in [src/styles.css](../../../src/styles.css) per token colore/tipografia/spacing. Non introdurre nuovi valori magic-number: preferisci variabili CSS esistenti.
- **Figma:** se l'utente fornisce URL Figma, prevedi nel PRP l'uso di `get_design_context` per estrarre il layout, adattandolo ai pattern Angular (non copia-incollare HTML).
- **Componenti riusabili:** cerca in [src/app/features/](../../../src/app/features/) componenti "dumb" già esistenti (es. `GifGridComponent`, `SearchbarComponent`) da riutilizzare invece di duplicare.

### Step 3 — Scrivi il PRP

Crea il file `PRPs/NN-nome-feature.md` seguendo il template. Regole di stile **non negoziabili**:

- **Lingua:** italiano .
- **Link relativi:** ogni citazione di file del repo deve essere un link Markdown relativo alla root (es. `[app.config.ts](src/app/app.config.ts)`).
- **Checklist:** ogni task è un item `- [ ]` con verbo d'azione.
- **Step atomici:** ogni Step della sezione 4 deve:
  - avere task granulari e sequenziali,
  - includere comandi `ng generate ...` espliciti quando crea file nuovi,
  - terminare con una riga **`- **Validazione:**`** che descrive come verificare oggettivamente il completamento.
- **Vincoli architetturali:** copia nella sezione 2 i vincoli rilevanti da `copilot-instructions.md` come checklist `- [ ]`, filtrati sulla feature (non tutti — solo quelli pertinenti).
- **API:** nella sezione 3, per ogni servizio autogenerato usato, cita firma, path del file, parametri e tipo di ritorno (`Observable<...>`).
- **Accessibilità:** ogni componente UI deve dichiarare i requisiti ARIA/WCAG AA (aria-label, role, aria-live, focus management se applicabile).
- **Criteri di successo (sezione 5):** requisiti funzionali oggettivi + criteri globali (`ng build` senza errori, 0 violazioni axe AA, nessun uso di `NgModule`/`*ngIf`/`ngClass`/`any`/`mutate`).
- **Prerequisiti:** se la feature dipende da PRP precedenti, aprire lo Step 1 con un check dei prerequisiti da PRP precedenti e istruzione di **fermarsi** se mancanti.

### Step 4 — Verifica finale

Prima di consegnare, verifica che il PRP:

1. Non contenga placeholder residui dal template (`[Copilot: ...]`, `[Nome della Feature]`).
2. Tutti i link relativi puntino a file esistenti nel workspace.
3. Non duplichi logica già coperta da servizi/componenti esistenti (verifica in `src/app/core/` e `src/app/features/`).
4. Rispetti la numerazione progressiva del filename.
5. Sia autoconsistente: un agent che legge **solo** questo PRP + i file citati deve poter implementare la feature senza chiedere chiarimenti.

### Step 5 — Riassunto all'utente

Al termine, invia un messaggio breve con:
- Path del nuovo PRP creato.
- Elenco dei principali file/servizi/componenti riusati vs. nuovi da creare.
- Eventuali ambiguità residue su cui l'utente deve decidere prima dell'implementazione.

## Riferimenti chiave del progetto

- Template PRP: [PRPs/templates/prp_base.md](../../../PRPs/templates/prp_base.md)
- Requisiti feature: [INITIAL.md](../../../INITIAL.md)
- Vincoli architetturali: [.github/copilot-instructions.md](../../copilot-instructions.md)
- Design tokens: [docs/DESIGN.md](../../../docs/DESIGN.md)
- Connectors API: [src/connectors/giphy/](../../../src/connectors/giphy/)

## Anti-pattern da evitare

- **PRP generico** senza citazioni a file specifici del repo → inutile per l'agent.
- **Step non validabili** ("implementa la logica") senza criterio oggettivo.
- **Riscrivere connectors** invece di riusare `ApiService` autogenerato.
- **Inserire codice completo** nel PRP: il PRP descrive *cosa* e *come alto livello*, non contiene l'implementazione riga-per-riga.
- **Ignorare l'accessibilità:** ogni feature UI deve avere una checklist ARIA/WCAG esplicita.
- **Dimenticare i vincoli SSR** quando si tocca `localStorage` o API browser.
