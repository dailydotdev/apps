// Events defined with code in X Events Manager on pixel o6izs, created
// 2026-11-12 for the daily.dev for Startups X ads. The /startups/ landing page
// fires "Startups checkout click" (tw-o6izs-riwke) itself. daily-api sends
// "Startups signup" and "Startups first post" from the server too, under the
// same conversion ids.
export const STARTUPS_X_EVENTS = {
  signup: 'tw-o6izs-riwka',
  firstPost: 'tw-o6izs-rjhe2',
  beginCheckout: 'tw-o6izs-riwkb',
  subscription: 'tw-o6izs-riwk5',
} as const;
