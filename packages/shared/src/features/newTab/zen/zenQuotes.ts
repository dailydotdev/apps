export interface ZenQuote {
  text: string;
  author: string;
}

// A curated, developer-relevant, calm-leaning rotation. Short (<140 chars) so
// they read cleanly at the top of a Zen screen. Deliberately avoids the
// hustle/grind register that clashes with the mode's intent.
export const ZEN_QUOTES: ZenQuote[] = [
  {
    text: 'Make it work, make it right, make it fast.',
    author: 'Kent Beck',
  },
  {
    text: 'Simplicity is the soul of efficiency.',
    author: 'Austin Freeman',
  },
  {
    text: 'Walking on water and developing software from a specification are easy if both are frozen.',
    author: 'Edward V. Berard',
  },
  {
    text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    author: 'Martin Fowler',
  },
  {
    text: 'The best way to get a project done faster is to start sooner.',
    author: 'Jim Highsmith',
  },
  {
    text: 'Measuring programming progress by lines of code is like measuring aircraft building progress by weight.',
    author: 'Bill Gates',
  },
  {
    text: 'It always takes longer than you expect, even when you take into account Hofstadter\u2019s Law.',
    author: 'Hofstadter\u2019s Law',
  },
  {
    text: 'Premature optimization is the root of all evil.',
    author: 'Donald Knuth',
  },
  {
    text: 'The function of good software is to make the complex appear to be simple.',
    author: 'Grady Booch',
  },
  {
    text: 'Programs must be written for people to read, and only incidentally for machines to execute.',
    author: 'Harold Abelson',
  },
  {
    text: 'First, solve the problem. Then, write the code.',
    author: 'John Johnson',
  },
  {
    text: 'The most important property of a program is whether it accomplishes the intention of its user.',
    author: 'C. A. R. Hoare',
  },
  {
    text: 'If you optimize everything, you will always be unhappy.',
    author: 'Donald Knuth',
  },
  {
    text: 'There are only two hard things in computer science: cache invalidation and naming things.',
    author: 'Phil Karlton',
  },
  {
    text: 'The best error message is the one that never shows up.',
    author: 'Thomas Fuchs',
  },
  {
    text: 'Deleted code is debugged code.',
    author: 'Jeff Sickel',
  },
  {
    text: 'Talk is cheap. Show me the code.',
    author: 'Linus Torvalds',
  },
  {
    text: 'Done is better than perfect.',
    author: 'Sheryl Sandberg',
  },
  {
    text: 'Code is like humor. When you have to explain it, it\u2019s bad.',
    author: 'Cory House',
  },
  {
    text: 'Focus is the art of knowing what to ignore.',
    author: 'James Clear',
  },
];

// Deterministic daily quote so the same tab refresh doesn't reshuffle on
// every render. We hash the local date string (YYYY-MM-DD) into the quote
// array index.
// eslint-disable-next-line no-bitwise -- DJB2-style hash is intentional and
// safe: bounded inputs (date strings), used only to pick an array index.
const hashString = (input: string): number => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + input.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash |= 0;
  }
  return Math.abs(hash);
};

export const localDateKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDailyQuote = (date: Date = new Date()): ZenQuote => {
  const index = hashString(localDateKey(date)) % ZEN_QUOTES.length;
  return ZEN_QUOTES[index];
};
