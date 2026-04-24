import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MiniCloseIcon, PlusIcon, ShieldIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useConditionalFeature } from '../../../hooks';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { featureFocusBlocking } from '../../../lib/featureManagement';
import { SidebarSection } from '../../customizeNewTab/components/SidebarSection';
import { SidebarSwitchRow } from '../../customizeNewTab/components/SidebarCompactRow';
import { useNewTabMode } from '../store/newTabMode.store';
import { useFocusBlocklist } from '../store/focusBlocklist.store';

const COMMON_SUGGESTIONS = [
  'twitter.com',
  'reddit.com',
  'youtube.com',
  'news.ycombinator.com',
  'instagram.com',
];

const requestExtensionPermissions = async (): Promise<boolean> => {
  const scope = globalThis as unknown as {
    browser?: {
      permissions?: {
        request: (p: {
          origins?: string[];
          permissions?: string[];
        }) => Promise<boolean>;
      };
    };
    chrome?: {
      permissions?: {
        request: (
          p: { origins?: string[]; permissions?: string[] },
          cb: (granted: boolean) => void,
        ) => void;
      };
    };
  };
  try {
    if (scope.browser?.permissions?.request) {
      return await scope.browser.permissions.request({
        origins: ['<all_urls>'],
      });
    }
    if (scope.chrome?.permissions?.request) {
      return await new Promise<boolean>((resolve) => {
        scope.chrome!.permissions!.request(
          { origins: ['<all_urls>'] },
          (granted) => resolve(Boolean(granted)),
        );
      });
    }
  } catch {
    return false;
  }
  return true;
};

export const FocusBlocklistSection = (): ReactElement | null => {
  const { logEvent } = useLogContext();
  const { isPlus } = usePlusSubscription();
  const { mode } = useNewTabMode();
  const { blocklist, addHost, removeHost, setEnabled } = useFocusBlocklist();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { value: flagEnabled } = useConditionalFeature({
    feature: featureFocusBlocking,
    shouldEvaluate: true,
  });

  const handleToggle = useCallback(async () => {
    const next = !blocklist.enabled;
    logEvent({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'focus_blocklist_toggle',
      extra: JSON.stringify({ enabled: next }),
    });
    if (next) {
      const granted = await requestExtensionPermissions();
      if (!granted) {
        setError(
          'Daily.dev needs permission to watch tabs before it can block sites.',
        );
        return;
      }
    }
    setError(null);
    setEnabled(next);
  }, [blocklist.enabled, logEvent, setEnabled]);

  const handleAdd = useCallback(
    (value: string) => {
      const success = addHost(value);
      if (!success) {
        setError(`"${value}" isn't a valid hostname.`);
        return;
      }
      setError(null);
      setInput('');
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'focus_blocklist_add',
      });
    },
    [addHost, logEvent],
  );

  const handleRemove = useCallback(
    (host: string) => {
      removeHost(host);
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'focus_blocklist_remove',
      });
    },
    [removeHost, logEvent],
  );

  if (!flagEnabled || mode !== 'focus') {
    return null;
  }

  return (
    <SidebarSection title="Block distractions">
      {isPlus ? (
        <>
          <SidebarSwitchRow
            name="focus-blocklist-enabled"
            label="Block sites during focus"
            description="Only active while a session is running."
            icon={ShieldIcon}
            checked={blocklist.enabled}
            onToggle={handleToggle}
          />

          <div className="flex flex-col gap-2 px-2 pt-1">
            <div className="flex gap-1.5">
              <input
                id="focus-blocklist-add"
                type="text"
                inputMode="url"
                autoComplete="off"
                placeholder="twitter.com"
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                  setError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && input.trim()) {
                    event.preventDefault();
                    handleAdd(input);
                  }
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'focus-blocklist-error' : undefined}
                className={classNames(
                  'min-w-0 flex-1 rounded-8 border bg-transparent px-2.5 py-1.5 text-text-primary typo-footnote placeholder:text-text-quaternary focus:outline-none',
                  error
                    ? 'border-accent-ketchup-default'
                    : 'border-border-subtlest-tertiary focus:border-accent-cabbage-default',
                )}
              />
              <Button
                type="button"
                variant={ButtonVariant.Secondary}
                size={ButtonSize.XSmall}
                onClick={() => handleAdd(input)}
                disabled={!input.trim()}
              >
                Add
              </Button>
            </div>
            <div
              id="focus-blocklist-error"
              role="alert"
              aria-live="polite"
              className={error ? undefined : 'sr-only'}
            >
              {error ? (
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.StatusError}
                >
                  {error}
                </Typography>
              ) : null}
            </div>

            {blocklist.hosts.length === 0 ? (
              <div className="flex flex-col gap-1.5">
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  Common suggestions
                </Typography>
                <div className="flex flex-wrap gap-1">
                  {COMMON_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleAdd(suggestion)}
                      className="flex items-center gap-1 rounded-8 bg-surface-float px-2 py-0.5 text-text-tertiary transition-colors typo-caption1 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default"
                    >
                      <PlusIcon size={IconSize.XXSmall} />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="flex flex-col gap-1">
                {blocklist.hosts.map((host) => (
                  <li
                    key={host}
                    className="flex min-w-0 items-center justify-between gap-2 rounded-8 bg-surface-float px-2.5 py-1"
                  >
                    <Typography
                      type={TypographyType.Footnote}
                      className="truncate"
                    >
                      {host}
                    </Typography>
                    <Button
                      type="button"
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.XSmall}
                      icon={<MiniCloseIcon />}
                      aria-label={`Remove ${host}`}
                      onClick={() => handleRemove(host)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="break-words px-2"
        >
          Focus blocker is a daily.dev Plus perk. Upgrade to redirect
          distracting sites while you&apos;re focusing.
        </Typography>
      )}
    </SidebarSection>
  );
};
