# PRP: [Nome della Feature]

### Design: [Link al design Figma]
[Copilot: Recupera i link dal file INITIAL.md]

## 1. Contesto e Obiettivo
[Copilot: Genera qui un breve riassunto di cosa deve essere costruito basandoti sui requisiti presenti nel file INITIAL.md]

## 2. Architettura & Regole
[Copilot: Leggi il file .github/copilot-instructions.md ed elenca qui i pattern architetturali da rispettare rigorosamente]
- [ ] Pattern di stato (es. uso esclusivo di Angular Signals)
- [ ] Architettura componenti (es. Standalone Components, no NgModule)
- [ ] Regole di UI/UX e styling

## 3. Gestione Dati e API
[Copilot: Ispeziona la cartella src/connectors/giphy ed elenca qui i modelli e i metodi dei servizi autogenerati necessari]
- [ ] **Servizi API:** [I metodi dei servizi autogenerati da usare, es. searchGifs]
- [ ] **Interfacce TypeScript:** [Le interfacce autogenerate da usare per le GIF e la paginazione]
- [ ] **Storage Locale:** [Dettagli su come e dove utilizzare il localStorage]

## 4. Piano di Implementazione Passo-Passo
> **REGOLA PER L'AGENTE:** Ogni step deve essere granulare, sequenziale e indipendente. Specifica sempre i comandi Angular CLI (es. `ng generate ...`) necessari per creare i file.

### Step 1: Generazione Modelli e Interfacce
- [ ] Task 1: Creazione dei file delle interfacce TS.
- [ ] Task 2: ...
- **Validazione:** Assicurarsi che le interfacce non abbiano errori TypeScript.

### Step 2: Sviluppo Servizi e Storage
- [ ] Task 1: ...
- [ ] Task 2: ...
- **Validazione:** Assicurarsi che i servizi siano `providedIn: 'root'` e i metodi HTTP siano tipizzati.

### Step 3: Componenti UI e Layout
- [ ] Task 1: ...
- [ ] Task 2: ...
- **Validazione:** I componenti devono essere visualizzabili a schermo senza errori in console.

### Step 4: Integrazione Logica di Stato (Signals) e API
- [ ] Task 1: ...
- [ ] Task 2: ...
- **Validazione:** Il click sui tab deve aggiornare la vista e le chiamate API devono restituire dati visibili.

## 5. Criteri di Successo Finali
[Copilot: Elenca qui i requisiti funzionali finali che devono risultare completati al 100%]
- [ ] L'applicazione naviga tra "Lista GIFs" e "Preferiti" senza ricaricare la pagina.
- [ ] La ricerca e la paginazione funzionano correttamente.
- [ ] I preferiti sopravvivono al refresh della pagina (localStorage).
- [ ] Il comando `ng build` viene eseguito senza alcun errore.