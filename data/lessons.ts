import { Lesson } from '../types';

export const INITIAL_LESSONS: Lesson[] = [
  // --- NYBEGYNNER ---
  {
    id: '1',
    level: 'Nybegynner',
    category: 'Grammatikk',
    no: {
      title: 'Substantiv og Kjønn',
      description: 'Lær forskjellen på hankjønn og hunkjønn, og hvordan det skiller seg fra norskens tre kjønn.',
      content: 'På spansk har vi bare to kjønn: Maskulin (-o) og Feminin (-a). På norsk har vi tre (hankjønn, hunkjønn, intetkjønn). Dette er nøkkelen til å forstå spansk struktur. Husk at artiklene "el" og "la" må samsvare med substantivet.'
    },
    ru: {
      title: 'Существительные и Род',
      description: 'Изучите разницу между мужским и женским родом в испанском языке.',
      content: 'В испанском языке всего два рода: мужской (-o) и женский (-a). В отличие от русского, здесь нет среднего рода. Это база для понимания структуры языка. Артикли "el" и "la" всегда должны соответствовать роду существительного.'
    }
  },
  {
    id: '2',
    level: 'Nybegynner',
    category: 'Grammatikk',
    no: {
      title: 'Verbbøyning i Presens',
      description: 'Hvorfor bøyning av verb er viktigere på spansk enn på norsk.',
      content: 'På norsk sier vi "jeg spiser", "du spiser". På spansk endrer verbet seg for hver person: Como (jeg), Comes (du), Come (han/hun). Fordi bøyningen er så tydelig, kan vi ofte droppe personlig pronomen (Yo, Tú).'
    },
    ru: {
      title: 'Спряжение глаголов',
      description: 'Как меняются окончания глаголов в зависимости от лица.',
      content: 'Как и в русском языке, в испанском глаголы меняют окончания. "Я ем" (Como), "Ты ешь" (Comes). Это делает систему спряжений интуитивно понятной.'
    }
  },
  {
    id: '10',
    level: 'Nybegynner',
    category: 'Ordforråd',
    no: {
      title: 'Tall og Grunnbegreper',
      description: 'Fra 1 til 100 og de viktigste hilsenene du trenger.',
      content: 'Å telle på spansk følger et logisk mønster etter 20 (veinte). Hilsener som "Hola", "Buenos días" og "Qué tal" er inngangsporten til enhver samtale.'
    },
    ru: {
      title: 'Числа и Приветствия',
      description: 'От 1 до 100 и самые важные фразы для начала общения.',
      content: 'Счет в испанском следует логической схеме после 20. Приветствия — это ключ к любому разговору.'
    }
  },
  {
    id: '11',
    level: 'Nybegynner',
    category: 'Grammatikk',
    no: {
      title: 'Adjektivets Plassering',
      description: 'Hvorfor det er "en rød bil" på norsk, men "en bil rød" på spansk.',
      content: 'På spansk kommer adjektivet nesten alltid ETTER substantivet: "El coche rojo". I tillegg må adjektivet bøyes i kjønn og tall.'
    },
    ru: {
      title: 'Место прилагательных',
      description: 'Почему в испанском "машина красная", а не "красная машина".',
      content: 'В испанском языке прилагательное почти всегда идет ПОСЛЕ существительного: "El coche rojo".'
    }
  },
  {
    id: '12',
    level: 'Nybegynner',
    category: 'Struktur',
    no: {
      title: 'Artikler og "Hay"',
      description: 'Lær å si at noe eksisterer med det magiske ordet "Hay".',
      content: '"Hay" betyr "det finnes" eller "det er". Det endrer seg aldri, uansett antall. "Hay un libro" (Det er en bok), "Hay muchos libros" (Det er mange bøker).'
    },
    ru: {
      title: 'Артикли и слово "Hay"',
      description: 'Научитесь говорить о существовании вещей с помощью слова "Hay".',
      content: '"Hay" означает "есть" или "существует". Оно никогда не меняется. "Hay un libro", "Hay muchos libros".'
    }
  },

  // --- MELLOMNIVÅ ---
  {
    id: '4',
    level: 'Mellomnivå',
    category: 'Grammatikk',
    no: {
      title: 'Ser vs Estar - Grunnleggende',
      description: 'To måter å si "å være" på. Den største utfordringen for nordmenn.',
      content: 'Norsk har bare ett ord for "å være". Spansk skiller mellom permanent tilstand (Ser - identitet, yrke) og midlertidig tilstand (Estar - følelser, lokasjon).'
    },
    ru: {
      title: 'Ser против Estar',
      description: 'Два способа сказать "быть". Постоянное против временного.',
      content: 'Ser используется для постоянных характеристик, Estar — для временных состояний и местоположения.'
    }
  },
  {
    id: '17',
    level: 'Mellomnivå',
    category: 'Grammatikk',
    no: {
      title: 'Mestring av Ser og Estar',
      description: 'Dypere innsikt i de to verbene for "å være" med kontrast til norsk.',
      content: 'Mens vi på norsk bare har "å være", krever spansk presisjon. Bruk Ser for hvem du ER (essens) og Estar for hvordan du HAR det (tilstand). Husk: "Soy aburrido" betyr at du er en kjedelig person, mens "Estoy aburrido" betyr at du kjeder deg akkurat nå.'
    },
    ru: {
      title: 'Мастерство Ser и Estar',
      description: 'Глубокое понимание двух глаголов "быть".',
      content: 'Используйте Ser для сути и характеристик, Estar для состояний и эмоций. Разница между "я скучный" и "мне скучно" критична.'
    }
  },
  {
    id: '5',
    level: 'Mellomnivå',
    category: 'Struktur',
    no: {
      title: 'Subjuntivo: Ønsker og følelser',
      description: 'Gå inn i den subjektive verdenen av spansk grammatikk.',
      content: 'Konjunktiv (Subjuntivo) brukes når vi uttrykker tvil, ønsker eller følelser. "Quiero que hables" (Jeg vil at du skal snakke).'
    },
    ru: {
      title: 'Subjuntivo: Желания',
      description: 'Погружение в сослагательное наклонение.',
      content: 'Subjuntivo используется для выражения сомнений, желаний и эмоций.'
    }
  },

  // --- EKSPERT ---
  {
    id: '15',
    level: 'Ekspert',
    category: 'Grammatikk',
    no: {
      title: 'Preposisjonsmesteren',
      description: 'De små ordene som utgjør den store forskjellen.',
      content: 'Mestre bruken av preposisjoner i komplekse setninger. Vi ser på hvordan spansk bygger sammenhenger som skiller seg fundamentalt fra norsk syntaks.'
    },
    ru: {
      title: 'Мастер предлогов',
      description: 'Маленькие слова, которые имеют большое значение.',
      content: 'Изучение использования предлогов в сложных предложениях.'
    }
  },
  {
    id: '18',
    level: 'Ekspert',
    category: 'Grammatikk',
    no: {
      title: 'Dypdykk: Por vs Para',
      description: 'En teknisk gjennomgang av de to mest utfordrende preposisjonene, og hvordan de skiller seg fra norskens "for".',
      content: 'Skillet mellom Por og Para er logisk, ikke tilfeldig. PARA er "målrettet": det ser fremover mot en destinasjon, mottaker eller tidsfrist (mål). POR er "årsaksorientert": det ser bakover eller fokuserer på prosessen, bevegelsen gjennom et område, varighet, eller et bytte (middel/årsak). På norsk bruker vi ofte "for" i begge tilfeller, noe som skaper forvirring. Husk: Para er destinasjonen, Por er veien dit.'
    },
    ru: {
      title: 'Глубокое погружение: Por vs Para',
      description: 'Технический разбор двух самых сложных предлогов в сравнении с логикой русского языка.',
      content: 'Разница между Por и Para логична. PARA — это цель (куда, для кого, к какому сроку). POR — это причина или путь (почему, через что, как долго, в обмен на что). Если PARA смотрит вперед на результат, то POR смотрит назад на причину или фокусируется на процессе.'
    }
  }
];