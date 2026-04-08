# human-centered-design

Deze website is gemaakt als eindopdracht voor het vak: Human Centered Design (HCD).
Mijn opdracht is om een website te maken voor Berend, hij werkt bij een startup die zich bezighoudt met indoor navigatie en hij is ervaringsprofessional bij Stichting Accessibility. Berend is ook blind en gebruikt een screenreader om het web te navigeren.

## checkout maandag 30-3-2026 

Vandaag ben ik begonnen met onderzoek naar mogelijkheden op het web waar ik een praktische website mee kan maken voor Berend.
Ik twijfelde in het begin tussen de Nuance opdracht en de Spraakbericht opdracht. Uiteindelijk heb ik de CSS speech module gevonden en wilde ik dit gebruiken bij de Nuance opdracht. Deze module was helaas alleen supported op safari, waar geen nieuwe versies meer op windows van beschikbaar zijn. En omdat ik nu nog niet weet welke browser Berend gebruikt, heb ik er voor gekozen om tóch de spraakbericht opdracht te doen.

Hiervoor heb ik vandaag alvast een recorder gemaakt, deze kan je microfoon opnemen. Wanneer de recorder stopt maakt hij een html audio element aan en laat deze op de pagina zien.

Ook heb ik met behulp van AI een audio cutter gemaakt. Deze cutter pakt een audio element, een starttijd en een eindtijd en maakt hier een nieuw audio element van. Dit kan heel handig zijn wanneer iemand wil reageren op een klein fragment van de spraakmemo.

<img src="./public/images/Schermafbeelding 2026-03-30 153732.png">

Met het vooronderzoek ben ik 2.5 uur bezig geweest, en met het ontwikkelen van de website ben ik ook 2.5 uur bezig geweest.

## dinsdag 31-3-2026

Het doel van de test is dat de testpersoon een spraakbericht kan afspelen en deze kan trimmen naar hoe hij/zij wilt.

Wat vond je fijn aan de website?

Waren er momenten tijdens de test die je onzeker of verward maakte over de website?

Heb je het gevoel alsof je clues of dingen hebt gemist?

### Bevindingen tijdens user test

- Datum is fijner om helemaal uit te schrijven, anders is het lastig om te visualiseren welke datum het is.

- Zorg dat bijzaken zoals datum geen hoofdonderdeel is (denk aan short content platform voorbeeld)

- Spraakopname stop/start op dezelfde knop.

- Nadat iets gelukt is een geluidje of iets wat aangeeft start of stop.

- Maak dingen zo minimalistisch mogelijk. anders zijn het alleen maar extra knoppen waar hij doorheen moet.

- Op spatie of enter zodat je hem kan stoppen waarna je gelijk daarop kan reageren.

- Misschien handig om vanaf het afspelen van het spraakbericht op 'enter' te kunnen klikken en dat dan als start positie te gebruiken.

- Wat als het een spraakmemo van 20min is? Misschien standaard 10 seconden terug draaien als start, waarna de gebruiker nog terug of verder kan navigeren.

- 4 grote screenreaders nvda gratis gebruiken de meeste mensen

- talkback op zijn telefoon, gebruikt vooral laptop telefoon. Ik zou mijn spraakberichten opdracht juist baseren op whatsapp en voorkeur signal.

- Gebruikt meer typen dan spraakberichten, met een braille toetsenbord. Zou graag spreekberichten terug willen opzoeken.

Voor de volgende iteratie wil ik het mogelijk maken om de spraakopname te pauzeren door weer op dezelfde knop te drukken. 
Ook wil ik een sneltoets maken zodat je vanaf dat punt in kan springen en je eigen spraakmemo kan opnemen als reactie op wat er wordt gezegd in de spraakmemo. 

Ik twijfel nog over de werking, ik wil namelijk:

- Of je scrollt terug naar het begin van het stuk waar je op wilt reageren, NADAT je jouw eigen reactie hebt opgenomen.

- Of je hoeft geen begin te selecteren en je krijgt in het originele spraakbericht een 'ping' sound waarbij je op een sneltoets kan drukken om de reactie te beluisteren.

- Of je krijgt helemaal geen mark van waar je in het spraakbericht reageert, je kunt gewoon de spraakopname pauzeren om een spraakopname op te nemen.

Verder is het wel een MUST dat er een sound cue komt wanneer je begint en eindigt met opnemen.

## Checkout donderdag 2-4-2026
Ik denk dat ik voor deze optie ga: 

- Of je hoeft geen begin te selecteren en je krijgt in het originele spraakbericht een 'ping' sound waarbij je op een sneltoets kan drukken om de reactie te beluisteren.

Dat je een mark krijgt die automatisch 10 seconden teruggaat, zodat degene die het weer terugluistert genoeg context krijgt waar het over gaat, maar het niet te lang duurt voordat je de reactie hoort.

## Test dinsdag 7-4-2026 

Voor de volgende keer nadenken over de specificity die zijn screenreader gebruikt bij leestekens.

Maak het duidelijker dat er onder een knop is voor de spraakberichten.

Zoek een andere sneltoets, evt alt+shift+d.

Voeg een geluidje toe wanneer er wordt opgenomen.

Ga 10 sec terug in de tijd, dit kan de gebruiker nog aanpassen.

Maak knoppen grooot en in het midden. Zorg ervoor dat knoppen veel contrast hebben.

Maak ook het lettertype groter.

Lichte kleuren gebruiken of randen dikker maken om dingen te arceren.