const createCardContainer = (): HTMLDivElement => {
  const container = document.createElement('div');
  container.style.cssText =
    'display:flex;flex:1;align-items:center;justify-content:center;padding:24px';
  return container;
};

const createCard = (): HTMLDivElement => {
  const card = document.createElement('div');
  card.style.cssText =
    'max-width:640px;border:1px solid rgba(148,163,184,0.35);border-radius:16px;padding:24px;background:rgba(15,23,42,0.92);box-shadow:0 20px 45px rgba(15,23,42,0.35);color:#e2e8f0';
  return card;
};

export const renderMessage = (
  root: HTMLDivElement,
  title: string,
  body: string,
): void => {
  root.replaceChildren();

  const container = createCardContainer();
  const card = createCard();

  const heading = document.createElement('div');
  heading.style.cssText = 'font-size:18px;font-weight:700;line-height:1.4';
  heading.textContent = title;

  const paragraph = document.createElement('p');
  paragraph.style.cssText =
    'margin:12px 0 0;font-size:14px;line-height:1.6;color:#cbd5e1';
  paragraph.textContent = body;

  card.append(heading, paragraph);
  container.append(card);
  root.append(container);
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

  const container = createCardContainer();
  const card = createCard();

  const heading = document.createElement('div');
  heading.style.cssText = 'font-size:18px;font-weight:700;line-height:1.4';
  heading.textContent = 'Enable embedded browsing';

  const description = document.createElement('p');
  description.style.cssText =
    'margin:12px 0 0;font-size:14px;line-height:1.6;color:#cbd5e1';
  description.textContent =
    'To load websites inside daily.dev, allow this extension to modify response headers on embedded pages.';

  const status = document.createElement('p');
  status.style.cssText =
    'margin:12px 0 0;font-size:13px;line-height:1.5;color:#cbd5e1';
  status.textContent =
    'This is optional and only applies to pages embedded by daily.dev.';

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Enable for this browser';
  button.style.cssText =
    'margin-top:16px;padding:10px 14px;border:0;border-radius:12px;background:#22c55e;color:#0f172a;font-weight:700;cursor:pointer';

  const resetButton = () => {
    button.disabled = false;
    button.style.opacity = '1';
  };

  button.addEventListener('click', async () => {
    button.disabled = true;
    button.style.opacity = '0.7';
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

  card.append(heading, description, status, button);
  container.append(card);
  root.append(container);
};
