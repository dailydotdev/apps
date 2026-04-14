import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import feedStyles from '@dailydotdev/shared/src/components/Feed.module.css';
import { cloudinaryReadingReminderCat } from '@dailydotdev/shared/src/lib/image';

export default function HijackingLoginStrip(): ReactElement {
  const { showLogin } = useAuthContext();
  const { logEvent } = useLogContext();

  return (
    <section className={classNames('mb-4 w-full px-4 pb-0', feedStyles.cards)}>
      <div className="relative overflow-hidden rounded-b-none rounded-t-16 px-px pb-0 pt-px">
        <div className="top-hero-panel-border absolute inset-0 rounded-b-none rounded-t-16" />
        <div className="top-hero-glow pointer-events-none absolute -right-12 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-10 w-5 bg-gradient-to-t from-raw-pepper-90 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-10 w-5 bg-gradient-to-t from-raw-pepper-90 to-transparent" />
        <div className="relative overflow-hidden rounded-b-none rounded-t-[0.9375rem] bg-raw-pepper-90 shadow-2">
          <div className="flex flex-col tablet:flex-row tablet:items-stretch">
            <div className="flex flex-1 flex-col items-center p-5 text-center tablet:items-start tablet:p-6 tablet:text-left">
              <div className="flex flex-col items-center gap-1 tablet:items-start">
                <h3 className="font-bold text-white typo-title2">
                  Log in to unlock the full daily.dev experience
                </h3>
                <p className="text-white/80 text-sm">
                  If you were in the middle of onboarding, you can pick up right
                  where you left off.
                </p>
                <Button
                  type="button"
                  variant={ButtonVariant.Primary}
                  className="mt-4 w-fit"
                  onClick={() => {
                    logEvent({
                      event_name: LogEvent.Click,
                      target_type: TargetType.LoginButton,
                      target_id: 'hijacking',
                    });

                    showLogin({
                      trigger: AuthTriggers.Onboarding,
                      options: { isLogin: true },
                    });
                  }}
                >
                  Log in to continue
                </Button>
              </div>
            </div>
            <div className="bg-black/20 flex h-[12.5rem] w-full items-center justify-center p-2 tablet:h-auto tablet:w-[14.5rem] tablet:p-3 laptopL:w-[16rem]">
              <img
                src={cloudinaryReadingReminderCat}
                alt="Sleeping cat on laptop"
                className="m-0 h-full w-full max-w-none scale-105 object-contain laptopL:scale-110"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
