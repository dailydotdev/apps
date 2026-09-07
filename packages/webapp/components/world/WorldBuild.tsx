import type { ReactElement, ReactNode } from 'react';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { useCopyText } from '@dailydotdev/shared/src/hooks/useCopy';
import { capitalize, pluralize } from '@dailydotdev/shared/src/lib/strings';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  NICHE_OF as RAW_NICHE_OF,
  REALMS as RAW_REALMS,
} from './engine/taxonomy';
import type { AuthoringActions, AuthoringStatus } from './useWorldAuthoring';
import { promptForWorldAgent } from './worldAgent';

const NICHE_OF = RAW_NICHE_OF as Record<string, { label: string }>;
const REALM_NAMES: Record<string, string> = Object.fromEntries(
  (RAW_REALMS as { id: string; name: string }[]).map(({ id, name }) => [
    id,
    name,
  ]),
);

const Section = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-1.5">
    <Typography
      type={TypographyType.Caption2}
      color={TypographyColor.Quaternary}
    >
      {label}
    </Typography>
    {children}
  </div>
);

const placeOf = ({
  niche,
  realm,
}: Pick<AuthoringStatus, 'niche' | 'realm'>): string => {
  if (niche) {
    return NICHE_OF[niche]?.label ?? niche;
  }
  if (realm) {
    return REALM_NAMES[realm] ?? realm;
  }
  return 'your world';
};

const ShowingChip = ({
  active,
  label,
  disabled,
  onClick,
}: {
  active: boolean;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}): ReactElement =>
  active ? (
    <Button
      type="button"
      size={ButtonSize.XSmall}
      pressed
      variant={ButtonVariant.Primary}
      color={ButtonColor.Cabbage}
      disabled={disabled}
    >
      {label}
    </Button>
  ) : (
    <Button
      type="button"
      size={ButtonSize.XSmall}
      variant={ButtonVariant.Float}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </Button>
  );

/** Which world the map is drawing right now: two chips, one always lit. A named state, where a lone toggle button kept reading as a third action. */
const ShowingRow = ({
  labels,
  applied,
  disabled,
  onToggle,
}: {
  /** What `applied` shows, then what its opposite shows. */
  labels: [string, string];
  applied: boolean;
  disabled?: boolean;
  onToggle: () => void;
}): ReactElement => (
  <div className="flex items-center gap-2">
    <Typography
      type={TypographyType.Caption2}
      color={TypographyColor.Quaternary}
    >
      Showing
    </Typography>
    <ShowingChip
      active={applied}
      label={labels[0]}
      disabled={disabled}
      onClick={onToggle}
    />
    <ShowingChip
      active={!applied}
      label={labels[1]}
      disabled={disabled}
      onClick={onToggle}
    />
  </div>
);

const Step = ({
  number,
  children,
}: {
  number: number;
  children: ReactNode;
}): ReactElement => (
  <li className="flex gap-2">
    <span className="flex size-5 flex-none items-center justify-center rounded-max bg-surface-float text-text-tertiary typo-caption2">
      {number}
    </span>
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      className="min-w-0 flex-1 break-words"
    >
      {children}
    </Typography>
  </li>
);

function WorldBuildLive({
  authoring,
  onCopyRecovery,
}: {
  authoring: AuthoringStatus & AuthoringActions;
  onCopyRecovery: () => void;
}): ReactElement {
  const failed = !!authoring.errors.length;
  const saveFailed = !!authoring.saveError;
  const connectionFailed = !!authoring.connectionError;
  const lost = authoring.lostContact;
  const reconnecting = !authoring.connected && !lost;
  const hasChanges = authoring.changes > 0;
  const hasUnsaved = authoring.unsaved > 0;
  /* Save leads only once the owner has watched at least one change land; until
     then the one primary action is looking at what the agent made. */
  const [viewed, setViewed] = useState(false);
  const reviewed = viewed || authoring.builds > 0;
  /* A short border flash is what says "that save just landed" when the text
     itself does not change between builds. */
  const [flash, setFlash] = useState(false);
  const lastBuilds = useRef(authoring.builds);
  useEffect(() => {
    if (authoring.builds <= lastBuilds.current) {
      lastBuilds.current = authoring.builds;
      return undefined;
    }
    lastBuilds.current = authoring.builds;
    setFlash(true);
    const timer = window.setTimeout(() => setFlash(false), 1200);
    return () => window.clearTimeout(timer);
  }, [authoring.builds]);

  let statusColor = 'bg-accent-avocado-default';
  let statusText = authoring.builds > 0 ? 'Preview updated' : 'Agent connected';
  if (!authoring.applied) {
    statusColor = 'bg-accent-cheese-default';
    statusText = 'Showing saved world';
  }
  if (reconnecting) {
    statusColor = 'bg-accent-cheese-default';
    statusText = 'Reconnecting to your agent';
  }
  if (lost) {
    statusColor = 'bg-text-quaternary';
    statusText = 'Agent disconnected';
  }
  if (failed) {
    statusColor = 'bg-accent-ketchup-default';
    statusText = 'Last change failed';
  }
  if (connectionFailed) {
    statusColor = 'bg-accent-ketchup-default';
    statusText = "Can't use your local project";
  }
  if (saveFailed) {
    statusColor = 'bg-accent-ketchup-default';
    statusText = "Couldn't save your changes";
  }
  const family = authoring.family ? capitalize(authoring.family) : undefined;

  let detail = null;
  if (hasChanges) {
    detail = (
      <>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          {authoring.changes}{' '}
          {authoring.changes === 1 ? 'object family' : 'object families'} across{' '}
          {authoring.realms} {pluralize('realm', authoring.realms)}
        </Typography>
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Quaternary}
        >
          Latest: {placeOf(authoring)}
          {family ? ` · ${family}` : ''}
          {authoring.level ? ` · Level ${authoring.level}` : ''}
        </Typography>
      </>
    );
  } else if (hasUnsaved) {
    detail = (
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        Deletions ready to save.
      </Typography>
    );
  } else if (!connectionFailed) {
    detail = (
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        Waiting for your agent&apos;s first build…
      </Typography>
    );
  }

  return (
    <>
      <Section label="Local project">
        <div
          className={classNames(
            'flex min-w-0 flex-col gap-2 rounded-12 border bg-surface-float p-3 transition-colors duration-500',
            flash ? 'border-accent-avocado-default' : 'border-transparent',
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={classNames(
                'size-2 rounded-max',
                statusColor,
                reconnecting && 'animate-pulse',
              )}
            />
            <Typography type={TypographyType.Caption1} bold>
              {statusText}
            </Typography>
          </div>

          {detail}

          {lost && (
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
            >
              Your changes are still here. Save them, or restart the CLI to keep
              editing.
            </Typography>
          )}

          {connectionFailed && (
            <div className="flex min-w-0 flex-col gap-2">
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.StatusError}
              >
                {authoring.connectionError}
              </Typography>
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Tertiary}
              >
                Ask your agent to restart the world CLI. This panel reconnects
                on its own.
              </Typography>
              <Button
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                onClick={onCopyRecovery}
              >
                Copy fix prompt
              </Button>
            </div>
          )}

          {failed && (
            <>
              <ul className="flex flex-col gap-1">
                {authoring.errors.map((error) => (
                  <li key={error}>
                    <Typography
                      type={TypographyType.Caption2}
                      color={TypographyColor.StatusError}
                    >
                      {error}
                    </Typography>
                  </li>
                ))}
              </ul>
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Quaternary}
              >
                Your last good version is still in the preview. Your agent sees
                the same error in its terminal.
              </Typography>
            </>
          )}

          {!!authoring.saveError && (
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.StatusError}
            >
              {authoring.saveError}
            </Typography>
          )}

          {!failed && !connectionFailed && !!authoring.warnings.length && (
            <ul className="flex flex-col gap-1">
              {authoring.warnings.map((warning) => (
                <li key={warning}>
                  <Typography
                    type={TypographyType.Caption2}
                    color={TypographyColor.Quaternary}
                  >
                    {warning}
                  </Typography>
                </li>
              ))}
            </ul>
          )}

          {!failed &&
            !connectionFailed &&
            !saveFailed &&
            hasChanges &&
            !hasUnsaved && (
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.StatusSuccess}
              >
                All changes saved.
              </Typography>
            )}

          {hasChanges && (
            <ShowingRow
              labels={['My changes', 'Saved world']}
              applied={authoring.applied}
              disabled={authoring.isSaving}
              onToggle={authoring.toggleSaved}
            />
          )}
        </div>
      </Section>

      {hasChanges && (
        <Button
          type="button"
          variant={
            reviewed && hasUnsaved ? ButtonVariant.Float : ButtonVariant.Primary
          }
          size={ButtonSize.Small}
          onClick={() => {
            setViewed(true);
            authoring.show();
          }}
        >
          Fly to {placeOf(authoring)}
        </Button>
      )}

      {hasUnsaved && (
        <Button
          type="button"
          variant={reviewed ? ButtonVariant.Primary : ButtonVariant.Float}
          size={ButtonSize.Small}
          disabled={failed || connectionFailed}
          loading={authoring.isSaving}
          onClick={() => authoring.save()}
        >
          Save {authoring.unsaved} {pluralize('change', authoring.unsaved)}
        </Button>
      )}
    </>
  );
}

/** The one irreversible action in the panel confirms inline rather than in a modal, so it cannot be clicked through by reflex. */
function WorldBuildRevert({
  authoring,
}: {
  authoring: AuthoringStatus & AuthoringActions;
}): ReactElement {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button
        type="button"
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        disabled={authoring.isSaving}
        onClick={() => setConfirming(true)}
      >
        Revert to original
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Tertiary}
      >
        This removes your programmed objects for everyone. Your local project
        keeps its files.
      </Typography>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          className="flex-1"
          disabled={authoring.isSaving}
          onClick={() => setConfirming(false)}
        >
          Keep them
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          color={ButtonColor.Ketchup}
          size={ButtonSize.Small}
          className="flex-1"
          loading={authoring.isSaving}
          onClick={() => authoring.revertSaved()}
        >
          Revert
        </Button>
      </div>
    </div>
  );
}

interface WorldBuildProps {
  handle: string;
  authoring: AuthoringStatus & AuthoringActions;
  onAppearance: () => void;
  onClose: () => void;
}

function WorldBuildPanel({
  handle,
  authoring,
  onAppearance,
  onClose,
}: WorldBuildProps): ReactElement {
  const prompt = useMemo(
    () =>
      promptForWorldAgent({
        handle,
        currentOrigin:
          typeof window === 'undefined' ? undefined : window.location.origin,
      }),
    [handle],
  );
  const recovery = useMemo(
    () =>
      [
        'Fix the local preview for my daily.dev world.',
        '',
        'Identify and stop only the existing world dev process listening on port 4321.',
        'Then, from the existing world project folder, restart it with:',
        '',
        `npx @dailydotdev/world-cli@latest dev ${handle} --dir builders`,
        '',
        'Keep the process running. Do not ask me to run commands or configure the preview.',
        'The Program your world panel will reconnect automatically.',
      ].join('\n'),
    [handle],
  );
  const [, copyPrompt] = useCopyText(prompt);
  const [, copyRecovery] = useCopyText(recovery);
  /* Copying is the handoff. From that moment the panel is genuinely polling
     for the agent, and saying so is what carries the wait. */
  const [handedOff, setHandedOff] = useState(false);
  const live = authoring.connected || authoring.changes > 0;

  return (
    <div className="flex flex-col gap-4">
      <header className="-mx-1 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          <Button
            type="button"
            aria-label="Back to appearance"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<ArrowIcon className="-rotate-90" />}
            onClick={onAppearance}
          />
          <Typography type={TypographyType.Body} bold truncate>
            Program your world
          </Typography>
        </div>
        <CloseButton
          type="button"
          size={ButtonSize.Small}
          aria-label="Close world builder"
          onClick={onClose}
        />
      </header>

      {live ? (
        <WorldBuildLive
          authoring={authoring}
          onCopyRecovery={() => copyRecovery()}
        />
      ) : (
        <>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Redesign your realms with your coding agent. You see every change
            live, and nothing goes public until you save.
          </Typography>

          {authoring.saved > 0 && (
            <Section label="Saved world">
              <div className="flex flex-col gap-2">
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  {authoring.saved === 1
                    ? '1 programmed object is live in your world.'
                    : `${authoring.saved} programmed objects are live in your world.`}{' '}
                  Use the same prompt to keep editing.
                </Typography>
                <ShowingRow
                  labels={['Saved world', 'Original']}
                  applied={authoring.applied}
                  disabled={authoring.isSaving}
                  onToggle={authoring.toggleOriginal}
                />
                <WorldBuildRevert authoring={authoring} />
                {!!authoring.saveError && (
                  <Typography
                    type={TypographyType.Caption2}
                    color={TypographyColor.StatusError}
                  >
                    {authoring.saveError}
                  </Typography>
                )}
              </div>
            </Section>
          )}

          <ol className="flex flex-col gap-2">
            <Step number={1}>Copy the prompt.</Step>
            <Step number={2}>
              Paste it into your coding agent, like Claude Code or Cursor.
            </Step>
            <Step number={3}>
              Keep this tab open and watch your world change.
            </Step>
          </ol>

          <Button
            type="button"
            variant={handedOff ? ButtonVariant.Float : ButtonVariant.Primary}
            size={ButtonSize.Small}
            onClick={() => {
              copyPrompt();
              setHandedOff(true);
            }}
          >
            {handedOff ? 'Copy prompt again' : 'Copy prompt'}
          </Button>

          {handedOff && (
            <div className="flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-max bg-accent-cheese-default" />
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Listening for your agent…
              </Typography>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* The engine pushes state through the rail every frame of a replay; nothing in
   this panel reads it, so the memo is what keeps the builder off that path. */
export const WorldBuild = memo(WorldBuildPanel);
