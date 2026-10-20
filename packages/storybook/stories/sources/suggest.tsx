import type { ReactElement, ReactNode } from 'react';
import React, { useContext } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import Alert, {
  AlertType,
} from '@dailydotdev/shared/src/components/widgets/Alert';
import {
  LinkIcon,
  LockIcon,
  OpenLinkIcon,
} from '@dailydotdev/shared/src/components/icons';
import { contentGuidelines } from '@dailydotdev/shared/src/lib/constants';
import { OpenSourceContext, SourceLogo, useSources } from './kit';
import type { SuggestFlow, SuggestStep } from './suggestFlow';
import { useSuggestFlow } from './suggestFlow';

// NewSourceModal, the "Suggest new source" modal every Suggest button opens
// in production, drawn in the device: the real one needs the app's auth and
// queries, and react-modal mounts it outside the frame. Same copy, same
// fields (TextField, Radio, Alert), same steps, with the scrape mocked in
// suggestFlow.ts. A centered card from tablet up, a sheet on phones, like
// production's Modal.

export interface SuggestOpen {
  url?: string;
  step?: SuggestStep;
  /** Not enough reputation: production locks the field. */
  locked?: boolean;
}

export const ModalShell = ({
  title,
  onClose,
  footer,
  children,
}: {
  title: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div
    role="presentation"
    onClick={(event) => event.target === event.currentTarget && onClose()}
    className="fixed inset-0 z-modal flex items-end justify-center bg-overlay-quaternary-onion tablet:items-center tablet:p-6"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="sx-in flex max-h-[calc(100%-3rem)] w-full flex-col overflow-hidden rounded-t-24 border border-border-subtlest-tertiary bg-background-default tablet:max-w-[35rem] tablet:rounded-24"
    >
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border-subtlest-tertiary pl-6 pr-4">
        <h2 className="font-bold typo-title3">{title}</h2>
        <CloseButton size={ButtonSize.Small} onClick={onClose} />
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
        {children}
      </div>
      {footer && (
        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-border-subtlest-tertiary p-4">
          {footer}
        </footer>
      )}
    </div>
  </div>
);

const feedLabel = (title: string, url: string): ReactElement => (
  <span className="flex w-full flex-1 items-center justify-between">
    {title}
    <Button
      variant={ButtonVariant.Tertiary}
      tag="a"
      target="_blank"
      href={url}
      icon={<OpenLinkIcon />}
      onClick={(event: React.MouseEvent) => event.preventDefault()}
    />
  </span>
);

const Body = ({
  flow,
  locked,
}: {
  flow: SuggestFlow;
  locked: boolean;
}): ReactElement => {
  const { goTo, notify, closeSuggest } = useSources();
  const openSource = useContext(OpenSourceContext);
  const hasFeeds = flow.feeds.length > 0;
  const { existing } = flow;
  return (
    <>
      <p className="text-text-secondary typo-callout">
        Have an idea for a new source? Insert its link below to add it to the
        feed.
      </p>
      <a
        className="mb-2 mt-1 self-start font-bold text-text-link underline typo-callout"
        href={contentGuidelines}
        onClick={(event) => {
          event.preventDefault();
          goTo('/content-guidelines');
        }}
      >
        Content guidelines
      </a>
      <form
        className="flex w-full flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          flow.check();
        }}
      >
        <TextField
          disabled={locked || hasFeeds}
          className={{ container: 'mt-4' }}
          inputId="new-source-field"
          name="url"
          label="Paste blog / RSS URL"
          placeholder="Paste blog / RSS URL"
          autoComplete="off"
          type="url"
          value={flow.url}
          valueChanged={flow.setUrl}
          fieldType="primary"
          leftIcon={<LinkIcon />}
          rightIcon={
            locked ? <LockIcon className="text-text-disabled" /> : undefined
          }
        />
      </form>
      {locked && (
        <Alert
          className="mt-4"
          type={AlertType.Error}
          title={
            <span className="block flex-1">
              You do not have enough reputation to use this feature yet.
              However, you can{' '}
              <button
                type="button"
                className="font-bold underline"
                onClick={() => {
                  closeSuggest();
                  goTo('/squads/new');
                }}
              >
                create a Squad
              </button>{' '}
              instead where you can share your favorite content, invite your
              friends and colleagues and a lot more!
            </span>
          }
        />
      )}
      {existing && (
        <Alert
          className="mt-4"
          type={AlertType.Error}
          title={
            <span className="flex flex-1 items-center gap-2">
              <span className="mr-auto flex gap-1">
                <button
                  type="button"
                  className="text-text-link"
                  onClick={() => {
                    closeSuggest();
                    openSource?.(existing);
                  }}
                >
                  {existing.name}
                </button>
                already exists
              </span>
              <SourceLogo source={existing} className="size-6 rounded-full" />
            </span>
          }
        />
      )}
      {hasFeeds && (
        <>
          <div className="mb-6 mt-4 self-start text-text-tertiary typo-callout">
            {flow.feeds.length} RSS feed{flow.feeds.length > 1 ? 's' : ''} found
          </div>
          <Radio
            name="rss"
            options={flow.feeds.map((feed) => ({
              label: feedLabel(feed.title, feed.url),
              value: feed.url,
            }))}
            onChange={flow.select}
            value={flow.selected}
            className={{
              container: 'w-full self-start',
              content: 'w-full pr-0',
            }}
          />
        </>
      )}
      {flow.step === 'error' && (
        <>
          <div className="mt-4 self-start text-status-error typo-callout">
            Failed to fetch information, try to find the link to the RSS itself
            and try again.
          </div>
          <Button
            type="button"
            className="mt-3 self-start"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            onClick={() => notify('Opens an email to hi@daily.dev')}
          >
            Contact
          </Button>
        </>
      )}
    </>
  );
};

/** Production's modal, with its mocked steps. */
export const SuggestSourceModal = ({
  open,
  onClose,
  onSubmitted,
}: {
  open: SuggestOpen;
  onClose: () => void;
  onSubmitted: () => void;
}): ReactElement => {
  const flow = useSuggestFlow({
    initialUrl: open.url,
    initialStep: open.step,
    onSubmitted,
  });
  const locked = !!open.locked;
  const hasFeeds = flow.feeds.length > 0;
  const isBusy = flow.step === 'submitting';

  let footer: ReactNode = null;
  if (!locked && hasFeeds) {
    footer = (
      <>
        <Button
          type="button"
          className="mr-auto"
          variant={ButtonVariant.Float}
          disabled={isBusy}
          onClick={flow.back}
        >
          Back
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          disabled={!flow.selected}
          loading={isBusy}
          onClick={flow.submit}
        >
          Submit for review
        </Button>
      </>
    );
  } else if (!locked) {
    footer = (
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        disabled={!flow.canCheck}
        loading={flow.step === 'checking'}
        onClick={flow.check}
      >
        Check link
      </Button>
    );
  }

  return (
    <ModalShell title="Suggest new source" onClose={onClose} footer={footer}>
      <Body flow={flow} locked={locked} />
    </ModalShell>
  );
};

/** Wherever a page can open it: the hub and a source's page. */
export const SuggestSourceHost = (): ReactElement | null => {
  const { suggestOpen, closeSuggest, suggestSubmitted, loggedIn } =
    useSources();
  if (!suggestOpen) {
    return null;
  }
  // Signed out, production's modal opens with the field locked.
  return (
    <SuggestSourceModal
      open={loggedIn ? suggestOpen : { ...suggestOpen, locked: true }}
      onClose={closeSuggest}
      onSubmitted={suggestSubmitted}
    />
  );
};
