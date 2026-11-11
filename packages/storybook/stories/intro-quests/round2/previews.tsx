import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  BellIcon,
  BriefIcon,
  ChromeIcon,
  KeyIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import type { QuestId } from '../data';
import { maskedToken, mockUser, profileFields } from '../data';
import { useSim } from '../sim';

// Small, honest pictures of what each quest gets you. They read the sim, so
// they change as the user acts: the profile card fills field by field, the
// terminal prints a response once the call lands.

const Line = ({ className }: { className?: string }): ReactElement => (
  <span
    className={classNames('block h-2 rounded-max bg-surface-float', className)}
  />
);

export const NewTabPreview = ({ done }: { done: boolean }): ReactElement => (
  <div className="flex h-full flex-col overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default">
    <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary bg-background-subtle px-2 py-1.5">
      <span className="flex items-center gap-1 rounded-6 bg-background-default px-2 py-0.5 text-text-secondary typo-caption2">
        {done ? (
          <LogoIcon className={{ container: 'size-3' }} />
        ) : (
          <ChromeIcon size={IconSize.XXSmall} />
        )}
        New Tab
      </span>
    </div>
    {done ? (
      <div className="iq-rise grid flex-1 grid-cols-3 gap-2 p-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="flex flex-col gap-1 rounded-8 bg-surface-float p-1.5"
          >
            <Line className="w-4/5 bg-surface-hover" />
            <span className="mt-auto h-6 rounded-6 bg-surface-hover" />
          </span>
        ))}
      </div>
    ) : (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-3">
        <span className="h-6 w-2/3 rounded-max bg-surface-float" />
        <span className="text-text-quaternary typo-caption2">
          An empty new tab, every time
        </span>
      </div>
    )}
  </div>
);

export const NotificationPreviewCard = (): ReactElement => (
  <div className="iq-elevated flex w-full items-start gap-2 rounded-14 bg-background-popover p-3">
    <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-text-primary">
      <LogoIcon
        className={{
          container: 'size-5 [&_g]:[fill:var(--theme-surface-invert)]',
        }}
      />
    </span>
    <div className="min-w-0 flex-1">
      <p className="font-bold text-text-primary typo-footnote">
        Nimrod replied to your comment
      </p>
      <p className="text-text-tertiary typo-caption1">
        Good catch on the Bun test runner. Did you try it with workspaces?
      </p>
    </div>
  </div>
);

export const BriefPreview = ({ ready }: { ready: boolean }): ReactElement => (
  <div className="flex w-full flex-col gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-default p-3">
    <span className="flex items-center gap-1.5 font-bold text-accent-cabbage-default typo-caption1">
      <BriefIcon size={IconSize.XXSmall} secondary />
      {ready ? `${mockUser.name}'s briefing` : 'Your briefing'}
    </span>
    <p className="font-bold text-text-primary typo-footnote">Must know</p>
    <div className="flex flex-col gap-1.5">
      <Line className={ready ? 'bg-surface-hover' : 'iq-shimmer'} />
      <Line
        className={classNames(
          'w-5/6',
          ready ? 'bg-surface-hover' : 'iq-shimmer',
        )}
      />
      <Line
        className={classNames(
          'w-2/3',
          ready ? 'bg-surface-hover' : 'iq-shimmer',
        )}
      />
    </div>
    <span className="text-text-quaternary typo-caption2">
      Hours of reading, two minutes
    </span>
  </div>
);

export const ProfilePreview = (): ReactElement => {
  const { state } = useSim();
  const has = (id: string) =>
    state.profileDone.includes(id as (typeof profileFields)[number]['id']);

  return (
    <div className="flex w-full flex-col gap-3 rounded-12 border border-border-subtlest-tertiary bg-background-default p-3">
      <div className="flex items-center gap-2">
        {has('photo') ? (
          <img
            src={mockUser.image}
            alt=""
            className="iq-pop size-10 rounded-12 object-cover"
          />
        ) : (
          <span className="size-10 rounded-12 border border-dashed border-border-subtlest-secondary" />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="font-bold text-text-primary typo-footnote">
            {mockUser.name}
          </p>
          {has('headline') ? (
            <p className="iq-rise text-text-secondary typo-caption1">
              Frontend engineer, TypeScript nerd
            </p>
          ) : (
            <Line className="w-28 border border-dashed border-border-subtlest-secondary bg-transparent" />
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {profileFields.slice(2).map((field) =>
          has(field.id) ? (
            <span
              key={field.id}
              className="iq-pop rounded-8 bg-surface-float px-2 py-0.5 text-text-secondary typo-caption2"
            >
              {field.id === 'experience' && 'Senior · 6 yrs'}
              {field.id === 'work' && 'Acme Inc.'}
              {field.id === 'education' && 'Tel Aviv University'}
            </span>
          ) : (
            <span
              key={field.id}
              className="rounded-8 border border-dashed border-border-subtlest-secondary px-2 py-0.5 text-text-quaternary typo-caption2"
            >
              {field.label}
            </span>
          ),
        )}
      </div>
    </div>
  );
};

export const TerminalPreview = (): ReactElement => {
  const sim = useSim();
  const hasKey = !!sim.state.token;
  const called = sim.isDone('apiCall');

  return (
    <div className="flex w-full flex-col gap-1 rounded-12 bg-background-subtle p-3 font-mono typo-caption2">
      <span className="text-text-quaternary">~ $</span>
      {hasKey ? (
        <span className="break-all text-text-secondary">
          export DAILY_TOKEN={maskedToken}
        </span>
      ) : (
        <span className="flex items-center gap-1 text-text-quaternary">
          <KeyIcon size={IconSize.XXSmall} /> no key yet
        </span>
      )}
      {hasKey && (
        <span className="text-text-secondary">
          curl api.daily.dev/public/v1/profile
        </span>
      )}
      {called && (
        <span className="iq-rise whitespace-pre text-accent-avocado-default">
          {`{ "name": "${mockUser.name}", "reputation": 10 }`}
        </span>
      )}
    </div>
  );
};

export const QuestPreview = ({ id }: { id: QuestId }): ReactElement => {
  const sim = useSim();

  switch (id) {
    case 'extension':
      return <NewTabPreview done={sim.isDone('extension')} />;
    case 'notifications':
      return sim.isDone('notifications') ? (
        <NotificationPreviewCard />
      ) : (
        <div className="flex w-full flex-col items-center gap-3">
          <span className="relative flex size-14 items-center justify-center rounded-16 bg-surface-float text-text-primary">
            <BellIcon size={IconSize.Large} secondary />
            <span className="absolute -right-1 -top-1 size-4 rounded-max border-2 border-background-subtle bg-accent-ketchup-default" />
          </span>
          <div className="w-full opacity-50">
            <NotificationPreviewCard />
          </div>
        </div>
      );
    case 'brief':
      return <BriefPreview ready={sim.isDone('brief')} />;
    case 'profile':
      return <ProfilePreview />;
    default:
      return <TerminalPreview />;
  }
};
