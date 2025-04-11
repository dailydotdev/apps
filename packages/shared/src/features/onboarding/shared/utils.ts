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
  const isBrokenWebview = brokenWebviewPatterns.some((pattern) =>
    pattern.test(ua),
  );

  if (isBrokenWebview) {
    return true;
  }

  // Advanced in-app detection (WebView or missing Safari)
  const advancedInAppDetection = () => {
    const rules = [
      'WebView', // Generic WebView detection
      '(iPhone|iPod|iPad)(?!.*Safari/)', // iOS WebView without Safari
      'Android.*(wv)', // Android WebView
      '(AppleWebKit)(?!.*Safari)', // iOS Safari WebView (missing Safari in UA)
    ];
    const regex = new RegExp(`(${rules.join('|')})`, 'ig');
    return !!ua.match(regex);
  };

  return advancedInAppDetection();
}
