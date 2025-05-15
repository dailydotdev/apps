import createDOMPurify from 'dompurify';

/**
 * Sanitizes HTML string and allows only bold tags
 */
export const sanitizeMessage = (
  message: string,
  allowedTags = ['b', 'strong', 'br'],
): string => {
  // Only run on client-side
  if (typeof window === 'undefined') {
    return message;
  }

  const purify = createDOMPurify(window);

  // Configure DOMPurify to only allow <b> and <strong> tags
  // and <br> tags for line breaks
  return purify.sanitize(message, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: [],
  });
};

const brokenWebviewPatterns = [
  /FBAN|FBAV/i, // Facebook App
  /Messenger/i, // Facebook Messenger
  /LinkedIn/i, // LinkedIn
];

export function shouldRedirectAuth(): boolean {
  const ua = navigator.userAgent;

  return brokenWebviewPatterns.some((pattern) => pattern.test(ua));
}

export const AUTH_REDIRECT_KEY = 'auth_redirect';
