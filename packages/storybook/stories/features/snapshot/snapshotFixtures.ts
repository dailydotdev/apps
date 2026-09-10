/* Fixtures shared by the Snapshot stories. */

export const COVER_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 268"><defs><linearGradient id="c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3B2A22"/><stop offset="0.55" stop-color="#5A4436"/><stop offset="1" stop-color="#2A2018"/></linearGradient></defs><rect width="800" height="268" fill="url(#c)"/><g fill="#0F0C0A" opacity="0.55"><rect x="120" y="70" width="90" height="110" rx="4"/><rect x="250" y="52" width="130" height="150" rx="4"/><rect x="420" y="74" width="100" height="104" rx="4"/><rect x="560" y="60" width="120" height="132" rx="4"/></g></svg>',
)}`;

// A plausible six-month read history: dense midweek, quieter at the edges.
export const HEATMAP = Array.from({ length: 88 }, (_, i) => {
  const wave = Math.sin(i / 5) + Math.cos(i / 3.2);
  return Math.max(0, Math.min(3, Math.round(0.55 + wave * 0.85)));
});

// Real production artwork: media.daily.dev serves these with CORS, so the
// capture can inline them.
export const ACHIEVEMENT_ART =
  'https://media.daily.dev/image/upload/s--_MjhSTze--/q_auto/v1773608417/achievements/cant_spend_it_all';

export const UNLOCKED_ART = [
  'https://media.daily.dev/image/upload/s--UV44P2mG--/v1779263302/achievements/big_byte_energy',
  'https://media.daily.dev/image/upload/s--SNnLKKWe--/q_auto/v1773608419/achievements/coraholic',
  'https://media.daily.dev/image/upload/v1770222928/achievements/In_the_big_league.png',
  'https://media.daily.dev/image/upload/s--h7KVoOJI--/q_auto/v1773608418/achievements/referral_spree',
  'https://media.daily.dev/image/upload/v1770222884/achievements/Boosted.png',
  'https://media.daily.dev/image/upload/s--5WqXv9y7--/q_auto/v1773743176/achievements/heros_quest',
  'https://media.daily.dev/image/upload/s--N7NXEDEH--/q_auto/v1770803408/achievements/the_head_of_the_committee.png',
  'https://media.daily.dev/image/upload/s--W0-BqBQd--/v1783416167/achievements/Devil_is_impressed',
  'https://media.daily.dev/image/upload/v1770222923/achievements/Organized.png',
  'https://media.daily.dev/image/upload/v1770222937/achievements/Town_crier.png',
];

export const PROFILE_USER = {
  name: 'Tomer Redlich',
  handle: '@tomer',
};

export const avatarUri = (fill: string, glyph: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#1E2229"/><text x="32" y="43" font-family="sans-serif" font-size="30" font-weight="700" fill="${fill}" text-anchor="middle">${glyph}</text></svg>`,
  )}`;
