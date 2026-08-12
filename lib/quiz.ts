export interface QuizQ {
  id: string;
  category: string;
  question: string;
  options: string[];
  answerIndex: number;
  fact: string;
}

export const QUIZ_BANK: QuizQ[] = [
  {
    id: 'q1',
    category: 'Flag & Symbols',
    question: 'What are the three colours of the Sierra Leone flag, top to bottom?',
    options: ['Green, white, blue', 'Blue, white, green', 'Red, gold, green', 'Green, gold, blue'],
    answerIndex: 0,
    fact: 'Green is the land, white is unity and justice, blue is the harbour and the sea.',
  },
  {
    id: 'q2',
    category: 'Cities',
    question: 'What is the capital city of Sierra Leone?',
    options: ['Bo', 'Kenema', 'Freetown', 'Makeni'],
    answerIndex: 2,
    fact: 'Freetown was founded in 1792 as a home for freed Africans.',
  },
  {
    id: 'q3',
    category: 'History',
    question: 'On which date did Sierra Leone gain independence from Britain?',
    options: ['19 April 1971', '27 April 1961', '27 April 1971', '1 October 1960'],
    answerIndex: 1,
    fact: 'Independence Day is 27 April 1961. The republic was declared in 1971.',
  },
  {
    id: 'q4',
    category: 'People',
    question: 'Which two ethnic groups are the largest in Sierra Leone?',
    options: ['Limba and Kono', 'Temne and Mende', 'Krio and Fula', 'Sherbro and Loko'],
    answerIndex: 1,
    fact: 'Temne (north) and Mende (south/east) together make up the majority of the population.',
  },
  {
    id: 'q5',
    category: 'Language',
    question: 'Which language is the national lingua franca of Sierra Leone?',
    options: ['English', 'Mende', 'Krio', 'Temne'],
    answerIndex: 2,
    fact: 'English is official, but Krio is understood by the vast majority of Sierra Leoneans.',
  },
  {
    id: 'q6',
    category: 'Geography',
    question: 'How many districts does Sierra Leone have?',
    options: ['12', '14', '16', '18'],
    answerIndex: 2,
    fact: 'Five regions contain 16 districts, including Western Area Urban and Rural.',
  },
  {
    id: 'q7',
    category: 'Culture',
    question: 'What is the national anthem of Sierra Leone?',
    options: [
      'God Bless Our Homeland',
      'High We Exalt Thee, Realm of the Free',
      'Land of Our Birth',
      'Freedom Song of Freetown',
    ],
    answerIndex: 1,
    fact: 'The anthem opens: High we exalt thee, realm of the free.',
  },
  {
    id: 'q8',
    category: 'Cities',
    question: 'Which city is the commercial heart of the Southern Province?',
    options: ['Makeni', 'Koidu', 'Bo', 'Port Loko'],
    answerIndex: 2,
    fact: 'Bo is the largest city in the south and a major trading centre.',
  },
  {
    id: 'q9',
    category: 'Nature',
    question: 'Tiwai Island is famous as a sanctuary for what?',
    options: ['Elephants only', 'Primates and rainforest life', 'Desert antelope', 'Flamingos'],
    answerIndex: 1,
    fact: 'Tiwai in the Moa River is one of the most primate-dense forests in the world.',
  },
  {
    id: 'q10',
    category: 'Food',
    question: 'Which dish is widely considered a national favourite of Sierra Leone?',
    options: ['Jollof only', 'Cassava leaf stew (plasas)', 'Injera', 'Banku and tilapia'],
    answerIndex: 1,
    fact: 'Cassava leaf stew, often with fish or meat and rice, is a Salone staple.',
  },
  {
    id: 'q11',
    category: 'History',
    question: 'What does the name Sierra Leone come from?',
    options: [
      'A Temne phrase for rice valley',
      'Portuguese for Lion Mountains',
      'A Krio word for free land',
      'An Arabic name for the river',
    ],
    answerIndex: 1,
    fact: 'Portuguese sailors called the hills Serra Lyoa — Lion Mountains.',
  },
  {
    id: 'q12',
    category: 'Economy',
    question: 'Which mineral made Kono District globally known?',
    options: ['Bauxite', 'Rutile', 'Diamonds', 'Iron ore only'],
    answerIndex: 2,
    fact: 'Koidu in Kono is the historic centre of Sierra Leone’s diamond fields.',
  },
  {
    id: 'q13',
    category: 'Geography',
    question: 'Outamba-Kilimi National Park lies mainly in which part of the country?',
    options: ['Far south near Liberia', 'Northwest near Guinea', 'Western Area peninsula', 'Sherbro Island'],
    answerIndex: 1,
    fact: 'Outamba-Kilimi protects woodland savanna, hippos and primates in the northwest.',
  },
  {
    id: 'q14',
    category: 'Culture',
    question: 'Poro and Sande (Bondo) are best described as what?',
    options: ['Political parties', 'Football clubs', 'Traditional initiation societies', 'Market unions'],
    answerIndex: 2,
    fact: 'Poro (male) and Sande/Bondo (female) remain central to many communities.',
  },
  {
    id: 'q15',
    category: 'Cities',
    question: 'Which city is the main urban centre of the Northern Province?',
    options: ['Kenema', 'Makeni', 'Bonthe', 'Kabala'],
    answerIndex: 1,
    fact: 'Makeni is the northern commercial hub and capital of Bombali District.',
  },
  {
    id: 'q16',
    category: 'Language',
    question: 'Mende is primarily spoken in which part of Sierra Leone?',
    options: ['Far north only', 'South and east', 'Western Area only', 'Offshore islands only'],
    answerIndex: 1,
    fact: 'Mende is the leading language of the south and much of the east.',
  },
  {
    id: 'q17',
    category: 'History',
    question: 'In which year did the Sierra Leone civil war formally end?',
    options: ['1996', '1999', '2002', '2005'],
    answerIndex: 2,
    fact: 'The war that began in 1991 was declared over in January 2002.',
  },
  {
    id: 'q18',
    category: 'Geography',
    question: 'Freetown sits on which body of water?',
    options: ['Lake Sonfon', 'Atlantic Ocean / Freetown Harbour', 'Moa River only', 'Lake Chad'],
    answerIndex: 1,
    fact: 'Freetown Harbour is one of the largest natural deep-water harbours in the world.',
  },
  {
    id: 'q19',
    category: 'Culture',
    question: 'What famous living monument stands in central Freetown?',
    options: ['Baobab of Bo', 'Cotton Tree', 'Ironwood of Kenema', 'Palm Court'],
    answerIndex: 1,
    fact: 'The Cotton Tree has been a gathering place and national symbol for generations.',
  },
  {
    id: 'q20',
    category: 'People',
    question: 'The Krio people of Freetown are historically descendants of whom?',
    options: [
      'Only Portuguese traders',
      'Freed Africans resettled in the Province of Freedom',
      'Berber caravans',
      'Dutch settlers of the Cape',
    ],
    answerIndex: 1,
    fact: 'Black Loyalists, Jamaican Maroons and recaptives shaped Krio culture.',
  },
  {
    id: 'q21',
    category: 'Food',
    question: 'What is groundnut stew commonly eaten with in Sierra Leone?',
    options: ['Pasta', 'Rice', 'Injera', 'Couscous only'],
    answerIndex: 1,
    fact: 'Rice is the everyday staple — if rice nor cook, the day nor done.',
  },
  {
    id: 'q22',
    category: 'Geography',
    question: 'Which island group off Sierra Leone is known for turtles and quiet beaches?',
    options: ['Canary Islands', 'Banana Islands', 'Cape Verde', 'Bioko'],
    answerIndex: 1,
    fact: 'Dublin and Ricketts on the Banana Islands are historic fishing communities.',
  },
  {
    id: 'q23',
    category: 'Economy',
    question: 'What is the currency of Sierra Leone?',
    options: ['Cedi', 'Naira', 'Leone (SLE/SLL)', 'Dalasi'],
    answerIndex: 2,
    fact: 'The Leone was rebased in 2022 (SLE). Many people still speak in old leones.',
  },
  {
    id: 'q24',
    category: 'Sports',
    question: 'What is the nickname of Sierra Leone’s national football team?',
    options: ['The Black Stars', 'The Leone Stars', 'The Super Eagles', 'The Indomitable Lions'],
    answerIndex: 1,
    fact: 'The Leone Stars wear green, white and blue with pride.',
  },
  {
    id: 'q25',
    category: 'History',
    question: 'Who was the first Prime Minister of independent Sierra Leone?',
    options: ['Siaka Stevens', 'Sir Milton Margai', 'Ahmad Tejan Kabbah', 'Ernest Bai Koroma'],
    answerIndex: 1,
    fact: 'Sir Milton Margai, a doctor from Gbangbatoke, led the nation to independence.',
  },
  {
    id: 'q26',
    category: 'Geography',
    question: 'Kenema is best known as a centre for which eastern trade?',
    options: ['Salt only', 'Cocoa, coffee and diamonds', 'Tea plantations', 'Copper'],
    answerIndex: 1,
    fact: 'Kenema is the largest city in the east and a produce and diamond hub.',
  },
  {
    id: 'q27',
    category: 'Culture',
    question: 'Bubu, gumbe and milo jazz are forms of what?',
    options: ['Court dress', 'Salone music and dance', 'Farm tools', 'Fishing nets'],
    answerIndex: 1,
    fact: 'Salone sound runs from traditional rhythms to modern Afropop and street gumbe.',
  },
  {
    id: 'q28',
    category: 'Nature',
    question: 'Tacugama is a sanctuary near Freetown dedicated to which animal?',
    options: ['Pygmy hippo', 'Chimpanzee', 'Manatee', 'Lion'],
    answerIndex: 1,
    fact: 'Tacugama Chimpanzee Sanctuary protects rescued chimps in the Western Area forest.',
  },
  {
    id: 'q29',
    category: 'Language',
    question: 'How do you say hello in Krio?',
    options: ['Bua', 'Kushe / Kushɛ', 'Jam na nga def', 'Selam'],
    answerIndex: 1,
    fact: 'Kushe o! is the everyday Salone greeting. Reply: Kushɛ.',
  },
  {
    id: 'q30',
    category: 'Geography',
    question: 'Which neighbouring countries border Sierra Leone?',
    options: [
      'Ghana and Togo',
      'Guinea and Liberia',
      'Mali and Senegal',
      'Côte d’Ivoire and Guinea-Bissau',
    ],
    answerIndex: 1,
    fact: 'Guinea wraps the north and east; Liberia lies to the southeast; the Atlantic is west.',
  },
];

export function pickQuiz(count = 8): QuizQ[] {
  const copy = [...QUIZ_BANK];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

export function pickOneQuiz(): QuizQ {
  return QUIZ_BANK[Math.floor(Math.random() * QUIZ_BANK.length)];
}
