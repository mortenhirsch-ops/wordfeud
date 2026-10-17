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
3. Tryk **Find bedste træk på brættet**. Maskinen scanner alle rækker og kolonner for felter der kan udfyldes ud fra dine bogstaver og de eksisterende brikker, tjekker at eventuelle ord der opstår på tværs (krydsord) også er gyldige, og viser de bedst scorende træk — med reel score inkl. bonusfelter og krydsord, samt hvor på brættet ordet placeres. Hold musen over et forslag for at fremhæve det på brættet.
4. Tryk **▶** ud for et forslag for at lægge det på brættet med det samme. Hånden opdateres automatisk (de brugte bogstaver/jokere fjernes), og maskinen søger straks efter det næste bedste træk — så du kan klikke dig igennem flere træk i træk.

De bogstaver maskinen selv har lagt på brættet er tydeligt markeret (teal ramme/baggrund) indtil du spiller et nyt træk. Fortryder du dig, kan du trykke **↺ Fortryd sidste træk** for at rulle det seneste (eller flere i træk) tilbage — brættet og hånden føres tilbage til, som de var, og maskinen søger igen, så du kan prøve et andet forslag. Fortryd-historikken er pr. spil, men gemmes kun i browserens hukommelse (ikke på tværs af genindlæsning af siden).

### Flere spil samtidig

Over brættet kan du skifte mellem flere spil ad gangen — praktisk hvis du har flere Wordfeud-kampe kørende samtidig. Hvert spil husker sit eget bræt og sin egen hånd, og alt gemmes automatisk i browseren.

- **Vælg spil**: dropdown'en skifter mellem dine gemte spil.
- **+ Nyt spil**: opretter et tomt bræt under et nyt navn.
- **Omdøb**: giver det valgte spil et nyt navn.
- **Slet spil**: fjerner det valgte spil (kun aktiv når der er mere end ét).

Data gemmes lokalt i browseren (`localStorage`) — de følger ikke med hvis du åbner siden i en anden browser eller på en anden enhed.

**Begrænsning**: maskinen finder ikke træk der kun rører en eksisterende brik på tværs uden selv at dele et felt med den (den kigger kun på rækker/kolonner der allerede har mindst én brik i sig). Eksisterende brikker på brættet regnes altid til fuld bogstavværdi, uanset om de oprindeligt blev lagt med en joker.

## Hvordan det virker

- **Ordbog**: 213.673 unikke ordformer fra Dansk Sprognævns [COR 1.5.1.0](https://ordregister.dk/), som svarer til Retskrivningsordbogen 5.1 (2025). [Wordfeud oplyser](https://wordfeud.com/dictionaries/), at spillet bruger denne udgave af Retskrivningsordbogen. Listen er filtreret konservativt: kun eksplicit normerede former (`N`), skrevet med små bogstaver, længde 2–15 og kun bogstaver som den eksisterende app understøtter (uden q/w). Egennavne (`prop`), forkortelser (`fork`) og ord registreret som dele af faste udtryk (`iflerord`) udelades, medmindre samme ordform også har en selvstændig tilladt analyse. Tegn, mellemrum og store bogstaver fjernes eller omskrives aldrig for at skabe et ord.
- **Forsigtigt udvalg**: COR-status `K` (ikke eksplicit normeret, fx automatisk dannede genitiver) og `U` (unormeret) udelades. Det kan udelukke ord som faktisk accepteres af Wordfeud, herunder lovlige genitiver og forkortelser. Listen er ikke verificeret ord for ord mod Wordfeuds interne facitliste, så et fuldstændigt match eller nul afvisninger kan ikke garanteres. Den tidligere DDO-liste blandes ikke ind som reserve.
- **Bræt-layout**: de 15×15 bonusfelter er hentet fra et open source-projekt ([peterheinum/wordfeud-cheat](https://github.com/peterheinum/wordfeud-cheat)) der har genskabt Wordfeuds bræt-geometri fra den rigtige API — denne er ens på tværs af sprog. Bemærk at Wordfeuds bræt (i modsætning til Scrabble) ikke er fuldt symmetrisk, og at centerfeltet ikke giver bonus.
- **Point** (frit forslag): ordets grundværdi, summen af bogstavværdierne for de brikker du selv lægger (jokere tæller 0 point). Ingen hensyn til bræt-bonusser.
- **Point** (bræt): den reelle score inkl. dobbelt/tredobbelt bogstav- og ordfelter for de nyplacerede brikker, plus point for eventuelle gyldige krydsord. Blanke brikker (jokere) tildeles altid den laveste tabte værdi, hvis samme bogstav optræder flere gange i ordet.
- **Matching**: for almindelig søgning findes alle ordbogsord, hvis bogstaver er en delmængde af hånden (blanke brikker dækker manglende bogstaver). For mønster-/bræt-søgning skal ordet matche de faste bogstaver præcist, og de åbne felter skal kunne dækkes af hånden.
- **Krydsord**: for hver nyplaceret brik i et bræt-træk tjekker maskinen om der allerede ligger brikker lige over/under (vandret træk) eller til venstre/højre (lodret træk). Hvis der gør, skal det ord der opstår på tværs også findes i ordbogen — ellers bliver hele trækket kasseret. Gyldige krydsord tæller med i trækkets score, ligesom i det rigtige spil.
- **Bogstavværdier**: er ikke officielt bekræftede for dansk (Wordfeud offentliggør dem ikke), men et velbegrundet bud — justér dem under "avanceret" hvis din udgave afviger.

## Filer

- `index.html` — hele applikationen, inkl. ordbog og bræt-logik (genereret fil, se nedenfor — redigér ikke ordbogs-blokken i hånden).

## Gendan/opdatér ordbogen

Kør fra projektmappen med Python 3 (kun standardbibliotek):

```sh
python scripts/update_dictionary.py
python -m unittest discover -s tests
```

Scriptet henter den fast angivne officielle COR 1.5.1.0-fil, filtrerer og opdaterer både `DICT_RAW`, kildeoplysningen på siden og `dictionary-manifest.json`. Manifestet registrerer version, kilde, filterregler, antal og SHA-256 for både kildefilen og ordlisten. Scriptet stopper ved ukendt filformat eller normeringsstatus.

En allerede hentet TSV kan bruges med `python scripts/update_dictionary.py --source /sti/til/cor1.5.1.0.tsv`. Der tilføjes ingen egenkonstruerede bøjningsformer eller ord fra andre ordbøger. Ændring af COR-version kræver en bevidst ændring af kilde og filterkontrol; scriptet skifter ikke automatisk til en ny udgave.

## Begrænsninger

- Ordlisten er et konservativt udvalg fra samme ordbogsudgave som Wordfeud (se ovenfor). Lovlige ord kan mangle, og spillets interne accept er ikke kontrolleret for hvert ord.
- "Frit forslag" viser grundværdi uden hensyn til brættets bonusfelter.
- Bræt-søgningen finder ikke træk der kun rører en eksisterende brik på tværs uden selv at dele et felt med den — kun rækker/kolonner der allerede har mindst én brik, bliver undersøgt.
- Bogstavværdierne er et velbegrundet bud, ikke en officielt bekræftet tabel.
- Krydsord tjekkes mod samme filtrerede ordbog som resten af værktøjet — se begrænsningen ovenfor.
