const STYLE_TAG_ID = 'embedded-browsing-styles';

const ensureStyles = (): void => {
  if (document.getElementById(STYLE_TAG_ID)) {
    return;
  }
  const style = document.createElement('style');
  style.id = STYLE_TAG_ID;
  style.textContent = `
    .embedded-browsing-shell {
      position: relative;
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 28rem;
      overflow: visible;
    }
    .embedded-browsing-ambient {
      pointer-events: none;
      position: absolute;
      inset: 0;
      overflow: hidden;
      opacity: 0.44;
      background:
        repeating-linear-gradient(
          120deg,
          rgba(255, 255, 255, 0.06) 0,
          rgba(255, 255, 255, 0.06) 0.75rem,
          transparent 0.75rem,
          transparent 1.5rem
        ),
        linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.02),
          rgba(255, 255, 255, 0.04)
        );
      background-size: 190% 190%, 100% 100%;
      animation: embeddedBrowsingStripeShift 42s linear infinite;
      will-change: background-position;
    }
    .embedded-browsing-ambient::before {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        120deg,
        transparent 0,
        transparent 1.75rem,
        rgba(255, 255, 255, 0.04) 1.75rem,
        rgba(255, 255, 255, 0.04) 2.5rem
      );
      background-size: 220% 220%;
      animation: embeddedBrowsingStripeShiftReverse 58s linear infinite;
      opacity: 0.24;
    }
    @keyframes embeddedBrowsingStripeShift {
      0% { background-position: 0% 0%, 50% 50%; }
      100% { background-position: 220% 120%, 50% 50%; }
    }
    @keyframes embeddedBrowsingStripeShiftReverse {
      0% { background-position: 220% 140%; }
      100% { background-position: 0% 0%; }
    }
    @media (prefers-reduced-motion: reduce) {
      .embedded-browsing-ambient,
      .embedded-browsing-ambient::before {
        animation: none;
      }
      .embedded-browsing-ambient {
        background-position: 50% 50%, 50% 50%;
        opacity: 0.42;
      }
      .embedded-browsing-ambient::before {
        opacity: 0.18;
      }
    }
    .embedded-browsing-card {
      position: relative;
      z-index: 10;
      display: flex;
      width: 100%;
      max-width: 40rem;
      flex-shrink: 0;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem;
      text-align: center;
    }
    .embedded-browsing-heading {
      margin: 0;
      font-size: 1.25rem;
      line-height: 1.625rem;
      font-weight: 700;
      color: #ffffff;
    }
    .embedded-browsing-body {
      margin: 0;
      font-size: 0.9375rem;
      line-height: 1.25rem;
      color: #cfd6e6;
    }
    .embedded-browsing-status {
      margin: 0;
      font-size: 0.8125rem;
      line-height: 1.125rem;
      color: #a8b3cf;
    }
    .embedded-browsing-actions {
      margin-top: 0.25rem;
      display: flex;
      width: 100%;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .embedded-browsing-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      min-width: 8.5rem;
      height: 2.5rem;
      padding: 0 1rem;
      border: 0;
      border-radius: 12px;
      background: #c029f0;
      color: #ffffff;
      font: inherit;
      font-size: 0.9375rem;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 150ms ease, transform 150ms ease;
    }
    .embedded-browsing-button:hover {
      opacity: 0.92;
      transform: translateY(-1px);
    }
    .embedded-browsing-button:disabled { opacity: 0.6; cursor: not-allowed; }
  `;
  document.head.appendChild(style);
};

type PromptShell = {
  shell: HTMLDivElement;
  card: HTMLDivElement;
};

const createPromptShell = (): PromptShell => {
  ensureStyles();
  const shell = document.createElement('div');
  shell.className = 'embedded-browsing-shell';
  const ambient = document.createElement('div');
  ambient.className = 'embedded-browsing-ambient';
  ambient.setAttribute('aria-hidden', 'true');
  const card = document.createElement('div');
  card.className = 'embedded-browsing-card';
  shell.append(ambient, card);
  return { shell, card };
};

export const renderMessage = (
  root: HTMLDivElement,
  title: string,
  body: string,
): void => {
  root.replaceChildren();
  const { shell, card } = createPromptShell();

  const heading = document.createElement('h2');
  heading.className = 'embedded-browsing-heading';
  heading.textContent = title;

  const paragraph = document.createElement('p');
  paragraph.className = 'embedded-browsing-body';
  paragraph.textContent = body;

  card.append(heading, paragraph);
  root.append(shell);
};

type PermissionRequestOutcome = 'granted' | 'dismissed' | 'failed';

export const renderPermissionPrompt = ({
  root,
  onRequestPermission,
}: {
  root: HTMLDivElement;
  onRequestPermission: () => Promise<PermissionRequestOutcome>;
}): void => {
  root.replaceChildren();
  const { shell, card } = createPromptShell();

  const heading = document.createElement('h2');
  heading.className = 'embedded-browsing-heading';
  heading.textContent = 'Enable embedded browsing';

  const description = document.createElement('p');
  description.className = 'embedded-browsing-body';
  description.textContent =
    'To load websites inside daily.dev, allow this extension to modify response headers on embedded pages.';

  const status = document.createElement('p');
  status.className = 'embedded-browsing-status';
  status.textContent =
    'This is optional and only applies to pages embedded by daily.dev.';

  const actions = document.createElement('div');
  actions.className = 'embedded-browsing-actions';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'embedded-browsing-button';
  button.textContent = 'Enable for this browser';

  const resetButton = () => {
    button.disabled = false;
  };

  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = 'Requesting permissions...';

    const outcome = await onRequestPermission();
    if (outcome === 'granted') {
      status.textContent = 'Permissions granted. Reloading extension...';
      return;
    }

    if (outcome === 'dismissed') {
      status.textContent = 'Permission request was dismissed.';
      resetButton();
      return;
    }

    status.textContent = 'Failed to enable embedded browsing.';
    resetButton();
  });

  actions.append(button);
  card.append(heading, description, status, actions);
  root.append(shell);
};
