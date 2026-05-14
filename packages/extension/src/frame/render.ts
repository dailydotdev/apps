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
      opacity: 0.5;
      background:
        radial-gradient(
          circle at 50% 42%,
          rgba(192, 41, 240, 0.18) 0,
          transparent 18rem
        ),
        radial-gradient(
          circle at 38% 58%,
          rgba(57, 217, 138, 0.1) 0,
          transparent 16rem
        ),
        radial-gradient(
          circle at 62% 58%,
          rgba(82, 139, 255, 0.1) 0,
          transparent 16rem
        );
      animation: embeddedBrowsingGlow 6s ease-in-out infinite alternate;
      will-change: opacity, transform;
    }
    .embedded-browsing-ambient::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 12rem;
      height: 12rem;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 9999px;
      opacity: 0.22;
      transform: translate(-50%, -50%) scale(0.9);
      animation: embeddedBrowsingPulse 3.8s ease-in-out infinite;
    }
    @keyframes embeddedBrowsingGlow {
      0% { opacity: 0.36; transform: scale(0.99); }
      100% { opacity: 0.54; transform: scale(1.01); }
    }
    @keyframes embeddedBrowsingPulse {
      0% { opacity: 0.08; transform: translate(-50%, -50%) scale(0.82); }
      55% { opacity: 0.22; }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(1.35); }
    }
    @media (prefers-reduced-motion: reduce) {
      .embedded-browsing-ambient,
      .embedded-browsing-ambient::before {
        animation: none;
      }
      .embedded-browsing-ambient {
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
      max-width: 24rem;
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
      max-width: 21rem;
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
    .embedded-browsing-button-secondary {
      background: transparent;
      color: #e3e8f3;
      border: 1.5px solid rgba(255, 255, 255, 0.28);
      font-weight: 600;
    }
    .embedded-browsing-button-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.42);
      color: #ffffff;
      opacity: 1;
      transform: translateY(-1px);
    }
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
  onOptOut,
}: {
  root: HTMLDivElement;
  onRequestPermission: () => Promise<PermissionRequestOutcome>;
  onOptOut?: () => void;
}): void => {
  root.replaceChildren();
  const { shell, card } = createPromptShell();

  const heading = document.createElement('h2');
  heading.className = 'embedded-browsing-heading';
  heading.textContent = 'Read it right here.';

  const description = document.createElement('p');
  description.className = 'embedded-browsing-body';
  description.textContent =
    'Enable reader preview to open articles inside daily.dev with the discussion next to them.';

  const status = document.createElement('p');
  status.className = 'embedded-browsing-status';
  status.textContent = 'Only for links you open from daily.dev.';

  const actions = document.createElement('div');
  actions.className = 'embedded-browsing-actions';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'embedded-browsing-button';
  button.textContent = 'Enable reader preview';

  const resetButton = () => {
    button.disabled = false;
  };

  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = 'Just a sec…';

    const outcome = await onRequestPermission();
    if (outcome === 'granted') {
      status.textContent = "You're in. Reloading…";
      return;
    }

    if (outcome === 'dismissed') {
      status.textContent =
        'Permission was dismissed — tap below when you’re ready.';
      resetButton();
      return;
    }

    status.textContent = "Something didn't quite work. Try again?";
    resetButton();
  });

  actions.append(button);

  if (onOptOut) {
    const optOutButton = document.createElement('button');
    optOutButton.type = 'button';
    optOutButton.className =
      'embedded-browsing-button embedded-browsing-button-secondary';
    optOutButton.textContent = "Don't ask again, open new tab";
    optOutButton.addEventListener('click', () => {
      onOptOut();
    });
    actions.append(optOutButton);
  }

  card.append(heading, description, status, actions);
  root.append(shell);
};
