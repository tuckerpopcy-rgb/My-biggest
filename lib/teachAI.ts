import { CourseId } from './types';

export const ACADEMY_FEE = 1000;
export const ORANGE_MONEY = '+23278005188';

export const COURSES: {
  id: CourseId;
  title: string;
  tag: string;
  icon: 'trending-up' | 'desktop' | 'code-slash';
  summary: string;
}[] = [
  {
    id: 'forex',
    title: 'Forex Trading',
    tag: 'Markets',
    icon: 'trending-up',
    summary: 'Currency pairs, risk, charts and a Salone money discipline.',
  },
  {
    id: 'office',
    title: 'Microsoft Office Package',
    tag: 'Workplace',
    icon: 'desktop',
    summary: 'Word, Excel, PowerPoint and Outlook for real office work.',
  },
  {
    id: 'software',
    title: 'Software Engineering',
    tag: 'Build',
    icon: 'code-slash',
    summary: 'How working software is designed, written, tested and shipped.',
  },
];

type Lesson = { keys: string[]; answer: string };

const FOREX: Lesson[] = [
  {
    keys: ['start', 'begin', 'intro', 'what is forex', 'hello'],
    answer:
      'Welcome to Salon Academy — Forex. Forex is the foreign-exchange market: people and firms trade one currency for another. A pair like USD/SLL or EUR/USD has a base and a quote. Price is how many units of the quote you pay for one unit of the base. We trade with a plan, not with hope. First law: never risk money you need for rice, rent or school.',
  },
  {
    keys: ['pair', 'currency', 'usd', 'eur', 'gbp', 'sll', 'leone'],
    answer:
      'Major pairs: EUR/USD, GBP/USD, USD/JPY, USD/CHF. Crosses drop the dollar (EUR/GBP). Exotics include African names such as USD/ZAR. The Leone (SLE/SLL) is thinly traded — spreads are wide, so we study majors first. Pip is the usual smallest price step. On most pairs a pip is 0.0001; on JPY pairs it is 0.01.',
  },
  {
    keys: ['lot', 'leverage', 'margin', 'risk', 'stop'],
    answer:
      'A standard lot is 100,000 units of the base. Mini 10,000. Micro 1,000. Leverage (say 1:50) lets a small deposit control a larger position — it multiplies both gain and loss. Margin is the deposit the broker holds. Always place a stop-loss before you enter. A simple rule: risk at most 1% of your account on one trade. If the account is Le 5,000 practice capital, one loss should not exceed Le 50 of that practice pot.',
  },
  {
    keys: ['chart', 'candle', 'support', 'resistance', 'trend'],
    answer:
      'A candlestick shows open, high, low and close. Green (or white) close above open; red close below. Support is a floor where buyers have stepped in; resistance is a ceiling. Trend: higher highs and higher lows = uptrend. We do not fight a strong trend with a tiny account. Timeframes: daily for direction, 1-hour for entry. Indicators (RSI, moving averages) are helpers, not oracles.',
  },
  {
    keys: ['news', 'nfp', 'interest', 'central bank', 'spread'],
    answer:
      'News moves forex. Interest-rate decisions, inflation and US Non-Farm Payrolls can whip prices. Spreads widen around news — stay flat if you are new. The Bank of Sierra Leone sets Leone policy; the Fed, ECB and BoE move the majors. Keep a calendar. After a spike, wait for a candle to close before you act.',
  },
  {
    keys: ['plan', 'journal', 'psychology', 'greed'],
    answer:
      'Write a one-page plan: pairs you trade, session (London or New York), risk 1%, entry rule, exit rule. Journal every trade: why you entered, how you felt, result. Greed after a win and revenge after a loss destroy accounts. Salon Academy rule: three losses in a row — stop for the day. Practice on a demo first. Real money comes only after 30 journaled demo trades with a written review.',
  },
];

const OFFICE: Lesson[] = [
  {
    keys: ['start', 'begin', 'intro', 'what is', 'hello', 'package'],
    answer:
      'Welcome to Salon Academy — Microsoft Office. The package we teach is Word, Excel, PowerPoint and Outlook. These are the tools Freetown offices, NGOs, schools and ministries actually use. We work with files you can send by email or WhatsApp. Save often. Use clear file names: 2026-04-report-bo-market.docx — not “final-final2”.',
  },
  {
    keys: ['word', 'document', 'letter', 'cv', 'resume'],
    answer:
      'Word: set the page (A4, 2.5 cm margins). Styles (Heading 1, Normal) beat manual bolding — they build a table of contents later. For a letter: date top right, recipient, subject line in bold, short paragraphs, complimentary close. For a CV: name large, contacts, education, experience with verbs (Managed, Built, Taught). Ctrl+S save. Ctrl+Z undo. Track Changes for editors.',
  },
  {
    keys: ['excel', 'sheet', 'formula', 'sum', 'chart', 'budget'],
    answer:
      'Excel is a grid. Cell A1 is column A, row 1. Start every formula with =. =SUM(B2:B13) adds a range. =AVERAGE, =IF(B2>0,"Yes","No"), =VLOOKUP or XLOOKUP to pull a price from a list. Freeze the top row so headings stay. For a Leone budget: Income sheet, Expense sheet, a Dashboard with SUM and a pie chart. Never type a total by hand if a formula can do it.',
  },
  {
    keys: ['powerpoint', 'slide', 'present', 'design'],
    answer:
      'PowerPoint: one idea per slide. Title, then 3–5 short lines — not a paragraph. High contrast (dark text on light, or the reverse). Pictures from your own photos when you can. Animations: simple appear, not bounce. Presenter view shows notes only to you. Rehearse out loud. Six seconds of silence after a key number lets the room hear it.',
  },
  {
    keys: ['outlook', 'email', 'calendar', 'meeting'],
    answer:
      'Outlook (or any serious mail): subject that a busy person understands. Greeting, purpose in the first two lines, numbered asks, sign-off with your phone. CC only people who must see it. Calendar: block prep time before meetings. Attach the file, or share a OneDrive/Google link if it is large. Search folders save you from drowning.',
  },
  {
    keys: ['shortcut', 'save', 'pdf', 'share'],
    answer:
      'Daily shortcuts: Ctrl+C copy, Ctrl+V paste, Ctrl+X cut, Ctrl+B bold, Ctrl+P print. File → Save As → PDF when you send a finished letter so the layout cannot drift. Keep a folder per project. Back up to a flash drive or cloud once a week. That habit is worth more than any fancy feature.',
  },
];

const SOFTWARE: Lesson[] = [
  {
    keys: ['start', 'begin', 'intro', 'what is', 'hello', 'engineer'],
    answer:
      'Welcome to Salon Academy — Software Engineering. We build working programs that other people can use and maintain. Code is the easy part. The craft is: understand the problem, design a small solution, write it, test it, ship it, listen, improve. Languages come and go. Clear thinking stays.',
  },
  {
    keys: ['language', 'javascript', 'python', 'html', 'css'],
    answer:
      'Start path: HTML structures a page, CSS styles it, JavaScript makes it move. Python is excellent for logic, data and first scripts. In this academy we speak in plain steps so you can later pick JS or Python with confidence. A program is input → process → output. Name things so a stranger knows what they are: totalPrice, not x.',
  },
  {
    keys: ['algorithm', 'loop', 'if', 'function', 'variable'],
    answer:
      'Variable: a labelled box that holds a value. If/else: a fork in the road. Loop: do this until a condition fails. Function: a named recipe you can call again. Algorithm: the ordered steps, written before or while you code. Example: to find the largest of three numbers, compare first two, then compare the winner with the third. Write that in words, then in code.',
  },
  {
    keys: ['git', 'github', 'version', 'team'],
    answer:
      'Git records every change. commit = a snapshot with a message. branch = a safe lane for a new idea. merge = bring it back. GitHub (or similar) hosts the history so a team in Freetown and Kenema can work on one app. Never commit passwords. Small commits with honest messages beat one giant “stuff”.',
  },
  {
    keys: ['test', 'bug', 'debug', 'error'],
    answer:
      'A bug is a mismatch between what you meant and what the machine did. Read the error from the bottom. Reproduce it. Change one thing. Test again. Write a tiny test that fails first, then make it pass. Users will find what you missed — that is normal. Log it, fix it, thank them.',
  },
  {
    keys: ['app', 'database', 'api', 'project'],
    answer:
      'A typical app: interface (what the person sees) → API (the waiter) → database (the store). Salone Na We Yon itself is that shape: screens, a live store, accounts that stay until logout. For your first project pick one job: a market price list, a study timetable, a loan tracker. Ship a thin version in a week. Then add one feature at a time.',
  },
];

const BANK: Record<CourseId, Lesson[]> = {
  forex: FOREX,
  office: OFFICE,
  software: SOFTWARE,
};

function score(q: string, keys: string[]) {
  let s = 0;
  for (const k of keys) {
    if (q.includes(k)) s += k.length > 6 ? 3 : 2;
  }
  return s;
}

export function askTeacher(subject: CourseId, raw: string): string {
  const q = raw.trim().toLowerCase();
  const bank = BANK[subject] || [];
  if (!q) {
    return bank[0]?.answer || 'Ask a real question about this subject.';
  }
  let best = bank[0];
  let bestScore = 0;
  bank.forEach((row) => {
    const s = score(q, row.keys);
    if (s > bestScore) {
      bestScore = s;
      best = row;
    }
  });
  if (bestScore >= 2 && best) return best.answer;
  const title = COURSES.find((c) => c.id === subject)?.title || subject;
  return (
    `I am your ${title} lecturer in Salon Academy. I stay with this subject.\n\n` +
    `Ask me about the ideas in the syllabus — for example: ` +
    (subject === 'forex'
      ? 'pairs, pips, leverage, charts, news, or a trading plan.'
      : subject === 'office'
      ? 'Word letters, Excel formulas, PowerPoint slides, or Outlook mail.'
      : 'variables, functions, algorithms, git, testing, or how an app is built.') +
    '\n\nSay it in your own words. I will teach, not dump slogans.'
  );
}

export function openingLecture(subject: CourseId): string {
  return BANK[subject][0]?.answer || 'Class is in session.';
}
