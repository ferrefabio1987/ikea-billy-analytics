# IKEA Billy Analytics

IKEA Billy Analytics è uno strumento progettato per raccogliere e analizzare i prezzi dei prodotti della linea Billy di IKEA da diversi paesi, consentendo di confrontare le variazioni di prezzo e ottenere approfondimenti utili.

## Caratteristiche
- Estrazione automatica dei prezzi dai siti IKEA di vari paesi
- Confronto dei prezzi per il prodotto Billy
- Esportazione dei dati in formato CSV per ulteriori analisi
- Facile configurazione e utilizzo con comandi standard

## Requisiti
- Node.js (v14 o successivo)
- npm o yarn installato

## Installazione
Clona questa repository e installa le dipendenze necessarie:

```bash
# Clonare il repository
$ git clone https://github.com/tuoaccount/ikea-billy-analytics.git
$ cd ikea-billy-analytics

# Usare npm
$ npm install

# Oppure usare yarn
$ yarn
```

## Uso
Il file principale dell'applicazione è `index.mjs`. Puoi eseguire il progetto con i seguenti comandi:

```bash
# Avvio del progetto con npm
$ npm start

# Avvio del progetto con yarn
$ yarn start
```

## Configurazione

Il progetto supporta l'uso di variabili di ambiente tramite un file .env. Assicurati di creare un file .env nella directory principale con le seguenti variabili:

```bash
API_KEY_EXCHANGE_RATES=Chiave di exchange rates api
```

## Contribuire
Se desideri contribuire:
1. Fai un fork del progetto
2. Crea un branch per le tue modifiche (`git checkout -b feature/nome-feature`)
3. Esegui un commit delle modifiche (`git commit -m 'Aggiunta nuova feature'`)
4. Esegui un push del branch (`git push origin feature/nome-feature`)
5. Apri una pull request

## Licenza
Questo progetto è distribuito sotto la licenza MIT. Vedi il file `LICENSE` per maggiori dettagli.

---
Con IKEA Billy Analytics, esplora il mondo dei prezzi globali dei tuoi scaffali preferiti!


