const themeCookieName = 'showmethelight';

export function toggleTheme(): boolean {
  const isLight = document.documentElement.classList.toggle('light');
  document.cookie = `${themeCookieName}=${isLight};path=/;domain=${
    process.env.NEXT_PUBLIC_DOMAIN
  };samesite=lax;expires=${60 * 60 * 24 * 365 * 10}`;
  return isLight;
}

export function applyTheme(): void {
  const isLight = document.cookie
    .split('; ')
    .find((row) => row.startsWith(themeCookieName))
    ?.split('=')[1];
  if (isLight === 'true') {
    document.documentElement.classList.add('light');
  }
}
