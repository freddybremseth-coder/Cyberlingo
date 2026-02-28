import { Lesson } from '../types';

export const INITIAL_LESSONS: Lesson[] = [
  // ─── NYBEGYNNER ──────────────────────────────────────────────────────────
  {
    id: '1',
    level: 'Nybegynner',
    category: 'Grammatikk',
    icon: '⚧',
    no: {
      title: 'Substantiv og Kjønn',
      description: 'Lær forskjellen på hankjønn og hunkjønn – nøkkelen til spansk grammatikk.',
      content: `På spansk har substantiver to kjønn: maskulin og feminin. Det er langt enklere enn norsk (som har tre)!

📌 Generelle regler:
• Ord som slutter på -o er vanligvis maskuline: el libro (boken), el perro (hunden)
• Ord som slutter på -a er vanligvis feminine: la casa (huset), la mesa (bordet)
• Artiklene MÅ samsvare: el/un (mask.) vs la/una (fem.)

⚡ Unntak å lære: la mano (hånden) er feminin selv om den slutter på -o.
el problema, el día – maskuline selv om de slutter på -a.

💡 Tips: Lær alltid et nytt ord MED artikkelen: "la mesa", ikke bare "mesa". Hjernen lagrer kjønnet automatisk.`
    },
    ru: {
      title: 'Существительные и Род',
      description: 'Изучите разницу между мужским и женским родом в испанском языке.',
      content: `В испанском языке существительные имеют только два рода: мужской и женский. Это проще, чем в русском!

📌 Основные правила:
• Слова на -o обычно мужского рода: el libro, el perro
• Слова на -a обычно женского рода: la casa, la mesa
• Артикли должны совпадать: el/un (м.р.) vs la/una (ж.р.)

⚡ Исключения: la mano (рука) — женского рода, несмотря на -o.

💡 Совет: Всегда учите слова с артиклем. Мозг запомнит род автоматически.`
    }
  },
  {
    id: '2',
    level: 'Nybegynner',
    category: 'Grammatikk',
    icon: '⚡',
    no: {
      title: 'Verbbøyning i Presens',
      description: 'Forstå hvorfor spansk verb "sier hvem" uten pronomen – og spar ord!',
      content: `I norsk sier vi alltid "jeg spiser, du spiser, han spiser". I spansk endrer verbet seg for hvem som handler – og det er genialt!

📌 -AR verb: HABLAR (å snakke)
• (Yo) hablo – jeg snakker
• (Tú) hablas – du snakker
• (Él/Ella) habla – han/hun snakker
• (Nosotros) hablamos – vi snakker
• (Vosotros) habláis – dere snakker
• (Ellos) hablan – de snakker

⚡ Siden bøyingen er tydelig, dropper spanjolene ofte "yo/tú": "¿Hablas español?" = "Snakker du spansk?"

💡 De tre verbtypene (-AR, -ER, -IR) bøyes litt ulikt, men -AR er vanligst. Lær 5 -AR verb i dag!`
    },
    ru: {
      title: 'Спряжение глаголов в настоящем времени',
      description: 'Почему испанские глаголы "называют" подлежащее без местоимения.',
      content: `В испанском глаголы спрягаются подобно русским. Окончание "говорит" кто действует, поэтому местоимение часто опускается!

📌 Глагол -AR: HABLAR (говорить)
• (Yo) hablo – я говорю
• (Tú) hablas – ты говоришь
• (Él/Ella) habla – он/она говорит
• (Nosotros) hablamos – мы говорим
• (Ellos) hablan – они говорят

💡 Совет: Начните с 5 самых нужных -AR глаголов: hablar, trabajar, comer, vivir, querer.`
    }
  },
  {
    id: '10',
    level: 'Nybegynner',
    category: 'Ordforråd',
    icon: '🔢',
    no: {
      title: 'Tall, Hilsener og Farger',
      description: 'De 50 mest brukte ordene du trenger fra dag 1.',
      content: `Start med de ordene du vil bruke mest. Dette er din "survival kit" for spansk!

📌 Tall 1–10: uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez
📌 11–20: once, doce, trece, catorce, quince, dieciséis, diecisiete, dieciocho, diecinueve, veinte
📌 Ti-tall: treinta (30), cuarenta (40), cincuenta (50), sesenta (60), setenta (70), ochenta (80), noventa (90), cien (100)

💬 Hilsener du MÅ kunne:
• Hola / Buenos días / Buenas tardes / Buenas noches
• ¿Cómo estás? / Bien, gracias / ¿Y tú?
• Por favor / Gracias / De nada / Lo siento
• ¿Cuánto cuesta? / No entiendo / ¿Puede repetir?

🎨 Farger: rojo (rød), azul (blå), verde (grønn), amarillo (gul), blanco (hvit), negro (svart), naranja (oransje)

💡 Lær disse FØR du begynner med grammatikk!`
    },
    ru: {
      title: 'Числа, Приветствия и Цвета',
      description: 'Самые нужные слова для начала общения.',
      content: `📌 Числа 1–10: uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez
📌 11–20: once, doce, trece, catorce, quince, dieciséis, diecisiete, dieciocho, diecinueve, veinte
📌 Десятки: treinta (30), cuarenta (40), cincuenta (50), cien (100)

💬 Приветствия:
• Hola / Buenos días / Buenas tardes
• ¿Cómo estás? / Bien, gracias
• Por favor / Gracias / De nada / Lo siento

🎨 Цвета: rojo (красный), azul (синий), verde (зелёный), amarillo (жёлтый), blanco (белый), negro (чёрный)`
    }
  },
  {
    id: '11',
    level: 'Nybegynner',
    category: 'Grammatikk',
    icon: '📝',
    no: {
      title: 'Adjektivets Plassering og Bøyning',
      description: 'Spansk plasserer adjektivet annerledes – og det MÅ samsvare med kjønn og tall!',
      content: `I norsk: "den røde bil". I spansk: "el coche ROJO" – adjektivet kommer ETTER substantivet.

📌 Adjektiver bøyes i kjønn og tall:
• el libro rojo – de libros rojos (bøker m.)
• la casa roja – las casas rojas (hus f.)

📌 Unntak – noen adjektiver kan komme FØR for å gi spesiell mening:
• "un gran hombre" (en stor/fremragende mann) – kvalitet
• "buen amigo" (en god venn) – "bueno" mister -o foran maskuline ord

💬 Praktisk:
• ¿Dónde está el restaurante bueno? (Hvor er den gode restauranten?)
• Quiero una habitación grande. (Jeg vil ha et stort rom.)

💡 80% av adjektivene følger grunnregelen: adjektiv ETTER substantiv, samsvar i kjønn og tall.`
    },
    ru: {
      title: 'Место и согласование прилагательных',
      description: 'Прилагательные идут ПОСЛЕ существительного и согласуются по роду и числу.',
      content: `📌 Прилагательные согласуются:
• el libro rojo / los libros rojos
• la casa roja / las casas rojas

📌 Исключения (перед существительным):
• "un gran hombre" — великий человек
• "buen amigo" — buenos amigos

💡 Правило: прилагательное ПОСЛЕ существительного, согласовано по роду и числу.`
    }
  },
  {
    id: '12',
    level: 'Nybegynner',
    category: 'Struktur',
    icon: '🏗️',
    no: {
      title: 'Artikler, "Hay" og Spørsmål',
      description: 'Bygg dine første komplette setninger på spansk.',
      content: `Lær de viktigste "byggeklossene" for å danne setninger.

📌 Bestemte artikler:
• el/la (entall), los/las (flertall)
• el libro, la casa, los niños, las mesas

📌 Ubestemte artikler:
• un/una (entall), unos/unas (flertall)
• un café, una cerveza, unos amigos

📌 "Hay" = det finnes/det er:
• Hay una playa cerca. (Det er en strand i nærheten.)
• Hay muchos turistas. (Det er mange turister.)
• ¿Hay wifi aquí? (Er det wifi her?)

📌 Spørsmål – spansk inverterer:
• ¿Tienes hambre? (Er du sulten?) – ikke "Tú tienes hambre?"
• ¿Qué / Cómo / Dónde / Cuándo / Por qué / Cuánto?

💡 Begynn å lage dine egne setninger med disse!`
    },
    ru: {
      title: 'Артикли, "Hay" и вопросы',
      description: 'Строительные блоки первых испанских предложений.',
      content: `📌 Определённые артикли: el/la, los/las
📌 Неопределённые: un/una, unos/unas

📌 "Hay" = есть/существует:
• Hay una playa cerca. / ¿Hay wifi aquí?

📌 Вопросы:
• ¿Qué? / ¿Cómo? / ¿Dónde? / ¿Cuándo? / ¿Cuánto?

💡 Создайте свои первые предложения с этими блоками!`
    }
  },
  {
    id: '13',
    level: 'Nybegynner',
    category: 'Samtale',
    icon: '🗣️',
    no: {
      title: 'Introduser deg selv',
      description: 'Alt du trenger for å presentere deg på spansk fra første dag.',
      content: `Dette er de aller viktigste frasene. Øv disse til du kan dem i søvne!

📌 Grunnleggende introduksjon:
• Me llamo... / Mi nombre es... (Jeg heter...)
• Soy de Noruega / Oslo. (Jeg er fra Norge / Oslo.)
• Tengo 30 años. (Jeg er 30 år.)
• Soy [yrke]: estudiante, médico, ingeniero, profesor, empresario

📌 Hva gjør du?
• Trabajo en... (Jeg jobber i/på...)
• Estudio... (Jeg studerer...)
• Me gusta [infinitiv]: Me gusta viajar / cocinar / aprender español

📌 Lære-fraser:
• Estoy aprendiendo español. (Jeg lærer spansk.)
• No hablo español muy bien todavía. (Jeg snakker ikke spansk veldig godt enda.)
• ¿Puedes hablar más despacio? (Kan du snakke saktere?)

💡 Pro tip: Spanjolene ELSKER det når utlendinger prøver å snakke spansk. Ikke vær redd for å gjøre feil!`
    },
    ru: {
      title: 'Представьтесь по-испански',
      description: 'Всё для первого разговора о себе.',
      content: `📌 Базовое представление:
• Me llamo... / Mi nombre es... (Меня зовут...)
• Soy de Rusia. (Я из России.)
• Tengo 30 años. (Мне 30 лет.)
• Trabajo en... / Estudio... (Я работаю в... / Учусь в...)

📌 О хобби:
• Me gusta viajar / cocinar / aprender español.

📌 Фразы для учёбы:
• Estoy aprendiendo español. (Я учу испанский.)
• ¿Puedes hablar más despacio? (Можешь говорить медленнее?)

💡 Испанцы любят, когда иностранцы говорят по-испански. Не бойтесь ошибаться!`
    }
  },

  // ─── MELLOMNIVÅ ─────────────────────────────────────────────────────────
  {
    id: '4',
    level: 'Mellomnivå',
    category: 'Grammatikk',
    icon: '🔀',
    no: {
      title: 'Ser vs Estar – Den Store Utfordringen',
      description: 'Den viktigste grammatiske forskjellen i spansk – norsk har bare ett "å være".',
      content: `Dette er den største utfordringen for nordmenn. Men det er faktisk logisk!

📌 SER – permanent, identitet, essens:
• Soy noruego. (Jeg er norsk.) – nasjonalitet
• Es médico. (Han er lege.) – yrke
• La silla es de madera. (Stolen er av tre.) – materiale
• Son las tres. (Det er tre.) – tid
• Es alta y delgada. (Hun er høy og slank.) – permanent egenskaper

📌 ESTAR – midlertidig, tilstand, posisjon:
• Estoy cansado. (Jeg er trøtt.) – midlertidig følelse
• Está en Madrid. (Han er i Madrid.) – sted/posisjon
• El café está frío. (Kaffen er kald.) – midlertidig tilstand
• ¿Cómo estás? (Hvordan har du det?) – tilstand

⚡ Klassisk feil:
• "Soy aburrido" = Jeg ER en kjedelig person (permanent egenskap)
• "Estoy aburrido" = Jeg kjeder meg akkurat nå (midlertidig tilstand)

💡 Huskeregel: SER = hvem du ER, ESTAR = hvordan du HAR det.`
    },
    ru: {
      title: 'Ser против Estar – Главная Трудность',
      description: 'Два глагола "быть": постоянное и временное.',
      content: `📌 SER — постоянное, идентичность:
• Soy ruso. — национальность
• Es médico. — профессия
• Es alta. — постоянные качества

📌 ESTAR — временное, состояние, местонахождение:
• Estoy cansado. — усталость сейчас
• Está en Madrid. — местонахождение
• El café está frío. — временное состояние

⚡ Классическая ошибка:
• "Soy aburrido" = я скучный человек
• "Estoy aburrido" = мне сейчас скучно

💡 Правило: SER = кто ты ЕСТЬ, ESTAR = как ты СЕБЯ ЧУВСТВУЕШЬ.`
    }
  },
  {
    id: '17',
    level: 'Mellomnivå',
    category: 'Grammatikk',
    icon: '🔄',
    no: {
      title: 'Preteritum – Det som er ferdig',
      description: 'Fortidsformen for fullstendige, avsluttede handlinger.',
      content: `Preteritum (Pretérito Indefinido) brukes for handlinger som er fullstendig avsluttet i fortiden.

📌 -AR verb (hablar):
• hablé, hablaste, habló, hablamos, hablasteis, hablaron

📌 -ER/-IR verb (comer/vivir):
• comí, comiste, comió, comimos, comisteis, comieron

⚠️ Uregelmessige (MÅ læres):
• ser/ir: fui, fuiste, fue, fuimos, fuisteis, fueron (identisk bøying!)
• tener: tuve, tuviste, tuvo...
• estar: estuve, estuviste, estuvo...
• hacer: hice, hiciste, hizo...

💬 Eksempler:
• Ayer comí paella. (I går spiste jeg paella.)
• El año pasado fui a España. (I fjor dro jeg til Spania.)
• ¿Dónde estuviste? (Hvor var du?)

💡 Legg merke til: Preteritum markerer "ferdig". Bruk det med: ayer, la semana pasada, en 2020.`
    },
    ru: {
      title: 'Претерит – Завершённые действия',
      description: 'Прошедшее время для полностью завершённых действий.',
      content: `📌 -AR: hablar → hablé, hablaste, habló, hablamos, hablaron
📌 -ER/-IR: comer → comí, comiste, comió, comimos, comieron

⚠️ Неправильные (обязательно!):
• ser/ir: fui, fuiste, fue...
• tener: tuve, tuviste...
• estar: estuve, estuviste...

💬 Примеры:
• Ayer comí paella. (Вчера я ел паэлью.)
• ¿Dónde estuviste? (Где ты был?)

💡 Используйте с: ayer, la semana pasada, en 2020.`
    }
  },
  {
    id: '5',
    level: 'Mellomnivå',
    category: 'Grammatikk',
    icon: '🔮',
    no: {
      title: 'Subjuntivo – Ønsker, Tvil og Følelser',
      description: 'Konjunktiv: den "magiske" modus som skiller mellomspråk fra avansert spansk.',
      content: `Subjuntivo brukes når vi uttrykker ønsker, tvil, følelser eller hypotetiske situasjoner.

📌 Grunnregel: Utløses av bestemte fraser + "que":
• Quiero que... (Jeg vil at...)
• Es importante que... (Det er viktig at...)
• Espero que... (Jeg håper at...)
• No creo que... (Jeg tror ikke at...)
• Me alegra que... (Jeg er glad for at...)

📌 Bøying (presens subjuntivo, -AR → bruk -ER endelser!):
• hablar: hable, hables, hable, hablemos, habléis, hablen
• comer: coma, comas, coma, comamos, comáis, coman

💬 Eksempler:
• Quiero que vengas. (Jeg vil at du skal komme.)
• Es posible que llueva. (Det er mulig at det regner.)
• No creo que sea verdad. (Jeg tror ikke det er sant.)

💡 Start med å lære de 5 vanligste utløsende frasene. Subjuntivo kommer naturlig med praksis!`
    },
    ru: {
      title: 'Subjuntivo – Сослагательное наклонение',
      description: 'Специальная форма для желаний, сомнений и эмоций.',
      content: `📌 Используется после: Quiero que..., Es importante que..., Espero que...

📌 Спряжение (-AR → окончания -ER):
• hablar: hable, hables, hable, hablemos, hablen

💬 Примеры:
• Quiero que vengas. (Я хочу, чтобы ты пришёл.)
• Es posible que llueva. (Возможно, пойдёт дождь.)
• No creo que sea verdad. (Я не думаю, что это правда.)

💡 Начните с 5 ключевых фраз-триггеров.`
    }
  },
  {
    id: '19',
    level: 'Mellomnivå',
    category: 'Struktur',
    icon: '⏳',
    no: {
      title: 'Imperfektum – Det som pågikk',
      description: 'Fortidsformen for vanor, beskrivelser og pågående handlinger i fortiden.',
      content: `Imperfektum (Imperfecto) er den andre viktige fortidsformen. Det brukes for:

📌 Vaner i fortiden:
• De niño, jugaba al fútbol. (Som barn spilte jeg fotball.)

📌 Beskrivelser i fortiden:
• Era un día bonito. (Det var en pen dag.)
• Había muchas personas. (Det var mange mennesker.)

📌 Pågående handlinger i fortiden:
• Mientras comía, vi la televisión. (Mens jeg spiste, så jeg TV.)

📌 Bøying (veldig regelmessig!):
• -AR: hablaba, hablabas, hablaba, hablábamos, hablaban
• -ER/-IR: comía, comías, comía, comíamos, comían
• Uregelmessige: ser (era/eras), ir (iba/ibas), ver (veía/veías)

💡 Huskeregel: Preteritum = "Det skjedde" (ferdig). Imperfektum = "Det pågikk / pleide å skje".`
    },
    ru: {
      title: 'Имперфект – Незавершённые действия',
      description: 'Прошедшее время для привычек и описаний.',
      content: `📌 Употребление:
• Привычки: De niño, jugaba al fútbol.
• Описания: Era un día bonito.
• Параллельные действия: Mientras comía, vi la televisión.

📌 Спряжение (-AR): hablaba, hablabas, hablaba, hablábamos, hablaban
📌 Неправильные: ser (era), ir (iba), ver (veía)

💡 Правило: Претерит = "случилось" (завершено). Имперфект = "происходило / было привычным".`
    }
  },
  {
    id: '20',
    level: 'Mellomnivå',
    category: 'Samtale',
    icon: '✈️',
    no: {
      title: 'Reise og Hverdagssamtaler',
      description: 'De viktigste frasene for å reise i Spania og Latin-Amerika.',
      content: `Disse frasene bruker du DAGLIG som reisende:

📌 Transport:
• ¿Dónde está la parada de autobús/metro? (Hvor er buss/T-banestoppestedet?)
• Un billete de ida y vuelta a... (En tur-retur billett til...)
• ¿A qué hora sale el tren? (Når går toget?)

📌 Hotell:
• Tengo una reserva. (Jeg har en reservasjon.)
• ¿Puede llevar las maletas a mi habitación? (Kan du ta bagasjen til rommet mitt?)
• ¿A qué hora es el check-out? (Når er utsjekk?)

📌 Restaurant:
• ¿Me puede traer la carta? (Kan du gi meg menyen?)
• ¿Cuál es el plato del día? (Hva er dagens rett?)
• La cuenta, por favor. / ¿Está incluido el servicio? (Regningen, takk. / Er service inkludert?)

📌 Nødsituasjoner:
• ¡Ayuda! (Hjelp!) / ¡Llame a la policía! (Ring politiet!)
• Me han robado. (Jeg har blitt ranet.)
• Necesito un médico. (Jeg trenger en lege.)

💡 Last ned disse som skjermbilde FØR du reiser!`
    },
    ru: {
      title: 'Путешествие и повседневные разговоры',
      description: 'Важнейшие фразы для путешествия по Испании и Латинской Америке.',
      content: `📌 Транспорт: ¿Dónde está la parada de autobús? / Un billete de ida y vuelta.

📌 Отель: Tengo una reserva. / ¿A qué hora es el check-out?

📌 Ресторан: ¿Me puede traer la carta? / La cuenta, por favor.

📌 Экстренные ситуации: ¡Ayuda! / ¡Llame a la policía! / Necesito un médico.

💡 Сохраните эти фразы на телефон перед поездкой!`
    }
  },

  // ─── EKSPERT ────────────────────────────────────────────────────────────
  {
    id: '15',
    level: 'Ekspert',
    category: 'Grammatikk',
    icon: '🔗',
    no: {
      title: 'Preposisjonsmesteren',
      description: 'Behers de komplekse preposisjonene som skiller B1 fra B2.',
      content: `Preposisjoner er vanskelig fordi de ikke alltid oversettes logisk. Her er de viktigste:

📌 A – til, for, klokken:
• Voy a Madrid. (Jeg drar til Madrid.)
• Llamo a María. (personlig objekt – OBLIGATORISK "a")
• A las tres. (Klokken tre.)

📌 EN – i, på (sted):
• Vivo en Oslo. / Estoy en casa. / El libro está en la mesa.

📌 CON / SIN – med / uten:
• Café con leche. / Sin azúcar. / Voy contigo. (jeg drar med deg)

📌 DE – av, fra, om (possessiv):
• Soy de Noruega. / El libro de María. / Una taza de café.

📌 DESDE / HASTA – fra / til (tid og sted):
• Desde Madrid hasta Barcelona. / Desde las 9 hasta las 17.

📌 ANTE / TRAS / BAJO / SOBRE:
• Ante todo... (Fremfor alt...) / Tras la cena... (Etter middag...) / Sobre la mesa (på bordet, oven på)

💡 Den personlige "a" er det viktigste du lærer i denne leksjonen!`
    },
    ru: {
      title: 'Мастер предлогов',
      description: 'Сложные предлоги: от B1 к B2.',
      content: `📌 A – к, в (направление, личный объект): Voy a Madrid. / Llamo a María.
📌 EN – в, на (место): Vivo en Oslo. / Estoy en casa.
📌 CON/SIN – с/без: Café con leche. / Sin azúcar.
📌 DE – от, из, о (принадлежность): Soy de Rusia. / El libro de María.
📌 DESDE/HASTA – от/до (время, место): Desde las 9 hasta las 17.

💡 Личный предлог "a" — важнейший момент этого урока!`
    }
  },
  {
    id: '18',
    level: 'Ekspert',
    category: 'Grammatikk',
    icon: '⚖️',
    no: {
      title: 'Por vs Para – Dypdykk',
      description: 'Den tekniske forskjellen på de to vanskeligste preposisjonene i spansk.',
      content: `POR og PARA er begge "for" på norsk – men de er IKKE det samme!

📌 PARA – mål, destinasjon, mottaker, tidsfrist:
• Salgo para Madrid. (Jeg drar til/mot Madrid.) – destinasjon
• Este regalo es para ti. (Denne gaven er til deg.) – mottaker
• Necesito esto para el lunes. (Jeg trenger dette til mandag.) – tidsfrist
• Estudio para aprender. (Jeg studerer for å lære.) – formål

📌 POR – årsak, bytte, varighet, agent, bevegelse gjennom:
• Lo hice por amor. (Jeg gjorde det av kjærlighet.) – årsak
• Te doy diez euros por la camisa. (Jeg gir deg ti euro for skjorten.) – bytte
• Caminé por el parque. (Jeg gikk gjennom parken.) – bevegelse gjennom
• Llámame por las tardes. (Ring meg om ettermiddagen.) – vag tidsperiode
• El libro fue escrito por Cervantes. – passiv agent

⚡ Klassisk husketrick:
• PARA ser fremover: mål, resultat, destinasjon, mottaker
• POR ser bakover eller rundt: årsak, bytte, prosess, varighet

💬 Testsetninger:
• Lo compré por / para ti. (por = p.g.a. deg; para = til deg)

💡 PARA = "for å / til". POR = "p.g.a. / for / gjennom".`
    },
    ru: {
      title: 'Por vs Para – Глубокий анализ',
      description: 'Техническое различие двух самых сложных предлогов.',
      content: `📌 PARA – цель, получатель, крайний срок:
• Salgo para Madrid. / Este regalo es para ti.
• Necesito esto para el lunes. / Estudio para aprender.

📌 POR – причина, обмен, длительность, движение через:
• Lo hice por amor. / Te doy 10€ por la camisa.
• Caminé por el parque. / Llámame por las tardes.

⚡ Мнемоника:
• PARA смотрит ВПЕРЁД (цель/результат)
• POR смотрит НАЗАД (причина/процесс)

💡 PARA = "чтобы / для". POR = "из-за / через / в обмен на".`
    }
  },
  {
    id: '21',
    level: 'Ekspert',
    category: 'Grammatikk',
    icon: '🚀',
    no: {
      title: 'Passiv og Upersonlige Konstruksjoner',
      description: 'Avanserte strukturer som gjør spansken din naturlig.',
      content: `Lær å uttrykke deg som en innfødt!

📌 Passiv med "ser" + partisipp:
• El libro fue escrito por García Márquez. (Boken ble skrevet av...)
• La ventana fue rota. (Vinduet ble knust.)

📌 Passiv refleksiv med "se" (mer naturlig i spansk!):
• Se habla español aquí. (Her snakkes det spansk.)
• Se vende piso. (Leilighet til salgs.)
• Se dice que... (Det sies at...)

📌 Upersonlige setninger:
• Hay que estudiar. (Man må studere.) – generell forpliktelse
• Se puede nadar aquí. (Man kan svømme her.)
• Es necesario hablar. (Det er nødvendig å snakke.)

📌 "Llevar" + gerundio (handling som pågår en periode):
• Llevo tres años aprendiendo español. (Jeg har lært spansk i tre år.)
• ¿Cuánto tiempo llevas esperando? (Hvor lenge har du ventet?)

💡 "Se" er nøkkelordet i naturlig, hverdagslig spansk!`
    },
    ru: {
      title: 'Пассивный залог и безличные конструкции',
      description: 'Продвинутые структуры для естественного испанского.',
      content: `📌 Пассив с "ser":
• El libro fue escrito por García Márquez.

📌 Рефлексивный пассив с "se" (более естественно):
• Se habla español aquí. / Se vende piso.

📌 Безличные:
• Hay que estudiar. / Se puede nadar aquí.

📌 "Llevar" + герундий:
• Llevo tres años aprendiendo español.

💡 "Se" — ключ к естественному испанскому!`
    }
  },
];
