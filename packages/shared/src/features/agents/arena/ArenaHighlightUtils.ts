export const stripTcoLinks = (text: string): string =>
  text.replace(/https?:\/\/t\.co\/\S+/g, '').trim();
