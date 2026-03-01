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
    },
    en: {
      title: 'Nouns & Gender',
      description: 'Master masculine and feminine – the foundation of Spanish grammar.',
      content: `Spanish nouns have two genders: masculine and feminine. Much simpler than many other languages!

📌 Basic rules:
• Words ending in -o are usually masculine: el libro (book), el perro (dog)
• Words ending in -a are usually feminine: la casa (house), la mesa (table)
• Articles MUST agree: el/un (masc.) vs la/una (fem.)

⚡ Key exceptions: la mano (hand) is feminine despite ending in -o.
el problema, el día – masculine despite ending in -a.

💡 Tip: Always learn a new word WITH its article: "la mesa", not just "mesa". Your brain will store the gender automatically.`
    },
    de: {
      title: 'Substantive und Genus',
      description: 'Maskulin und feminin meistern – das Fundament der spanischen Grammatik.',
      content: `Im Spanischen haben Substantive nur zwei Genera: maskulin und feminin. Viel einfacher als im Deutschen!

📌 Grundregeln:
• Wörter auf -o sind meist maskulin: el libro, el perro
• Wörter auf -a sind meist feminin: la casa, la mesa
• Artikel müssen übereinstimmen: el/un (mask.) vs la/una (fem.)

⚡ Ausnahmen: la mano (Hand) ist feminin trotz -o.
el problema, el día – maskulin trotz -a.

💡 Tipp: Lerne jedes Wort immer MIT dem Artikel: "la mesa", nicht nur "mesa". Das Gehirn speichert das Genus automatisch.`
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
    },
    en: {
      title: 'Present Tense Conjugation',
      description: 'How Spanish verbs change by person – and why you can drop pronouns.',
      content: `In English we always say "I eat, you eat, he eats". In Spanish, the verb ending tells you WHO is acting – no pronoun needed!

📌 -AR verb: HABLAR (to speak)
• (Yo) hablo – I speak
• (Tú) hablas – you speak
• (Él/Ella) habla – he/she speaks
• (Nosotros) hablamos – we speak
• (Vosotros) habláis – you (plural) speak
• (Ellos) hablan – they speak

⚡ Because endings are distinct, Spanish speakers often drop "yo/tú": "¿Hablas español?" = "Do you speak Spanish?"

💡 There are 3 verb types (-AR, -ER, -IR). -AR is the most common. Start by learning 5 -AR verbs today!`
    },
    de: {
      title: 'Präsenskonjugation',
      description: 'Wie spanische Verben je nach Person variieren – und warum Pronomen wegfallen können.',
      content: `Im Deutschen sagen wir "ich esse, du isst, er isst". Im Spanischen zeigt die Verbendung WER handelt – kein Pronomen nötig!

📌 -AR-Verb: HABLAR (sprechen)
• (Yo) hablo – ich spreche
• (Tú) hablas – du sprichst
• (Él/Ella) habla – er/sie spricht
• (Nosotros) hablamos – wir sprechen
• (Ellos) hablan – sie sprechen

⚡ Da Endungen eindeutig sind, lassen Spanier oft "yo/tú" weg: "¿Hablas español?" = "Sprichst du Spanisch?"

💡 Es gibt 3 Verbtypen (-AR, -ER, -IR). -AR ist am häufigsten. Lerne heute 5 -AR-Verben!`
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
    },
    en: {
      title: 'Numbers, Greetings & Colors',
      description: 'The 50 most essential words you need from day one.',
      content: `Start with the words you'll use most. This is your Spanish survival kit!

📌 Numbers 1–10: uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez
📌 11–20: once, doce, trece, catorce, quince, dieciséis, diecisiete, dieciocho, diecinueve, veinte
📌 Tens: treinta (30), cuarenta (40), cincuenta (50), cien (100)

💬 Essential greetings:
• Hola / Buenos días / Buenas tardes / Buenas noches
• ¿Cómo estás? / Bien, gracias / ¿Y tú?
• Por favor / Gracias / De nada / Lo siento
• ¿Cuánto cuesta? / No entiendo / ¿Puede repetir?

🎨 Colors: rojo (red), azul (blue), verde (green), amarillo (yellow), blanco (white), negro (black), naranja (orange)

💡 Learn these BEFORE you tackle grammar!`
    },
    de: {
      title: 'Zahlen, Begrüßungen und Farben',
      description: 'Die 50 wichtigsten Wörter, die du von Tag eins brauchst.',
      content: `Beginne mit den Wörtern, die du am häufigsten verwenden wirst. Dein Spanisch-Überlebenskit!

📌 Zahlen 1–10: uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez
📌 11–20: once, doce, trece, catorce, quince, dieciséis, diecisiete, dieciocho, diecinueve, veinte
📌 Zehner: treinta (30), cuarenta (40), cincuenta (50), cien (100)

💬 Wichtige Begrüßungen:
• Hola / Buenos días / Buenas tardes / Buenas noches
• ¿Cómo estás? / Bien, gracias / ¿Y tú?
• Por favor / Gracias / De nada / Lo siento

🎨 Farben: rojo (rot), azul (blau), verde (grün), amarillo (gelb), blanco (weiß), negro (schwarz)

💡 Lerne das BEVOR du mit der Grammatik anfängst!`
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
    },
    en: {
      title: 'Adjective Placement & Agreement',
      description: 'Spanish adjectives come AFTER the noun and must agree in gender and number.',
      content: `In English: "the red car". In Spanish: "el coche ROJO" – the adjective comes AFTER the noun.

📌 Adjectives agree in gender and number:
• el libro rojo – los libros rojos (masc.)
• la casa roja – las casas rojas (fem.)

📌 Exception – some adjectives can come BEFORE for special meaning:
• "un gran hombre" (a great man) – emphasises quality
• "buen amigo" – "bueno" drops -o before masculine nouns

💬 Practice:
• ¿Dónde está el restaurante bueno? (Where is the good restaurant?)
• Quiero una habitación grande. (I want a large room.)

💡 80% of adjectives follow the basic rule: adjective AFTER noun, agreeing in gender and number.`
    },
    de: {
      title: 'Stellung und Deklination der Adjektive',
      description: 'Adjektive stehen im Spanischen NACH dem Substantiv und stimmen in Genus und Numerus überein.',
      content: `Im Deutschen: "das rote Auto". Im Spanischen: "el coche ROJO" – das Adjektiv steht NACH dem Substantiv.

📌 Adjektive stimmen in Genus und Numerus überein:
• el libro rojo – los libros rojos (mask.)
• la casa roja – las casas rojas (fem.)

📌 Ausnahmen (vor dem Substantiv):
• "un gran hombre" – ein großartiger Mann
• "buen amigo" – "bueno" verliert das -o vor maskulinen Nomen

💡 80% der Adjektive folgen der Grundregel: Adjektiv NACH dem Substantiv.`
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
    },
    en: {
      title: 'Articles, "Hay" & Questions',
      description: 'Build your first complete Spanish sentences.',
      content: `Learn the essential building blocks for forming sentences.

📌 Definite articles:
• el/la (singular), los/las (plural)
• el libro, la casa, los niños, las mesas

📌 Indefinite articles:
• un/una (singular), unos/unas (plural)
• un café, una cerveza, unos amigos

📌 "Hay" = there is / there are:
• Hay una playa cerca. (There's a beach nearby.)
• ¿Hay wifi aquí? (Is there wifi here?)

📌 Questions – Spanish inverts word order:
• ¿Tienes hambre? (Are you hungry?)
• ¿Qué? / ¿Cómo? / ¿Dónde? / ¿Cuándo? / ¿Por qué? / ¿Cuánto?

💡 Start building your own sentences with these blocks!`
    },
    de: {
      title: 'Artikel, "Hay" und Fragen',
      description: 'Baue deine ersten vollständigen spanischen Sätze.',
      content: `📌 Bestimmte Artikel: el/la (Singular), los/las (Plural)
📌 Unbestimmte Artikel: un/una (Singular), unos/unas (Plural)

📌 "Hay" = es gibt:
• Hay una playa cerca. (Es gibt einen Strand in der Nähe.)
• ¿Hay wifi aquí? (Gibt es hier WLAN?)

📌 Fragen – spanische Wortstellung ist invertiert:
• ¿Tienes hambre? (Hast du Hunger?)
• ¿Qué? / ¿Cómo? / ¿Dónde? / ¿Cuándo? / ¿Por qué? / ¿Cuánto?

💡 Fange an, eigene Sätze mit diesen Bausteinen zu bilden!`
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
    },
    en: {
      title: 'Introduce Yourself',
      description: 'Everything you need to introduce yourself in Spanish from day one.',
      content: `These are the most important phrases. Practice until they feel automatic!

📌 Basic introduction:
• Me llamo... / Mi nombre es... (My name is...)
• Soy de Inglaterra / Australia. (I'm from England / Australia.)
• Tengo 30 años. (I'm 30 years old.)
• Soy [job]: estudiante, médico, ingeniero, profesor

📌 What do you do?
• Trabajo en... (I work at/in...)
• Estudio... (I study...)
• Me gusta [infinitive]: Me gusta viajar / cocinar / aprender español

📌 Learner phrases:
• Estoy aprendiendo español. (I'm learning Spanish.)
• No hablo español muy bien todavía. (I don't speak Spanish very well yet.)
• ¿Puedes hablar más despacio? (Can you speak more slowly?)

💡 Pro tip: Spanish speakers LOVE when foreigners try to speak Spanish. Don't be afraid to make mistakes!`
    },
    de: {
      title: 'Sich vorstellen',
      description: 'Alles, was du brauchst, um dich von Anfang an auf Spanisch vorzustellen.',
      content: `📌 Grundlegende Vorstellung:
• Me llamo... / Mi nombre es... (Ich heiße...)
• Soy de Alemania / Austria. (Ich komme aus Deutschland / Österreich.)
• Tengo 30 años. (Ich bin 30 Jahre alt.)
• Soy [Beruf]: estudiante, médico, ingeniero, profesor

📌 Was machst du?
• Trabajo en... / Estudio... (Ich arbeite bei... / Ich studiere...)
• Me gusta viajar / cocinar / aprender español.

📌 Lernphrasen:
• Estoy aprendiendo español. (Ich lerne Spanisch.)
• ¿Puedes hablar más despacio? (Kannst du langsamer sprechen?)

💡 Tipp: Spanier lieben es, wenn Ausländer Spanisch sprechen. Keine Angst vor Fehlern!`
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
    },
    en: {
      title: 'Ser vs Estar – The Big Challenge',
      description: 'Two verbs for "to be" – the most important distinction in Spanish.',
      content: `English only has one "to be", but Spanish has two. Once you understand the logic, it clicks!

📌 SER – permanent, identity, essence:
• Soy inglés. (I'm English.) – nationality
• Es médico. (He's a doctor.) – profession
• Son las tres. (It's three o'clock.) – time
• Es alta y delgada. (She's tall and slim.) – permanent traits

📌 ESTAR – temporary, state, position:
• Estoy cansado. (I'm tired.) – temporary feeling
• Está en Madrid. (He's in Madrid.) – location
• El café está frío. (The coffee is cold.) – temporary state
• ¿Cómo estás? (How are you?) – current condition

⚡ Classic mistake:
• "Soy aburrido" = I AM a boring person (permanent)
• "Estoy aburrido" = I'm bored right now (temporary)

💡 Memory trick: SER = who you ARE, ESTAR = how you FEEL.`
    },
    de: {
      title: 'Ser vs Estar – Die große Herausforderung',
      description: 'Zwei Verben für "sein" – der wichtigste Unterschied im Spanischen.',
      content: `Im Deutschen gibt es nur ein "sein", im Spanischen gibt es zwei. Die Logik dahinter ist klar!

📌 SER – dauerhaft, Identität, Wesen:
• Soy alemán. (Ich bin Deutscher.) – Nationalität
• Es médico. (Er ist Arzt.) – Beruf
• Es alta. (Sie ist groß.) – dauerhafte Eigenschaften

📌 ESTAR – vorübergehend, Zustand, Position:
• Estoy cansado. (Ich bin müde.) – vorübergehend
• Está en Madrid. (Er ist in Madrid.) – Ort
• El café está frío. (Der Kaffee ist kalt.) – vorübergehender Zustand

⚡ Klassischer Fehler:
• "Soy aburrido" = Ich bin ein langweiliger Mensch (dauerhaft)
• "Estoy aburrido" = Mir ist gerade langweilig (vorübergehend)

💡 Merkrege: SER = wer du BIST, ESTAR = wie du dich FÜHLST.`
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
    },
    en: {
      title: 'Preterite – Completed Actions',
      description: 'The past tense for finished, one-time actions.',
      content: `The Preterite (Pretérito Indefinido) is used for actions that are completely finished in the past.

📌 -AR verb (hablar):
• hablé, hablaste, habló, hablamos, hablasteis, hablaron

📌 -ER/-IR verb (comer/vivir):
• comí, comiste, comió, comimos, comisteis, comieron

⚠️ Irregular verbs (must memorise!):
• ser/ir: fui, fuiste, fue, fuimos, fueron (identical conjugation!)
• tener: tuve, tuviste, tuvo...
• estar: estuve, estuviste, estuvo...
• hacer: hice, hiciste, hizo...

💬 Examples:
• Ayer comí paella. (Yesterday I ate paella.)
• El año pasado fui a España. (Last year I went to Spain.)
• ¿Dónde estuviste? (Where were you?)

💡 Use preterite with: ayer, la semana pasada, en 2020.`
    },
    de: {
      title: 'Präteritum – Abgeschlossene Handlungen',
      description: 'Die Vergangenheitsform für abgeschlossene, einmalige Handlungen.',
      content: `Das Pretérito Indefinido wird für vollständig abgeschlossene Handlungen in der Vergangenheit verwendet.

📌 -AR: hablar → hablé, hablaste, habló, hablamos, hablaron
📌 -ER/-IR: comer → comí, comiste, comió, comimos, comieron

⚠️ Unregelmäßige (unbedingt lernen!):
• ser/ir: fui, fuiste, fue...
• tener: tuve, tuviste...
• estar: estuve, estuviste...

💬 Beispiele:
• Ayer comí paella. (Gestern aß ich Paella.)
• ¿Dónde estuviste? (Wo warst du?)

💡 Verwende mit: ayer, la semana pasada, en 2020.`
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
    },
    en: {
      title: 'Subjunctive – Wishes, Doubt & Emotions',
      description: 'The mood that separates intermediate from advanced Spanish.',
      content: `The subjunctive is used to express wishes, doubt, emotions, or hypothetical situations.

📌 Key rule: Triggered by certain phrases + "que":
• Quiero que... (I want [someone] to...)
• Es importante que... (It's important that...)
• Espero que... (I hope that...)
• No creo que... (I don't think that...)
• Me alegra que... (I'm glad that...)

📌 Conjugation (present subjunctive, -AR → use -ER endings!):
• hablar: hable, hables, hable, hablemos, habléis, hablen
• comer: coma, comas, coma, comamos, comáis, coman

💬 Examples:
• Quiero que vengas. (I want you to come.)
• Es posible que llueva. (It might rain.)
• No creo que sea verdad. (I don't think it's true.)

💡 Start by learning the 5 most common trigger phrases. The subjunctive becomes natural with practice!`
    },
    de: {
      title: 'Subjuntivo – Wünsche, Zweifel und Gefühle',
      description: 'Der Modus, der Mittelstufe von Fortgeschrittenem unterscheidet.',
      content: `Der Subjuntivo wird für Wünsche, Zweifel, Gefühle oder hypothetische Situationen verwendet.

📌 Grundregel: Wird durch bestimmte Phrasen + "que" ausgelöst:
• Quiero que... (Ich möchte, dass...)
• Es importante que... (Es ist wichtig, dass...)
• Espero que... (Ich hoffe, dass...)

📌 Konjugation (-AR → ER-Endungen verwenden!):
• hablar: hable, hables, hable, hablemos, hablen

💬 Beispiele:
• Quiero que vengas. (Ich möchte, dass du kommst.)
• Es posible que llueva. (Es könnte regnen.)
• No creo que sea verdad. (Ich glaube nicht, dass das wahr ist.)

💡 Beginne mit den 5 häufigsten Auslöserphrasen.`
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
    },
    en: {
      title: 'Imperfect – Ongoing Past Actions',
      description: 'The past tense for habits, descriptions, and background actions.',
      content: `The Imperfect (Imperfecto) is the second key past tense. Use it for:

📌 Past habits:
• De niño, jugaba al fútbol. (As a child, I used to play football.)

📌 Descriptions in the past:
• Era un día bonito. (It was a beautiful day.)
• Había muchas personas. (There were many people.)

📌 Background/ongoing actions:
• Mientras comía, vi la televisión. (While I was eating, I watched TV.)

📌 Conjugation (very regular!):
• -AR: hablaba, hablabas, hablaba, hablábamos, hablaban
• -ER/-IR: comía, comías, comía, comíamos, comían
• Irregular: ser (era/eras), ir (iba/ibas), ver (veía/veías)

💡 Key rule: Preterite = "It happened" (finished). Imperfect = "It was happening / used to happen".`
    },
    de: {
      title: 'Imperfekt – Andauernde Vergangenheit',
      description: 'Die Vergangenheitsform für Gewohnheiten, Beschreibungen und Hintergrundhandlungen.',
      content: `Das Imperfecto wird für folgende Situationen verwendet:

📌 Vergangene Gewohnheiten:
• De niño, jugaba al fútbol. (Als Kind spielte ich Fußball.)

📌 Beschreibungen in der Vergangenheit:
• Era un día bonito. (Es war ein schöner Tag.)

📌 Hintergrundhandlungen:
• Mientras comía, vi la televisión. (Während ich aß, sah ich fern.)

📌 Konjugation (-AR): hablaba, hablabas, hablaba, hablábamos, hablaban
📌 Unregelmäßig: ser (era), ir (iba), ver (veía)

💡 Regel: Pretérito = "es geschah" (abgeschlossen). Imperfecto = "es geschah gerade / war Gewohnheit".`
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
    },
    en: {
      title: 'Travel & Everyday Conversations',
      description: 'Essential phrases for travelling in Spain and Latin America.',
      content: `These are phrases you'll use EVERY DAY when travelling:

📌 Transport:
• ¿Dónde está la parada de autobús/metro? (Where's the bus/metro stop?)
• Un billete de ida y vuelta a... (A return ticket to...)
• ¿A qué hora sale el tren? (What time does the train leave?)

📌 Hotel:
• Tengo una reserva. (I have a reservation.)
• ¿A qué hora es el check-out? (What time is check-out?)

📌 Restaurant:
• ¿Me puede traer la carta? (Can I have the menu?)
• ¿Cuál es el plato del día? (What's today's special?)
• La cuenta, por favor. (The bill, please.)

📌 Emergencies:
• ¡Ayuda! (Help!) / ¡Llame a la policía! (Call the police!)
• Me han robado. (I've been robbed.)
• Necesito un médico. (I need a doctor.)

💡 Save these as a screenshot BEFORE you travel!`
    },
    de: {
      title: 'Reisen und Alltagsgespräche',
      description: 'Wichtigste Phrasen für Reisen in Spanien und Lateinamerika.',
      content: `📌 Transport:
• ¿Dónde está la parada de autobús/metro? (Wo ist die Bus-/Metrostation?)
• Un billete de ida y vuelta a... (Eine Hin- und Rückfahrkarte nach...)
• ¿A qué hora sale el tren? (Wann fährt der Zug ab?)

📌 Hotel:
• Tengo una reserva. (Ich habe eine Reservierung.)
• ¿A qué hora es el check-out? (Wann ist der Check-out?)

📌 Restaurant:
• ¿Me puede traer la carta? (Kann ich die Speisekarte haben?)
• La cuenta, por favor. (Die Rechnung, bitte.)

📌 Notfälle:
• ¡Ayuda! (Hilfe!) / ¡Llame a la policía! (Rufen Sie die Polizei!)
• Necesito un médico. (Ich brauche einen Arzt.)

💡 Speichere das als Screenshot VOR der Reise!`
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
    },
    en: {
      title: 'Mastering Prepositions',
      description: 'The complex prepositions that separate B1 from B2.',
      content: `Prepositions are tricky because they don't always translate logically. Here are the key ones:

📌 A – to, at, personal object marker:
• Voy a Madrid. (I'm going to Madrid.)
• Llamo a María. (personal object – "a" is MANDATORY)
• A las tres. (At three o'clock.)

📌 EN – in, at, on (location):
• Vivo en Londres. / Estoy en casa. / El libro está en la mesa.

📌 CON / SIN – with / without:
• Café con leche. / Sin azúcar. / Voy contigo. (I'm going with you)

📌 DE – of, from, about (possession):
• Soy de Inglaterra. / El libro de María. / Una taza de café.

📌 DESDE / HASTA – from / until (time and place):
• Desde Madrid hasta Barcelona. / Desde las 9 hasta las 17.

💡 The personal "a" is the single most important thing in this lesson!`
    },
    de: {
      title: 'Präpositionen meistern',
      description: 'Die komplexen Präpositionen, die B1 von B2 unterscheiden.',
      content: `📌 A – nach, zu, persönliches Objekt: Voy a Madrid. / Llamo a María.
📌 EN – in, an, auf (Ort): Vivo en Berlín. / Estoy en casa.
📌 CON/SIN – mit/ohne: Café con leche. / Sin azúcar.
📌 DE – von, aus, über (Besitz): Soy de Alemania. / El libro de María.
📌 DESDE/HASTA – von/bis (Zeit, Ort): Desde las 9 hasta las 17.

💡 Das persönliche "a" ist das Wichtigste in dieser Lektion!`
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
    },
    en: {
      title: 'Por vs Para – Deep Dive',
      description: 'The technical difference between the two trickiest prepositions.',
      content: `POR and PARA both translate as "for" in English – but they are NOT interchangeable!

📌 PARA – goal, destination, recipient, deadline:
• Salgo para Madrid. (I'm heading to Madrid.) – destination
• Este regalo es para ti. (This gift is for you.) – recipient
• Necesito esto para el lunes. (I need this by Monday.) – deadline
• Estudio para aprender. (I study in order to learn.) – purpose

📌 POR – cause, exchange, duration, agent, movement through:
• Lo hice por amor. (I did it out of love.) – cause
• Te doy diez euros por la camisa. (I'll give you ten euros for the shirt.) – exchange
• Caminé por el parque. (I walked through the park.) – movement
• El libro fue escrito por Cervantes. – passive agent

⚡ Memory trick:
• PARA looks FORWARD: goal, result, destination, recipient
• POR looks BACKWARD or around: cause, exchange, process, duration

💡 PARA = "in order to / for (someone)". POR = "because of / through / in exchange for".`
    },
    de: {
      title: 'Por vs Para – Tiefenanalyse',
      description: 'Der technische Unterschied zwischen den zwei schwierigsten Präpositionen.',
      content: `POR und PARA werden beide mit "für" übersetzt – sie sind aber NICHT austauschbar!

📌 PARA – Ziel, Bestimmungsort, Empfänger, Frist:
• Salgo para Madrid. / Este regalo es para ti.
• Necesito esto para el lunes. / Estudio para aprender.

📌 POR – Ursache, Tausch, Dauer, Agens, Bewegung durch:
• Lo hice por amor. / Te doy 10€ por la camisa.
• Caminé por el parque.

⚡ Merkhilfe:
• PARA schaut VORWÄRTS (Ziel/Ergebnis)
• POR schaut RÜCKWÄRTS (Ursache/Prozess)

💡 PARA = "um zu / für (jemanden)". POR = "wegen / durch / im Austausch für".`
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
    },
    en: {
      title: 'Passive & Impersonal Constructions',
      description: 'Advanced structures that make your Spanish sound natural.',
      content: `Learn to express yourself like a native speaker!

📌 Passive with "ser" + past participle:
• El libro fue escrito por García Márquez. (The book was written by...)
• La ventana fue rota. (The window was broken.)

📌 Reflexive passive with "se" (more natural in Spanish!):
• Se habla español aquí. (Spanish is spoken here.)
• Se vende piso. (Flat for sale.)
• Se dice que... (It is said that...)

📌 Impersonal sentences:
• Hay que estudiar. (One must study.) – general obligation
• Se puede nadar aquí. (One can swim here.)
• Es necesario hablar. (It is necessary to speak.)

📌 "Llevar" + gerund (action in progress for a period):
• Llevo tres años aprendiendo español. (I've been learning Spanish for three years.)
• ¿Cuánto tiempo llevas esperando? (How long have you been waiting?)

💡 "Se" is the key to natural, everyday Spanish!`
    },
    de: {
      title: 'Passiv und unpersönliche Konstruktionen',
      description: 'Fortgeschrittene Strukturen für natürliches Spanisch.',
      content: `📌 Passiv mit "ser" + Partizip:
• El libro fue escrito por García Márquez.

📌 Reflexivpassiv mit "se" (natürlicher im Spanischen!):
• Se habla español aquí. (Hier wird Spanisch gesprochen.)
• Se vende piso. (Wohnung zu verkaufen.)

📌 Unpersönliche Sätze:
• Hay que estudiar. (Man muss lernen.)
• Se puede nadar aquí. (Man kann hier schwimmen.)

📌 "Llevar" + Gerundium:
• Llevo tres años aprendiendo español. (Ich lerne seit drei Jahren Spanisch.)

💡 "Se" ist der Schlüssel zu natürlichem, alltäglichem Spanisch!`
    }
  },
];
