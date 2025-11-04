import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';

import type { NextSeoProps } from 'next-seo';

import { FlexCol, FlexRow } from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ActivelyLookingIcon,
  PassiveIcon,
  SemiActiveIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import {
  useActions,
  useToastNotification,
} from '@dailydotdev/shared/src/hooks';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { CandidateStatus } from '@dailydotdev/shared/src/features/opportunity/protobuf/user-candidate-preference';
import { useMutation, useQuery } from '@tanstack/react-query';
import { updateCandidatePreferencesMutationOptions } from '@dailydotdev/shared/src/features/opportunity/mutations';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getCandidatePreferencesOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import { useUpdateQuery } from '@dailydotdev/shared/src/hooks/useUpdateQuery';
import { opportunityUrl } from '@dailydotdev/shared/src/lib/constants';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { getOpportunityProtectedLayout } from '../../../components/layouts/OpportunityProtectedLayout';
import { opportunityPageLayoutProps } from '../../../components/layouts/utils';
import {
  defaultOpenGraph,
  defaultSeo,
  defaultSeoTitle,
} from '../../../next-seo';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  nofollow: true,
  noindex: true,
};

const options = [
  {
    value: CandidateStatus.ACTIVELY_LOOKING,
    icon: <ActivelyLookingIcon size={IconSize.XLarge} />,
    title: 'Active looking',
    description: (
      <>
        I&apos;m in the market and ready to move. This one just wasn&apos;t a
        fit.
      </>
    ),
  },
  {
    value: CandidateStatus.OPEN_TO_OFFERS,
    icon: <SemiActiveIcon size={IconSize.XLarge} />,
    title: <>Open only if it&apos;s right</>,
    description: (
      <>
        I&apos;m happy where I am, but I&apos;d explore something truly
        exceptional.
      </>
    ),
  },
  {
    value: CandidateStatus.DISABLED,
    icon: <PassiveIcon size={IconSize.XLarge} />,
    title: 'Not looking right now',
    description: (
      <>
        I&apos;m not open to job offers right now. Step back until I say
        otherwise.
      </>
    ),
  },
];

const DeclinePage = (): ReactElement => {
  const {
    query: { id },
  } = useRouter();
  const opportunityId = id as string;
  const [option, setOption] = useState<CandidateStatus | null>(null);
  const { logEvent } = useLogContext();
  const { push, back } = useRouter();
  const { completeAction, isActionsFetched } = useActions();

  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const opts = getCandidatePreferencesOptions(user?.id);
  const updateQuery = useUpdateQuery(opts);
  const { data: preferences } = useQuery(opts);
  const { mutate: updatePreferences } = useMutation({
    ...updateCandidatePreferencesMutationOptions(updateQuery, () => {
      logEvent({
        event_name: LogEvent.SelectCandidateAvailability,
        target_id: preferences?.status,
      });
    }),
    onError: () => {
      displayToast('Failed to update preferences. Please try again.');
    },
  });

  const handleSave = () => {
    if (preferences?.status !== option) {
      updatePreferences({ status: option });
    }

    push(
      `${opportunityUrl}/${opportunityId}/${
        option === CandidateStatus.DISABLED ? 'passive-done' : 'preference'
      }`,
    );
  };

  useEffect(() => {
    if (!preferences) {
      return;
    }

    setOption(preferences.status);
  }, [preferences]);

  useEffect(() => {
    if (!isActionsFetched) {
      return;
    }
    completeAction(ActionType.OpportunityInitialView);
  }, [completeAction, isActionsFetched]);

  return (
    <div className="mx-4 flex w-auto max-w-full flex-col gap-4 tablet:mx-auto tablet:max-w-[35rem] laptop:flex-row">
      <FlexCol className="flex-1 gap-6">
        <FlexCol className="gap-4">
          <Typography type={TypographyType.LargeTitle} bold center>
            Help us respect your time
          </Typography>
          <Typography
            type={TypographyType.Title3}
            color={TypographyColor.Secondary}
            center
          >
            We only reach out when it&apos;s worth it. Tell us where you stand
            so we can match you with the right job offers, or step back entirely
            until you&apos;re ready.
          </Typography>
        </FlexCol>
        <FlexCol className="gap-2">
          {options.map(({ value, icon, title, description }) => (
            <Button
              key={value}
              variant={ButtonVariant.Option}
              className={classNames(
                '!h-auto w-auto gap-3 border border-border-subtlest-tertiary !p-3',
                {
                  'bg-surface-float': option === value,
                },
              )}
              onClick={() => setOption(value)}
            >
              <div className="relative top-0.5 flex size-12 items-center justify-center rounded-10">
                {icon}
              </div>
              <FlexCol className="flex-1 text-left">
                <Typography
                  color={TypographyColor.Primary}
                  type={TypographyType.Body}
                  bold
                >
                  {title}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {description}
                </Typography>
              </FlexCol>
            </Button>
          ))}
        </FlexCol>
        <div className="rounded-10 bg-surface-float p-2">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            💡 <strong>Tip:</strong> You can update this anytime in your{' '}
            <a
              href="#"
              className="text-text-link"
              target="_blank"
              rel={anchorDefaultRel}
            >
              job preferences
            </a>{' '}
            so we always act on your terms.
          </Typography>
        </div>
        <FlexRow className="justify-between">
          <Button
            size={ButtonSize.Large}
            variant={ButtonVariant.Tertiary}
            className="hidden laptop:flex"
            onClick={() => back()}
          >
            Back
          </Button>
          <Button
            size={ButtonSize.Large}
            variant={ButtonVariant.Primary}
            className="w-full laptop:w-auto"
            disabled={!option}
            onClick={handleSave}
          >
            Save and Continue
          </Button>
        </FlexRow>
      </FlexCol>
    </div>
  );
};

DeclinePage.getLayout = getOpportunityProtectedLayout;
DeclinePage.layoutProps = {
  ...opportunityPageLayoutProps,
  seo,
};

export default DeclinePage;
