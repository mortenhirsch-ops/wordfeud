# Wordfeud-hjaelper

Dansk Wordfeud-solver, klar til at koere som en rigtig webside (og senere
lægges på et subdomæne, fx wordfeud.hirsch.nu).

## Struktur

- `public/index.html` — selve brugerfladen (bræt, brikker, forslag)
- `src/solver.js` — kerne-logikken: brikvaerdier, bonusfelter, pointberegning
- `assets/da_words.txt.gz` — dansk ordliste (~235.000 ord, udtrukket fra
  Dansk Sprognaevns COR-register — samme kilde Wordfeud selv bruger)
- `assets/blacklist.txt` — enkelte ord der er filtreret fra manuelt
- `server.js` — minimal Express-server: server `public/` statisk og stiller
  en `/api/solve`-endpoint til raadighed, saa browseren ikke skal loese hele
  ordlisten selv

## Koer lokalt

```
npm install
npm start
```

Aabn derefter http://localhost:3000

## Deploy til et subdomaene

Projektet er en almindelig Node/Express-app, saa det kan koere paa:
- En VPS med en reverse proxy (nginx) foran, fx `wordfeud.hirsch.nu`
- Platforme som Render, Railway eller Fly.io (peger bare paa `npm start`)
- Hvis du hellere vil have en ren statisk løsning uden server, kan
  `public/index.html` også køre helt for sig selv (den har al logik
  indbygget) — så skal `/api/solve` blot ikke bruges.

## Opdatere ordlisten senere

Se `assets/blacklist.txt` — tilføj ord her, hvis Wordfeud afviser noget
solveren foreslår.
