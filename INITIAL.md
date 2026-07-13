## FEATURE: Giphy SPA con Tab, Ricerca, Paginazione e Preferiti

Sviluppa una Single Page Application in Angular con le seguenti specifiche:

1. **Navigazione a Tab:** - La pagina principale deve contenere un header con due tab: "Lista GIFs" e "Preferiti".
   - Il componente principale deve gestire uno stato (tramite Signals) per mostrare l'uno o l'altro contenuto.

2. **Tab "Lista GIFs":**
   - Implementa una barra di ricerca in cima.
   - Chiama l'endpoint `/search` dell'API di Giphy (se c'è testo nella barra) oppure `/trending` (se la barra è vuota).
   - **Paginazione:** Mostra un numero limitato di GIF per pagina (es. 20). Aggiungi pulsanti "Avanti" e "Indietro" alla fine della griglia per scorrere i risultati aggiornando i parametri `offset` e `limit` della chiamata API.
   - Ogni GIF nella griglia deve avere un'icona a forma di "Cuore" in sovrimpressione che l'utente può cliccare per aggiungerla o rimuoverla dai preferiti.

3. **Tab "Preferiti":**
   - Questa vista mostra solo le GIF contrassegnate con il cuore.
   - L'applicazione deve salvare le preferenze nel `localStorage` memorizzando esclusivamente gli ID delle GIF (non l'intero payload).
   - Quando si apre il tab, il servizio deve leggere gli ID dal `localStorage` e fare una chiamata all'endpoint di Giphy (Get GIFs by ID) per recuperare i media aggiornati.
   - Anche in questo tab deve essere possibile cliccare sul cuore per rimuovere la GIF.

## ARCHITETTURA RICHIESTA:
- **Servizi API (Autogenerati):**
  - NON creare un servizio per le chiamate HTTP a Giphy. Utilizza i servizi e i modelli che sono già stati generati automaticamente nella cartella `src/connectors/giphy`.
  - Esamina la cartella `src/connectors/giphy/services` per capire quali classi iniettare (es. basandoti sugli operationId `searchGifs`, `getTrendingGifs`, `getGifsByIds`).
- **Servizi Locali:**
  - `StorageService`: Incapsula la logica di lettura/scrittura sul `localStorage` per gestire i preferiti.
- **Componenti:**
  - `TabsComponent`: Gestisce lo switch delle viste.
  - `GifGridComponent`: Componente UI "dumb" riutilizzabile che prende in `@Input()` un array di GIF ed emette eventi tramite `@Output()` quando si clicca il cuore.
  - `SearchbarComponent`: Gestisce l'input testuale.

## OTHER CONSIDERATIONS:
- **Gestione API Key:** Per tutte le chiamate all'API di Giphy, non hardcodare la chiave nel servizio. Importa l'oggetto `environment` da `src/environments/environment` e utilizza `environment.giphyApiKey` per valorizzare il parametro `api_key` richiesto dagli endpoint.- Implementa sempre uno stato di loading (testo "Caricamento..." o spinner) mentre l'API risponde.
- Gestisci gli "empty states" (es. "Nessuna GIF trovata per questa ricerca" oppure "Non hai ancora salvato nessun preferito").

## DOCUMENTATION:
- Tutto il codice di connessione e le interfacce TypeScript sono già stati generati automaticamente nella cartella `src/connectors/giphy`.
- La configurazione del generatore si trova nel file `ngopenapi-giphy.json`.
- **CRITICO per l'Agente:** Non cercare file YAML esterni. Ispeziona direttamente i file dentro `src/connectors/giphy/models` e `src/connectors/giphy/services` per importare le interfacce e i metodi corretti (come i modelli per le GIF, la paginazione e i servizi per le chiamate).

## UI/UX & MOCKUPS:
- L'interfaccia deve essere costruita estraendo il design direttamente da Figma tramite il tuo tool MCP.
- **URL Figma da analizzare:**
  - Layout Principale (Tab "Lista GIFs"): `https://www.figma.com/design/m55WxynwtlfINws7cdd4ab/Untitled?node-id=1-2&t=VupFN6NmxXO8QaHE-4`
  - Layout "Preferiti": `https://www.figma.com/design/m55WxynwtlfINws7cdd4ab/Untitled?node-id=2-3&t=VupFN6NmxXO8QaHE-4`,
  utilizzando il tool get_design_context ma **adattalo rigorosamente** ai pattern di Angular (componenti isolati, incapsulamento CSS, ecc.). NON copiare l'HTML nudo e crudo.
- **`DESIGN.md`**: Usa questo file per configurare le variabili CSS globali (es. nel file `styles.css` globale) prima di stilizzare i singoli componenti.
