# Wordfeud Ordmaskine

En selvstændig HTML-side der foreslår de bedste ord ud fra de bogstaver, du har til rådighed i Wordfeud. Kører 100 % i browseren — ingen server, ingen build-trin, ingen data sendes nogen steder.

## Brug

Åbn `index.html` i en browser (dobbeltklik virker fint, ingen server påkrævet).

### Frit forslag (uden bræt)

1. **Bogstaver på hånden** – skriv dine op til 7+ bogstaver, fx `sternly`. Brug `?` eller `*` for en joker (blank brik).
2. **Mønster på brættet** (valgfrit) – hvis du vil bygge videre på et bogstav der allerede ligger på brættet, skriv fx `__a_e_` hvor `_` er felter der skal udfyldes fra din hånd, og bogstaverne er dem der allerede ligger der.
3. Justér evt. min./maks. ordlængde, eller slå "kun ord der bruger alle bogstaver" til for at finde bonus-udtømninger.
4. Tryk **Find bedste ord**. Resultaterne sorteres efter point som standard (kan skiftes til længde eller alfabetisk).

Bogstavværdierne (point pr. bogstav) kan justeres under "Bogstavværdier (avanceret)" og gemmes automatisk i browseren, hvis din udgave af spillet afviger fra standardtabellen.

### Wordfeud-brættet

Under det frie forslag ligger et rigtigt 15×15 Wordfeud-bræt med de faktiske bonusfelter (dobbelt/tredobbelt bogstav og ord).

1. Klik i et felt og skriv de bogstaver der allerede ligger på brættet i dit spil (piletasterne flytter mellem felter). Brættet gemmes automatisk i browseren.
2. Skriv dine bogstaver i "Bogstaver på hånden" ovenfor.
3. Tryk **Find bedste træk på brættet**. Maskinen scanner alle rækker og kolonner for felter der kan udfyldes ud fra dine bogstaver og de eksisterende brikker, og viser de bedst scorende træk — med reel score inkl. bonusfelter, samt hvor på brættet ordet placeres. Hold musen over et forslag for at fremhæve det på brættet.

**Begrænsning**: maskinen tjekker kun, at det trukne ord selv er gyldigt — den tjekker *ikke*, om nye ord der opstår på tværs af trækket (krydsord) også er gyldige. Den finder heller ikke træk der kun rører en eksisterende brik på tværs uden at dele et felt med den. Eksisterende brikker på brættet regnes altid til fuld bogstavværdi, uanset om de oprindeligt blev lagt med en joker.

## Hvordan det virker

- **Ordbog**: ca. 479.000 danske bøjningsformer, afledt af [Den Danske Ordbogs fuldformsliste](https://korpus.dsl.dk/resources/details/ddo-fullforms.html) (DSL), via [n0kovo/danish-wordlists](https://github.com/n0kovo/danish-wordlists). Ord med `q`/`w` er fjernet, da disse bogstaver ikke findes som brikker i dansk Wordfeud. Dette er **ikke** identisk med Wordfeuds officielle, proprietære ordliste (den er ikke offentligt tilgængelig) — brug forslagene som stærk rettesnor, ikke som facitliste.
- **Bræt-layout**: de 15×15 bonusfelter er hentet fra et open source-projekt ([peterheinum/wordfeud-cheat](https://github.com/peterheinum/wordfeud-cheat)) der har genskabt Wordfeuds bræt-geometri fra den rigtige API — denne er ens på tværs af sprog. Bemærk at Wordfeuds bræt (i modsætning til Scrabble) ikke er fuldt symmetrisk, og at centerfeltet ikke giver bonus.
- **Point** (frit forslag): ordets grundværdi, summen af bogstavværdierne for de brikker du selv lægger (jokere tæller 0 point). Ingen hensyn til bræt-bonusser.
- **Point** (bræt): den reelle score inkl. dobbelt/tredobbelt bogstav- og ordfelter for de nyplacerede brikker. Blanke brikker (jokere) tildeles altid den laveste tabte værdi, hvis samme bogstav optræder flere gange i ordet.
- **Matching**: for almindelig søgning findes alle ordbogsord, hvis bogstaver er en delmængde af hånden (blanke brikker dækker manglende bogstaver). For mønster-/bræt-søgning skal ordet matche de faste bogstaver præcist, og de åbne felter skal kunne dækkes af hånden.
- **Bogstavværdier**: er ikke officielt bekræftede for dansk (Wordfeud offentliggør dem ikke), men et velbegrundet bud — justér dem under "avanceret" hvis din udgave afviger.

## Filer

- `index.html` — hele applikationen, inkl. ordbog og bræt-logik (genereret fil, se nedenfor — redigér ikke ordbogs-blokken i hånden).

## Gendan/opdatér ordbogen

Ordbogen i `index.html` er genereret fra en kildefil med ét ord pr. linje. For at opdatere:

1. Hent/opdatér kildeordlisten (`ddo_fullforms.txt` fra n0kovo/danish-wordlists).
2. Filtrér til kun `a-zæøå`, længde 2–15, og fjern ord med `q`/`w`.
3. Kør et lille script der JSON-encoder ordlisten (adskilt af `\n`) og indsætter den i `DICT_RAW`-konstanten i `<script>`-blokken i `index.html`.

## Begrænsninger

- Ordbogen er en tilnærmelse (se ovenfor) — nogle sjældne/regionale Wordfeud-ord kan mangle, og enkelte ord i listen er muligvis ikke gyldige i selve spillet.
- "Frit forslag" viser grundværdi uden hensyn til brættets bonusfelter.
- Bræt-søgningen tjekker ikke krydsord (nye ord der opstår på tværs af trækket), og finder ikke træk der kun rører en eksisterende brik uden at overlappe den.
- Bogstavværdierne er et velbegrundet bud, ikke en officielt bekræftet tabel.
