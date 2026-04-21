import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons';
import usePersistentContext from '@dailydotdev/shared/src/hooks/usePersistentContext';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';

const STORAGE_KEY = 'new_explore_layout_banner_dismissed';
const SWITCH_TO_CARDS_HREF = '/posts';

const BENEFITS = [
  'Top stories at a glance',
  'Smarter discovery per topic',
  'Faster scanning, inline actions',
];

export function NewExploreLayoutBanner(): ReactElement | null {
  const router = useRouter();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const [dismissed, setDismissed, isFetched] = usePersistentContext<boolean>(
    STORAGE_KEY,
    false,
  );
  const impressionLogged = useRef(false);

  const showBanner = true;

  useEffect(() => {
    if (!showBanner || impressionLogged.current) {
      return;
    }
    impressionLogged.current = true;
    logEvent({
      event_name: LogEvent.Impression,
      target_id: 'new_explore_layout_banner',
    });
  }, [showBanner, logEvent]);

  if (!showBanner) {
    return null;
  }

  const onDismiss = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_id: 'new_explore_layout_banner',
      extra: JSON.stringify({ action: 'dismiss' }),
    });
    setDismissed(true);
  };

  const onUndoSwitchToCards = async () => {
    logEvent({
      event_name: LogEvent.Click,
      target_id: 'new_explore_layout_banner',
      extra: JSON.stringify({ action: 'undo_switch_to_cards' }),
    });
    await setDismissed(false);
    router.push('/explore');
  };

  const onSwitchToCards = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_id: 'new_explore_layout_banner',
      extra: JSON.stringify({ action: 'switch_to_cards' }),
    });
    setDismissed(true);
    displayToast('You can always change it back on settings', {
      action: {
        copy: 'Undo',
        onClick: onUndoSwitchToCards,
      },
    });
    router.push(SWITCH_TO_CARDS_HREF);
  };

  return (
    <section className="mx-3 w-auto laptop:mx-8">
      <div className="relative overflow-hidden rounded-16 px-px py-px">
        <div className="top-hero-panel-border absolute inset-0 rounded-16" />
        <div className="top-hero-glow pointer-events-none absolute -right-16 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="top-hero-glow pointer-events-none absolute -left-20 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full opacity-60 blur-3xl" />
        <div className="relative overflow-hidden rounded-[0.9375rem] bg-raw-pepper-90 shadow-2">
          <div className="relative flex flex-col gap-4 p-4 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-6 tablet:p-5">
            <div className="flex min-w-0 flex-col gap-2">
              <h2 className="font-bold text-white typo-title3">
                You&apos;re viewing the new feed
              </h2>
              <ul className="flex flex-col gap-1.5 tablet:flex-row tablet:flex-wrap tablet:gap-x-4 tablet:gap-y-1">
                {BENEFITS.map((benefit) => (
                  <li
                    key={benefit}
                    className={classNames(
                      'text-white/80 flex items-center gap-2 typo-footnote',
                      'before:inline-block before:h-1 before:w-1 before:shrink-0',
                      'before:rounded-full before:bg-accent-cabbage-default',
                    )}
                  >
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-start tablet:self-center">
              <Button
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                onClick={onSwitchToCards}
              >
                Switch to cards
              </Button>
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.XSmall}
                className="text-white/80 hover:text-white"
                icon={<MiniCloseIcon />}
                aria-label="Dismiss banner"
                onClick={onDismiss}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
