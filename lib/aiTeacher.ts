// ============================================================
// Salon na we yon - AI Teaching System
// Smart AI for teaching with subscription assessment
// ============================================================

import type { Course, AIQuestion } from './types';

export const courses: Course[] = [
  {
    id: 'course_krio',
    title: 'Krio Language',
    description: 'Learn Sierra Leone\'s lingua franca - Krio. Master common phrases, grammar, and conversation skills.',
    instructor: 'Henry Tucker',
    tier: 'basic',
    icon: '💬',
    color: '#007A3D',
    category: 'Language',
    lessons: [
      {
        id: 'krio_1',
        title: 'Greetings & Basics',
        content: 'Krio greetings:\n• "How di body?" - How are you?\n• "Ah de" - I\'m fine\n• "Tenki" - Thank you\n• "Wetin na yu nam?" - What\'s your name?\n• "Mi nam na..." - My name is...\n• "Gud mornin" - Good morning\n• "Gud aftanun" - Good afternoon\n• "Gud nayt" - Good night',
        questions: [
          { id: 'kq1', question: 'How do you say "How are you?" in Krio?', options: ['How di body?', 'Wetin de hapun?', 'How yu de?', 'Wetin na news?'], correctIndex: 0, explanation: '"How di body?" is the common Krio greeting meaning "How are you?"' },
          { id: 'kq2', question: 'What does "Tenki" mean in Krio?', options: ['Goodbye', 'Thank you', 'Please', 'Sorry'], correctIndex: 1, explanation: '"Tenki" means "Thank you" in Krio.' },
          { id: 'kq3', question: 'How do you say "Good morning" in Krio?', options: ['Gud mornin', 'Gud nayt', 'How di body', 'See yu'], correctIndex: 0, explanation: '"Gud mornin" is Krio for "Good morning".' },
        ],
      },
      {
        id: 'krio_2',
        title: 'Common Expressions',
        content: 'Useful Krio expressions:\n• "Salon na we yon" - Sierra Leone is ours\n• "Wetin yu want?" - What do you want?\n• "Ah no sabi" - I don\'t understand\n• "Kom na ya" - Come here\n• "Lef mi" - Leave me alone\n• "Nar so" - That\'s right/Exactly\n• "Wahala" - Trouble/Problem\n• "Dey fain" - It\'s fine',
        questions: [
          { id: 'kq4', question: 'What does "Salon na we yon" mean?', options: ['Sierra Leone is beautiful', 'Sierra Leone is ours', 'Welcome to Sierra Leone', 'Sierra Leone is great'], correctIndex: 1, explanation: '"Salon na we yon" means "Sierra Leone is ours" - a patriotic expression.' },
          { id: 'kq5', question: 'What does "Wahala" mean?', options: ['Happiness', 'Trouble/Problem', 'Food', 'Money'], correctIndex: 1, explanation: '"Wahala" means trouble or problem in Krio.' },
        ],
      },
    ],
  },
  {
    id: 'course_history',
    title: 'Sierra Leone History',
    description: 'Deep dive into Sierra Leone\'s rich history from pre-colonial times to modern day.',
    instructor: 'Henry Tucker',
    tier: 'basic',
    icon: '📚',
    color: '#E8850C',
    category: 'History',
    lessons: [
      {
        id: 'hist_1',
        title: 'Pre-Colonial Era',
        content: 'Before European contact, Sierra Leone was home to various ethnic groups including the Temne, Mende, Limba, and Kono peoples. The region was known for its skilled artisans and vibrant trade networks. Portuguese explorers arrived in the 1460s and named the mountainous peninsula "Serra Leoa" (Lioness Mountains).',
        questions: [
          { id: 'hq1', question: 'Who named Sierra Leone?', options: ['British explorers', 'Portuguese explorers', 'French explorers', 'Dutch traders'], correctIndex: 1, explanation: 'Portuguese explorer Pedro de Sintra named it "Serra Leoa" around 1462.' },
          { id: 'hq2', question: 'What does "Serra Leoa" mean?', options: ['Beautiful Coast', 'Lioness Mountains', 'Rich Land', 'Free Port'], correctIndex: 1, explanation: '"Serra Leoa" means Lioness Mountains in Portuguese.' },
        ],
      },
    ],
  },
  {
    id: 'course_business',
    title: 'Business & Entrepreneurship',
    description: 'Learn business skills, financial literacy, and entrepreneurship tailored for Sierra Leone\'s economy.',
    instructor: 'Henry Tucker',
    tier: 'premium',
    icon: '💼',
    color: '#7B2D8E',
    category: 'Business',
    lessons: [
      {
        id: 'biz_1',
        title: 'Starting a Business in Sierra Leone',
        content: 'Key steps to start a business in Sierra Leone:\n1. Register with the Corporate Affairs Commission\n2. Obtain a business license\n3. Open a business bank account\n4. Understand tax obligations (NRA)\n5. Build a network and find mentors\n\nPopular sectors: Agriculture, Mining, Tourism, Tech, Retail',
        questions: [
          { id: 'bq1', question: 'Where do you register a business in Sierra Leone?', options: ['Bank of Sierra Leone', 'Corporate Affairs Commission', 'Ministry of Trade', 'City Council'], correctIndex: 1, explanation: 'The Corporate Affairs Commission handles business registration in Sierra Leone.' },
        ],
      },
    ],
  },
  {
    id: 'course_tech',
    title: 'Digital Skills & Technology',
    description: 'Master digital skills from basic computer literacy to web development and mobile app creation.',
    instructor: 'Henry Tucker',
    tier: 'premium',
    icon: '💻',
    color: '#0077B6',
    category: 'Technology',
    lessons: [
      {
        id: 'tech_1',
        title: 'Introduction to Digital Skills',
        content: 'In today\'s world, digital skills are essential. This course covers:\n• Computer basics and internet safety\n• Email and online communication\n• Social media for business\n• Introduction to coding\n• Mobile money and digital payments\n• Creating content online',
        questions: [
          { id: 'tq1', question: 'Why are digital skills important in Sierra Leone?', options: ['They are not important', 'They enable participation in the global economy', 'Only for young people', 'Only for office workers'], correctIndex: 1, explanation: 'Digital skills enable Sierra Leoneans to participate in the growing digital economy and access global opportunities.' },
        ],
      },
    ],
  },
  {
    id: 'course_health',
    title: 'Health & Wellness',
    description: 'Learn about health, nutrition, mental wellness, and community health practices.',
    instructor: 'Henry Tucker',
    tier: 'premium',
    icon: '🏥',
    color: '#E91E63',
    category: 'Health',
    lessons: [
      {
        id: 'health_1',
        title: 'Community Health Basics',
        content: 'Key health topics for Sierra Leone:\n• Malaria prevention and treatment\n• Maternal and child health\n• Water and sanitation (WASH)\n• Mental health awareness\n• Nutrition and food safety\n• Ebola and COVID-19 lessons learned',
        questions: [
          { id: 'heq1', question: 'What is the most common disease in Sierra Leone?', options: ['Cholera', 'Malaria', 'Tuberculosis', 'Diabetes'], correctIndex: 1, explanation: 'Malaria is the most prevalent disease in Sierra Leone, especially during the rainy season.' },
        ],
      },
    ],
  },
];

export function getCoursesByTier(tier: 'free' | 'basic' | 'premium'): Course[] {
  if (tier === 'premium') return courses;
  if (tier === 'basic') return courses.filter(c => c.tier === 'basic');
  return [];
}

export function getAccessibleCourses(userTier: 'free' | 'basic' | 'premium'): Course[] {
  if (userTier === 'premium') return courses;
  if (userTier === 'basic') return courses.filter(c => c.tier === 'basic');
  return courses.filter(c => c.tier === 'basic'); // Free users can see basic courses
}

export function canAccessCourse(course: Course, userTier: 'free' | 'basic' | 'premium'): boolean {
  if (course.tier === 'basic') return true; // Basic courses accessible to all
  return userTier === 'premium';
}

// AI Assessment - evaluates student performance
export function assessPerformance(
  totalQuestions: number,
  correctAnswers: number,
  timeSpentSeconds: number
): { score: number; grade: string; feedback: string; recommendation: string } {
  const percentage = (correctAnswers / totalQuestions) * 100;
  const avgTimePerQuestion = timeSpentSeconds / totalQuestions;

  let grade: string;
  let feedback: string;
  let recommendation: string;

  if (percentage >= 90) {
    grade = 'A+';
    feedback = 'Excellent performance! You have a strong understanding of this material.';
    recommendation = 'Ready for advanced topics. Consider helping other students as a peer mentor.';
  } else if (percentage >= 80) {
    grade = 'A';
    feedback = 'Great work! You demonstrate solid comprehension.';
    recommendation = 'Review the few areas you missed, then move on to the next level.';
  } else if (percentage >= 70) {
    grade = 'B';
    feedback = 'Good understanding with some areas to improve.';
    recommendation = 'Focus on the topics where you made mistakes. Practice makes perfect!';
  } else if (percentage >= 60) {
    grade = 'C';
    feedback = 'Adequate understanding but more practice is needed.';
    recommendation = 'Review the lesson content again and retake the assessment.';
  } else if (percentage >= 50) {
    grade = 'D';
    feedback = 'You\'re struggling with some concepts. Don\'t give up!';
    recommendation = 'Go back through the lesson carefully. Consider asking questions in the chat room.';
  } else {
    grade = 'F';
    feedback = 'This topic needs more study. Take your time and try again.';
    recommendation = 'Start from the beginning of the lesson. Use all available resources and ask for help.';
  }

  // Factor in time
  if (avgTimePerQuestion < 5 && percentage < 80) {
    feedback += ' Try taking more time to read each question carefully.';
  }

  return { score: percentage, grade, feedback, recommendation };
}
