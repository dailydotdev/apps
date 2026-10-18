const excludedCompanionOrigins = [
  'http://127.0.0.1:5002',
  'http://localhost',
  'https://daily.dev',
  'https://app.daily.dev',
  'https://twitter.com',
  'https://www.google.com',
  'https://stackoverflow.com',
  'https://mail.google.com',
  'https://meet.google.com',
  'https://calendar.google.com',
  'chrome-extension://',
  'moz-extension://',
  'https://api.daily.dev',
];

// Popular hosts that never match a post, or only match junk homepages.
// Subdomains are blocked too.
const blockedCompanionHosts = new Set([
  'www.facebook.com',
  'web.facebook.com',
  'm.facebook.com',
  'business.facebook.com',
  'adsmanager.facebook.com',
  'developers.facebook.com',
  'www.messenger.com',
  'x.com',
  'www.instagram.com',
  'www.linkedin.com',
  'www.tiktok.com',
  'www.threads.com',
  'www.pinterest.com',
  'www.reddit.com',
  'www.twitch.tv',
  'discord.com',
  'web.whatsapp.com',
  'accounts.google.com',
  'myaccount.google.com',
  'admin.google.com',
  'docs.google.com',
  'drive.google.com',
  'photos.google.com',
  'translate.google.com',
  'chat.google.com',
  'play.google.com',
  'flow.google.com',
  'notebook.google.com',
  'console.cloud.google.com',
  'console.firebase.google.com',
  'studio.youtube.com',
  'www.google.it',
  'www.google.co.uk',
  'outlook.live.com',
  'outlook.office.com',
  'outlook.cloud.microsoft',
  'teams.microsoft.com',
  'teams.public.onecdn.static.microsoft',
  'login.microsoftonline.com',
  'portal.azure.com',
  'dev.azure.com',
  'gitlab.com',
  'bitbucket.org',
  'id.atlassian.com',
  'trello.com',
  'dash.cloudflare.com',
  'console.aws.amazon.com',
  'app.datadoghq.com',
  'app.datadoghq.eu',
  'one.newrelic.com',
  'one.eu.newrelic.com',
  'dashboard.stripe.com',
  'appstoreconnect.apple.com',
  'railway.com',
  'dashboard.render.com',
  'app.netlify.com',
  'cloud.digitalocean.com',
  'cloud.oracle.com',
  'console.tailscale.com',
  'eu.posthog.com',
  'hpanel.hostinger.com',
  'forge.laravel.com',
  'ploi.io',
  'app.notion.com',
  'app.slack.com',
  'app.clickup.com',
  'app.asana.com',
  'workona.com',
  'mail.proton.me',
  'www.loom.com',
  'app.brevo.com',
  'admin.shopify.com',
  'show.zoho.in',
  'cliq.zoho.in',
  'search.brave.com',
  'www.bing.com',
  'www.amazon.com',
  'www.amazon.in',
  'www.amazon.de',
  'www.amazon.fr',
  'www.amazon.co.uk',
  'www.amazon.com.br',
  'www.mercadolivre.com.br',
  'www.flipkart.com',
  'www.olx.pl',
  'www.airbnb.com',
  'www.booking.com',
  'open.spotify.com',
  'www.primevideo.com',
  'www.hotstar.com',
  'www.imdb.com',
  'www.bilibili.com',
  'map.baidu.com',
  'store.steampowered.com',
  'www.chess.com',
  'lichess.org',
  'www.udemy.com',
  'www.upwork.com',
  'smartapply.indeed.com',
  'dribbble.com',
  'www.figma.com',
]);

const localHostSuffixes = ['.local', '.localhost', '.test', '.internal'];
const ipv4Regex = /^\d{1,3}(\.\d{1,3}){3}$/;

const isLocalHost = (hostname: string): boolean =>
  hostname === 'localhost' ||
  hostname.startsWith('[') ||
  ipv4Regex.test(hostname) ||
  localHostSuffixes.some((suffix) => hostname.endsWith(suffix));

const isBlockedHost = (hostname: string): boolean => {
  const labels = hostname.split('.');
  return labels.some((_, index) =>
    blockedCompanionHosts.has(labels.slice(index).join('.')),
  );
};

const isHttpUrl = (url: URL): boolean =>
  url.protocol === 'http:' || url.protocol === 'https:';

export const shouldSkipCompanionUrl = (url: URL): boolean =>
  !isHttpUrl(url) ||
  excludedCompanionOrigins.some((origin) => url.origin.includes(origin)) ||
  isLocalHost(url.hostname) ||
  isBlockedHost(url.hostname);
