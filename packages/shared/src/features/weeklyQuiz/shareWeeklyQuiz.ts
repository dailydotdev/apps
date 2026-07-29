interface ShareWeeklyQuizParams {
  title?: string;
  text?: string;
}

// Best-effort share: the native share sheet where available, clipboard
// otherwise. The link/text will point at the real quiz URL once it exists;
// today it shares the current page.
export const shareWeeklyQuiz = ({
  title = 'The Weekly Tech News Quiz',
  text,
}: ShareWeeklyQuizParams = {}): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title, text, url }).catch(() => undefined);
    return;
  }
  const clipboardText = text ? `${text} ${url}` : url;
  navigator.clipboard?.writeText(clipboardText).catch(() => undefined);
};
