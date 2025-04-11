import createDOMPurify from 'dompurify';

/**
 * Sanitizes HTML string and allows only bold tags
 */
export const sanitizeMessage = (message: string): string => {
  // Only run on client-side
  if (typeof window === 'undefined') {
    return message;
  }

  const purify = createDOMPurify(window);

  // Configure DOMPurify to only allow <b> and <strong> tags
  // and <br> tags for line breaks
  return purify.sanitize(message, {
    ALLOWED_TAGS: ['b', 'strong', 'br'],
    ALLOWED_ATTR: [],
  });
};

const brokenWebviewPatterns = [
  /FBAN|FBAV/i, // Facebook App
  /Messenger/i, // Facebook Messenger
  /LinkedIn/i, // LinkedIn
];

export function shouldRedirectAth(): boolean {
  const ua = navigator.userAgent;

  return brokenWebviewPatterns.some((pattern) => pattern.test(ua));
}
