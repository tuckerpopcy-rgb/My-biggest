// ============================================================
// Salon na we yon - Sierra Leone Quiz Data
// ============================================================

import type { QuizQuestion } from './types';

export const quizQuestions: QuizQuestion[] = [
  // History
  {
    id: 'q1', question: 'In what year did Sierra Leone gain independence from Britain?',
    options: ['1957', '1961', '1963', '1965'],
    correctIndex: 1, explanation: 'Sierra Leone gained independence on April 27, 1961.',
    category: 'History', difficulty: 'easy',
  },
  {
    id: 'q2', question: 'What was Sierra Leone\'s original name given by Portuguese explorers?',
    options: ['Gold Coast', 'Serra Leoa', 'Lion Mountain', 'Free Land'],
    correctIndex: 1, explanation: 'Portuguese explorer Pedro de Sintra named it "Serra Leoa" meaning Lioness Mountains in 1462.',
    category: 'History', difficulty: 'medium',
  },
  {
    id: 'q3', question: 'Freetown was established as a settlement for which group of people?',
    options: ['Portuguese traders', 'Freed African slaves', 'British soldiers', 'French colonists'],
    correctIndex: 1, explanation: 'Freetown was founded in 1792 as a settlement for freed African-American slaves (Nova Scotian settlers).',
    category: 'History', difficulty: 'easy',
  },
  {
    id: 'q4', question: 'Which year did the Sierra Leone Civil War end?',
    options: ['1999', '2001', '2002', '2003'],
    correctIndex: 2, explanation: 'The civil war officially ended in January 2002 after 11 years of conflict.',
    category: 'History', difficulty: 'medium',
  },
  {
    id: 'q5', question: 'Who was Sierra Leone\'s first Prime Minister?',
    options: ['Siaka Stevens', 'Milton Margai', 'Albert Margai', 'Ernest Koroma'],
    correctIndex: 1, explanation: 'Sir Milton Margai became the first Prime Minister of Sierra Leone in 1961.',
    category: 'History', difficulty: 'hard',
  },
  // Geography
  {
    id: 'q6', question: 'What is the highest mountain in Sierra Leone?',
    options: ['Mount Bintumani', 'Mount Kakua', 'Sankan Biriwa', 'Mount Loma'],
    correctIndex: 0, explanation: 'Mount Bintumani in the Loma Mountains is the highest peak at 1,948 meters.',
    category: 'Geography', difficulty: 'medium',
  },
  {
    id: 'q7', question: 'How many provinces does Sierra Leone have?',
    options: ['3', '4', '5', '6'],
    correctIndex: 1, explanation: 'Sierra Leone has 4 provinces: Northern, Southern, Eastern, and North West, plus the Western Area.',
    category: 'Geography', difficulty: 'easy',
  },
  {
    id: 'q8', question: 'Which river is the longest in Sierra Leone?',
    options: ['Rokel River', 'Jong River', 'Moa River', 'Scarcies River'],
    correctIndex: 0, explanation: 'The Rokel River (also called Seli River) is the longest river in Sierra Leone at about 240 miles.',
    category: 'Geography', difficulty: 'hard',
  },
  {
    id: 'q9', question: 'Sierra Leone shares borders with which countries?',
    options: ['Guinea and Liberia', 'Guinea and Ivory Coast', 'Liberia and Ghana', 'Guinea and Senegal'],
    correctIndex: 0, explanation: 'Sierra Leone is bordered by Guinea to the north and Liberia to the southeast.',
    category: 'Geography', difficulty: 'easy',
  },
  {
    id: 'q10', question: 'What is the approximate population of Sierra Leone?',
    options: ['5 million', '7 million', '9 million', '12 million'],
    correctIndex: 1, explanation: 'Sierra Leone has approximately 7-8 million people as of recent estimates.',
    category: 'Geography', difficulty: 'medium',
  },
  // Culture
  {
    id: 'q11', question: 'What is the national language of Sierra Leone (besides English)?',
    options: ['Mende', 'Temne', 'Krio', 'Limba'],
    correctIndex: 2, explanation: 'Krio is the lingua franca spoken by the vast majority of Sierra Leoneans across all ethnic groups.',
    category: 'Culture', difficulty: 'easy',
  },
  {
    id: 'q12', question: 'What is Sierra Leone\'s most popular sport?',
    options: ['Cricket', 'Basketball', 'Football (Soccer)', 'Athletics'],
    correctIndex: 2, explanation: 'Football is by far the most popular sport in Sierra Leone.',
    category: 'Culture', difficulty: 'easy',
  },
  {
    id: 'q13', question: 'What does "Salon na we yon" mean in Krio?',
    options: ['Sierra Leone is beautiful', 'Sierra Leone is ours', 'Welcome to Sierra Leone', 'Peace in Sierra Leone'],
    correctIndex: 1, explanation: '"Salon na we yon" translates to "Sierra Leone is ours" - a patriotic expression of ownership and pride.',
    category: 'Culture', difficulty: 'medium',
  },
  {
    id: 'q14', question: 'Which ethnic group is the largest in Sierra Leone?',
    options: ['Temne', 'Mende', 'Kono', 'Limba'],
    correctIndex: 1, explanation: 'The Mende people are the largest ethnic group, primarily in the Southern and Eastern provinces.',
    category: 'Culture', difficulty: 'hard',
  },
  {
    id: 'q15', question: 'What is the traditional Sierra Leonean dish made from cassava leaves?',
    options: ['Jollof rice', 'Cassava leaf sauce (plasas)', 'Fufu', 'Groundnut stew'],
    correctIndex: 1, explanation: 'Plasas is a traditional dish made with cassava leaves, palm oil, and various meats or fish.',
    category: 'Culture', difficulty: 'medium',
  },
  // Economy & Politics
  {
    id: 'q16', question: 'What is Sierra Leone\'s currency?',
    options: ['West African CFA', 'Sierra Leonean Dollar', 'Leone (Le)', 'Sierra Leonean Pound'],
    correctIndex: 2, explanation: 'The Leone (Le) is the official currency of Sierra Leone.',
    category: 'Economy', difficulty: 'easy',
  },
  {
    id: 'q17', question: 'What is Sierra Leone\'s main export?',
    options: ['Coffee', 'Diamonds', 'Timber', 'Cocoa'],
    correctIndex: 1, explanation: 'Diamonds are Sierra Leone\'s most valuable export, though the country also exports rutile, iron ore, and cocoa.',
    category: 'Economy', difficulty: 'easy',
  },
  {
    id: 'q18', question: 'What is the capital city of Sierra Leone?',
    options: ['Bo', 'Kenema', 'Freetown', 'Makeni'],
    correctIndex: 2, explanation: 'Freetown is the capital and largest city of Sierra Leone, located on the Sierra Leone River estuary.',
    category: 'Geography', difficulty: 'easy',
  },
  {
    id: 'q19', question: 'Which diamond from Sierra Leone became famous and was made into a movie?',
    options: ['The Cullinan', 'The Star of Sierra Leone', 'The Blood Diamond', 'The Koh-i-Noor'],
    correctIndex: 2, explanation: 'The 2006 film "Blood Diamond" starring Leonardo DiCaprio highlighted the diamond trade during Sierra Leone\'s civil war.',
    category: 'Economy', difficulty: 'medium',
  },
  {
    id: 'q20', question: 'Sierra Leone is part of which regional economic community?',
    options: ['ECOWAS', 'SADC', 'EAC', 'AU only'],
    correctIndex: 0, explanation: 'Sierra Leone is a member of ECOWAS (Economic Community of West African States).',
    category: 'Economy', difficulty: 'hard',
  },
];

export function getQuizByCategory(category: string): QuizQuestion[] {
  return quizQuestions.filter(q => q.category === category);
}

export function getQuizByDifficulty(difficulty: string): QuizQuestion[] {
  return quizQuestions.filter(q => q.difficulty === difficulty);
}

export function getRandomQuiz(count: number = 10): QuizQuestion[] {
  const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export const quizCategories = ['All', 'History', 'Geography', 'Culture', 'Economy'];
