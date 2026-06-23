# Corfù · Confronto alloggi 🏖️

App **mobile-first** per confrontare case vacanza a **Corfù** in base alla
posizione e ai servizi nei dintorni (spiagge, ristoranti, supermercati,
farmacie, fermate bus, porti/aeroporti…).

Pensata per una coppia che deve scegliere la casa migliore: incolli il link
di un annuncio (o inserisci indirizzo / coordinate / punto sulla mappa),
l'app individua la posizione e mostra distanze e tempi verso i punti utili,
permettendo di **salvare e confrontare** più alloggi.

È un **sito statico** pubblicabile gratuitamente su **GitHub Pages**, senza
backend e **senza chiavi API segrete**.

---

## Funzionalità

- **Cerca** — quattro modi per individuare l'alloggio:
  - incollare il link dell'annuncio (Booking, Airbnb, Google Maps…);
  - cercare per indirizzo o nome struttura (geocodifica Nominatim);
  - incollare le coordinate;
  - scegliere/trascinare il punto sulla mappa.
- **Mappa** — marker dell'alloggio e dei POI differenziati per categoria,
  filtri, popup con azioni, pulsante per ricentrare sull'alloggio, apertura
  itinerario in Google/Apple Maps.
- **Vicino** — elenco dei luoghi vicini con distanza in linea d'aria, tempo a
  piedi/in auto, distanza stradale on-demand, e i **punti di riferimento di
  Corfù** (centro, aeroporto, porto, spiagge) con relative distanze. Raggio
  configurabile (500 m, 1, 3, 5, 10 km).
- **Confronta** — alloggi salvati in `localStorage` confrontati in una tabella
  mobile-friendly (zona, distanza dal centro/spiaggia/aeroporto, ristoranti e
  supermercati entro 1 km, note, link). Rinomina ed elimina.
- Interfaccia **in italiano** con switch **EN** (predisposizione i18n).

---

## Stack tecnico

- **Vite + React 18 + TypeScript** — sito statico, build veloce, adatto a Pages.
- **Leaflet + react-leaflet** + **OpenStreetMap** per la mappa.
- **Nominatim** per la geocodifica (con cache e debounce, nel rispetto della
  usage policy).
- **Overpass API** per i punti di interesse (nessuna chiave).
- **OSRM** (server demo pubblico) per la distanza stradale on-demand; in caso
  di indisponibilità si ricade su stime basate sulla distanza in linea d'aria.
- **Vitest** per i test.

Tutte le chiamate esterne sono isolate in `src/services/` per poter sostituire
facilmente i provider. Nessuna chiave API è presente nel repository.

---

## Struttura del progetto

```
.
├── .github/workflows/deploy.yml   # CI/CD: lint, typecheck, test, build, deploy Pages
├── public/404.html                # fallback SPA per GitHub Pages
├── index.html
├── src/
│   ├── components/                 # UI riutilizzabile (mappa, card, nav, filtri…)
│   ├── pages/                      # SearchPage, MapPage, NearbyPage, ComparePage
│   ├── services/                   # chiamate esterne isolate
│   │   ├── http.ts                 #   fetch con timeout, retry, rate limit
│   │   ├── cache.ts                #   cache locale con TTL
│   │   ├── geocoding.ts            #   Nominatim
│   │   ├── overpass.ts             #   POI (OpenStreetMap)
│   │   ├── routing.ts              #   OSRM
│   │   └── linkParser.ts           #   estrazione coordinate dai link
│   ├── lib/                        # logica pura e testabile
│   │   ├── distance.ts             #   haversine, stime, formattazione
│   │   ├── sanitize.ts             #   validazione/normalizzazione input
│   │   ├── metrics.ts              #   metriche di confronto
│   │   ├── mapLinks.ts             #   link a Google/Apple Maps
│   │   └── storage.ts              #   persistenza localStorage
│   ├── hooks/                      # useDebouncedValue, useNearbyPois
│   ├── config/                     # categorie POI e landmark di Corfù
│   ├── context/AppContext.tsx      # stato globale
│   ├── i18n/                       # dizionari it / en
│   └── types/                      # tipi TypeScript condivisi
└── ...config (vite, tsconfig, eslint)
```

I **punti di riferimento di Corfù** sono configurabili in
`src/config/landmarks.ts`; le **categorie** di POI in `src/config/categories.ts`.

---

## Comandi

```bash
npm install        # installa le dipendenze
npm run dev        # avvia il server di sviluppo (http://localhost:5173)
npm run build      # type check + build di produzione in dist/
npm run preview    # anteprima locale della build
npm run lint       # ESLint
npm run typecheck  # controllo dei tipi
npm test           # esegue i test (Vitest)
```

---

## Test

I test coprono la logica critica:

- calcolo e formattazione delle distanze (`distance.test.ts`);
- normalizzazione/validazione di input, URL e coordinate (`sanitize.test.ts`);
- salvataggio, recupero e robustezza dei dati salvati (`storage.test.ts`);
- analisi dei link degli annunci (`linkParser.test.ts`);
- gestione di risposte vuote o non valide delle API (`overpass.test.ts`);
- metriche di confronto (`metrics.test.ts`).

---

## Pubblicazione su GitHub Pages

Il deploy è automatico tramite GitHub Actions (`.github/workflows/deploy.yml`).

1. **Abilita Pages**: repository → *Settings* → *Pages* → *Build and
   deployment* → *Source* = **GitHub Actions**.
2. Fai push sul branch **`main`**: il workflow esegue lint, type check, test,
   build e pubblica la cartella `dist/`.
3. L'app sarà disponibile su
   `https://<utente>.github.io/<repository>/`.

Il `base` di Vite è **relativo** (`./`), quindi l'app funziona correttamente
anche in un sottopercorso senza configurazioni aggiuntive. È comunque possibile
forzare un base path esplicito in fase di build:

```bash
VITE_BASE=/app_corfu/ npm run build
```

Il file `public/404.html` reindirizza alla radice del sito in caso di percorsi
inesistenti (l'app usa una navigazione a schede, senza routing su URL).

---

## Limiti reali nell'estrazione dei dati da Booking.com e Airbnb

L'estrazione automatica dell'indirizzo da **Booking.com** e **Airbnb non è
possibile** da un sito statico:

- i loro URL **non contengono le coordinate** esatte dell'alloggio;
- i siti **bloccano le richieste cross-origin** (CORS) e l'accesso automatico
  ai contenuti;
- la posizione mostrata pubblicamente è spesso **volutamente approssimativa**.

Per questo motivo l'app **non fa scraping** e **non usa proxy** non affidabili:
quando il link non è analizzabile, lo comunica chiaramente e propone i
**fallback** (indirizzo, nome struttura, coordinate, selezione sulla mappa).
I link di **Google Maps** e gli URL che contengono coordinate nei parametri
vengono invece interpretati automaticamente.

---

## Privacy e sicurezza

- Nessuna chiave API segreta nel codice; tutti i servizi usati sono gratuiti e
  senza autenticazione.
- I dati (alloggi salvati) restano **solo nel browser** (`localStorage`).
- Gli input vengono **validati e normalizzati**; gli URL accettano solo
  `http`/`https`.
- Distanze, tempi e punti di interesse sono **stime** basate su dati pubblici
  (OpenStreetMap) e **vanno sempre verificati**.

---

## Attribuzioni

- Dati e mappe © [OpenStreetMap](https://www.openstreetmap.org/copyright) e
  contributori.
- Geocodifica: [Nominatim](https://nominatim.org/).
- Routing: [OSRM](http://project-osrm.org/).
