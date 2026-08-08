# Wordfeud Ordmaskine

En selvstændig HTML-side der foreslår de bedste ord ud fra de bogstaver, du har til rådighed i Wordfeud. Kører 100 % i browseren — ingen server, ingen build-trin, ingen data sendes nogen steder.

## Brug

Åbn `index.html` i en browser (dobbeltklik virker fint, ingen server påkrævet).

1. **Bogstaver på hånden** – skriv dine op til 7+ bogstaver, fx `sternly`. Brug `?` eller `*` for en joker (blank brik).
2. **Mønster på brættet** (valgfrit) – hvis du vil bygge videre på et bogstav der allerede ligger på brættet, skriv fx `__a_e_` hvor `_` er felter der skal udfyldes fra din hånd, og bogstaverne er dem der allerede ligger der.
3. Justér evt. min./maks. ordlængde, eller slå "kun ord der bruger alle bogstaver" til for at finde bonus-udtømninger.
4. Tryk **Find bedste ord**. Resultaterne sorteres efter point som standard (kan skiftes til længde eller alfabetisk).

Bogstavværdierne (point pr. bogstav) kan justeres under "Bogstavværdier (avanceret)" og gemmes automatisk i browseren, hvis din udgave af spillet afviger fra standardtabellen.

## Hvordan det virker

- **Ordbog**: ca. 479.000 danske bøjningsformer, afledt af [Den Danske Ordbogs fuldformsliste](https://korpus.dsl.dk/resources/details/ddo-fullforms.html) (DSL), via [n0kovo/danish-wordlists](https://github.com/n0kovo/danish-wordlists). Ord med `q`/`w` er fjernet, da disse bogstaver ikke findes som brikker i dansk Wordfeud. Dette er **ikke** identisk med Wordfeuds officielle, proprietære ordliste (den er ikke offentligt tilgængelig) — brug forslagene som stærk rettesnor, ikke som facitliste.
- **Point**: hvert ords grundværdi beregnes som summen af bogstavværdierne for de brikker, du selv lægger (jokere tæller 0 point, uanset hvilket bogstav de erstatter). Den faktiske score i spillet afhænger desuden af bonusfelter (dobbelt/tredobbelt bogstav/ord) på brættet, som maskinen ikke kender noget til.
- **Matching**: for almindelig søgning findes alle ordbogsord, hvis bogstaver er en delmængde af hånden (blanke brikker dækker manglende bogstaver). For mønster-søgning skal ordet have samme længde som mønsteret, matche de faste bogstaver præcist, og de åbne felter skal kunne dækkes af hånden.

## Filer

- `index.html` — hele applikationen, inkl. ordbog (genereret fil, se nedenfor — redigér ikke ordbogs-blokken i hånden).

## Gendan/opdatér ordbogen

Ordbogen i `index.html` er genereret fra en kildefil med ét ord pr. linje. For at opdatere:

1. Hent/opdatér kildeordlisten (`ddo_fullforms.txt` fra n0kovo/danish-wordlists).
2. Filtrér til kun `a-zæøå`, længde 2–15, og fjern ord med `q`/`w`.
3. Kør et lille script der JSON-encoder ordlisten (adskilt af `\n`) og indsætter den i `DICT_RAW`-konstanten i `<script>`-blokken i `index.html`.

## Begrænsninger

- Ordbogen er en tilnærmelse (se ovenfor) — nogle sjældne/regionale Wordfeud-ord kan mangle, og enkelte ord i listen er muligvis ikke gyldige i selve spillet.
- Point er grundværdi uden hensyn til brættets bonusfelter.
- Der er ingen bræt-simulering (du kan ikke se hele brættet) — kun mønster-baseret matching på ét ord ad gangen.
