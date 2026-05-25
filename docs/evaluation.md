# Cyberlingo Evaluation

Dato: 2026-05-25

## Kort dom

Cyberlingo har en sterk start: appen er energisk, mobilvennlig, og har flere moduser som kan gjøre spansk mer levende enn tradisjonell pugging. Den største svakheten var at appen føltes mer som en samling AI-verktøy enn en læringsmotor. For en personlig læringsapp og et mulig SaaS-produkt bør kjernen være:

1. aktiv gjenhenting fra hukommelsen,
2. repetisjon på riktig tidspunkt,
3. samtale i trygge, realistiske situasjoner,
4. tydelig progresjon mot A1/A2/B1/B2,
5. lav friksjon for nye brukere.

Denne runden forbedrer spesielt punkt 1, 2 og 5.

## Det som fungerer bra

- Flere læringsflater: leksjoner, vokabular, verb, fraser, samtale, kamera og AI-assistent.
- God norsk målgruppevinkel: forklaringer og tips er skrevet for nordmenn.
- Tydelig gamification: XP, streak, nivåer og prestasjoner gir motivasjon.
- Stripe Checkout og Customer Portal er riktig retning for abonnement.
- Appen bygger rent med Vite.

## Kritiske svakheter før endring

- API-nøkkel var en hard inngangsport. Det gjør produktet vanskelig å teste, dele og selge.
- Gratisoppgaver ble brukt ved navigasjon, ikke ved faktisk AI-bruk.
- Læring var for lite adaptiv: appen visste ikke hvilke ord/setninger brukeren burde repetere i dag.
- Mye innhold ble generert først når brukeren trykket, som gir ventetid, kostnad og ustabilitet.
- Fremgang lagres lokalt, ikke i en konto/database. Det er ikke SaaS-klart.
- Admin-tilgang er basert på en hardkodet e-post i klient/API. Det må erstattes med ekte auth/roller.
- Stripe-verifisering skjer uten webhook-basert sannhetskilde. Det holder for prototype, ikke produksjon.

## Endringer implementert

- Lagt til en ny `DailyPracticeMode` med 8-korts daglig treningsøkt.
- Lagt til lokal `practiceDeck` med A1/A2/B1-kort for fraser, verb, grammatikk og høyfrekvente uttrykk.
- Lagt inn enkel spaced repetition per bruker i `localStorage`.
- Appen kan nå brukes uten API-nøkkel; AI-nøkkel etterspørres først når en AI-funksjon faktisk brukes.
- "Fortsett uten AI-nøkkel" sender brukeren tilbake til en brukbar offline startflate.
- AI-funksjoner har nå en felles tilgangssjekk fra appnivå.
- Hjem-skjermen prioriterer "Dagens treningsøkt" som beste start.

## Læringsprodukt: neste beste forbedringer

- Gjør daglig økt til hovedløkken: 5 min repetisjon, 5 min nytt stoff, 5 min samtale.
- Legg inn feilprofiler for nordmenn: ser/estar, por/para, kjønn/artikler, rulle-r, gustar, preteritum/imperfecto.
- Lag "kan gjøre"-mål per CEFR-nivå, ikke bare XP.
- Bytt fra "mester ved 100% quiz" til mestring over tid: riktig svar flere dager på rad.
- Bruk samtaler som oppdrag: kafe, hotell, lege, leilighet, jobb, small talk, dating, konflikt.
- Gi mikrokorrigering: én feil, én bedre formulering, én ny setning å prøve.

## SaaS: neste beste forbedringer

- Flytt brukerdata fra `localStorage` til database, for eksempel Supabase eller Postgres.
- Bruk ekte autentisering med e-postlenke/OAuth.
- Ikke be betalende kunder om egne AI-nøkler. Bruk server-side AI-kall med rate limits og kostnadskontroll.
- Legg inn Stripe webhooks for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` og betalingsfeil.
- Knytt Stripe customer/subscription til en intern user-id, ikke bare klientdata.
- Gjør admin API-ene rollebaserte og server-verifiserte.
- Innfør analytics for activation, day-1 retention, weekly retention, conversion og churn.
- Code-splitt AI-/kamera-/admin-moduler for mindre initial bundle.

## Teknisk status

- `npm run build` passerer.
- `npm audit --omit=dev` viser 0 produksjonssårbarheter.
- Full `npm audit` viser fortsatt dev/Vercel-verktøy-sårbarheter via `@vercel/node`. `npm audit fix --force` foreslår en breaking downgrade til `@vercel/node@4.0.0`, så det bør vurderes separat.
- Vite rapporterer bundle over 500 kB. Dette er ikke akutt, men bør løses med dynamiske imports før lansering.
