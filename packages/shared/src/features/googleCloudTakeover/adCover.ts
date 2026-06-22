// Cover art for the Google Cloud ad (third) card, rebuilt as a self-contained
// SVG data URI so the long-lived demo has no external image dependency.
// Recreates the supplied creative: light surface, multicolor "Google Cloud"
// wordmark, "Wasting time managing infra?" headline, and the gradient circles.

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" font-family="Arial, Helvetica, sans-serif">
  <defs>
    <linearGradient id="gcMed" x1="0.75" y1="0" x2="0.2" y2="1">
      <stop offset="0" stop-color="#EA4335"/>
      <stop offset="1" stop-color="#7C4DFF"/>
    </linearGradient>
    <linearGradient id="gcSmall" x1="0.4" y1="0" x2="0.5" y2="1">
      <stop offset="0" stop-color="#F4511E"/>
      <stop offset="1" stop-color="#FFB300"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="#F1F3F4"/>
  <circle cx="448" cy="492" r="162" fill="#4285F4"/>
  <circle cx="336" cy="416" r="58" fill="url(#gcMed)"/>
  <circle cx="84" cy="540" r="64" fill="url(#gcSmall)"/>
  <text x="42" y="60" font-size="30" font-weight="700">
    <tspan fill="#4285F4">G</tspan><tspan fill="#EA4335">o</tspan><tspan fill="#FBBC05">o</tspan><tspan fill="#4285F4">g</tspan><tspan fill="#34A853">l</tspan><tspan fill="#EA4335">e</tspan><tspan fill="#5F6368"> Cloud</tspan>
  </text>
  <text x="40" y="200" font-size="66" font-weight="700" fill="#202124">
    <tspan x="40" dy="0">Wasting time</tspan>
    <tspan x="40" dy="74">managing</tspan>
    <tspan x="40" dy="74">infra?</tspan>
  </text>
</svg>`;

export const googleCloudAdCoverDataUri = `data:image/svg+xml,${encodeURIComponent(
  svg,
)}`;
