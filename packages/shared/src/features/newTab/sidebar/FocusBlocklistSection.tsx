import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MiniCloseIcon } from '../../../components/icons';
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
import { SidebarSwitch } from '../../customizeNewTab/components/SidebarSwitch';
import { useFocusBlocklist } from '../store/focusBlocklist.store';

const COMMON_SUGGESTIONS = [
  'twitter.com',
  'reddit.com',
  'youtube.com',
  'news.ycombinator.com',
  'instagram.com',
];

// Asks the browser for the host/webNavigation permissions required to
// actually enforce the blocklist. Safe to call outside the extension; we
// simply short-circuit to `true` (UI still works, enforcement silently
// disabled).
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

  if (!flagEnabled) {
    return null;
  }

  return (
    <SidebarSection
      title="Block distractions during focus"
      description="We'll redirect these sites back to daily.dev while a focus session is running."
    >
      {isPlus ? (
        <>
          <SidebarSwitch
            name="focus-blocklist-enabled"
            label="Turn on focus blocker"
            description="Only active while a focus session is running. Turning this off keeps your list."
            checked={blocklist.enabled}
            onToggle={handleToggle}
          />

          <div className="flex flex-col gap-2">
            <label
              className="flex flex-col gap-1"
              htmlFor="focus-blocklist-add"
            >
              <span className="text-text-tertiary typo-footnote">
                Add a site
              </span>
              <div className="flex gap-2">
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
                  className={classNames(
                    'flex-1 rounded-10 border bg-transparent px-3 py-2 text-text-primary typo-callout placeholder:text-text-quaternary focus:outline-none',
                    error
                      ? 'border-accent-ketchup-default'
                      : 'border-border-subtlest-tertiary focus:border-accent-cabbage-default',
                  )}
                />
                <Button
                  type="button"
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Small}
                  onClick={() => handleAdd(input)}
                  disabled={!input.trim()}
                >
                  Add
                </Button>
              </div>
            </label>
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
            <div className="flex flex-col gap-2">
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                Common distractions:
              </Typography>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAdd(suggestion)}
                    className="rounded-8 border border-border-subtlest-tertiary px-2 py-1 text-text-tertiary transition-colors typo-caption1 hover:bg-surface-float hover:text-text-primary"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {blocklist.hosts.map((host) => (
                <li
                  key={host}
                  className="flex items-center justify-between rounded-8 bg-surface-float px-3 py-1.5"
                >
                  <Typography type={TypographyType.Callout}>{host}</Typography>
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
        </>
      ) : (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Focus blocker is a daily.dev Plus perk. Upgrade to redirect
          distracting sites while you&apos;re focusing.
        </Typography>
      )}
    </SidebarSection>
  );
};
