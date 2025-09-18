import React, { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Divider,
  FlexCol,
  FlexRow,
} from '@dailydotdev/shared/src/components/utilities';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { PreferenceOptionsForm } from '@dailydotdev/shared/src/components/opportunity/PreferenceOptionsForm';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { FeelingLazy } from '@dailydotdev/shared/src/features/profile/components/FeelingLazy';
import classNames from 'classnames';
import {
  ActivelyLookingIcon,
  DocsIcon,
  SemiActiveIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { RadioItem } from '@dailydotdev/shared/src/components/fields/RadioItem';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getCandidatePreferencesOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { CandidateStatus } from '@dailydotdev/shared/src/features/opportunity/protobuf/user-candidate-preference';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { useUpdateQuery } from '@dailydotdev/shared/src/hooks/useUpdateQuery';
import { updateCandidatePreferencesMutationOptions } from '@dailydotdev/shared/src/features/opportunity/mutations';
import {
  useActions,
  useToastNotification,
} from '@dailydotdev/shared/src/hooks';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { UploadCVButton } from '@dailydotdev/shared/src/features/opportunity/components/UploadCVButton';
import { ClearResumeButton } from '@dailydotdev/shared/src/features/opportunity/components/ClearResumeButton';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Manage job preferences'),
};

const options = [
  {
    key: CandidateStatus.ACTIVELY_LOOKING,
    icon: <ActivelyLookingIcon size={IconSize.XLarge} />,
    title: 'Actively looking',
    description: (
      <>
        I&apos;m in the market and ready to move. This one just wasn&apos;t a
        fit.
      </>
    ),
  },
  {
    key: CandidateStatus.OPEN_TO_OFFERS,
    icon: <SemiActiveIcon size={IconSize.XLarge} />,
    title: <>Open only if it&apos;s right</>,
    description: (
      <>
        I&apos;m happy where I am, but I&apos;d explore something truly
        exceptional.
      </>
    ),
  },
];

const fileSuffixMap = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
};

const JobPreferencesPage = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { completeAction } = useActions();
  const [option, setOption] = useState(null);

  const opts = getCandidatePreferencesOptions(user?.id);
  const updateQuery = useUpdateQuery(opts);

  const { data: preferences, isPending } = useQuery(opts);
  const { mutate: updatePreferences } = useMutation({
    ...updateCandidatePreferencesMutationOptions(updateQuery, () => {
      completeAction(ActionType.UserCandidatePreferencesSaved);
      logEvent({
        event_name: LogEvent.SelectCandidateAvailability,
        target_id: preferences?.status,
      });
    }),
    onError: () => {
      displayToast('Failed to update preferences. Please try again.');
    },
  });

  const modeDisabled = preferences?.status === CandidateStatus.DISABLED;

  useEffect(() => {
    if (!preferences) {
      return;
    }

    setOption(preferences?.status ?? null);
  }, [preferences]);

  if (!preferences || isPending) {
    return (
      <AccountPageContainer title="Job preferences">
        <Loader />
      </AccountPageContainer>
    );
  }

  return (
    <AccountPageContainer title="Job preferences">
      <div className="flex flex-col gap-6">
        <FlexRow className="gap-4">
          <FlexCol className="flex-1 gap-1">
            <Typography type={TypographyType.Body}>
              <strong>Career mode</strong> (beta)
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              When this is on, daily.dev works as your trusted talent agent,
              introducing you to real roles from real teams for your approval.
              Nothing is shared without your say-so. We&apos;ll only reach out
              when a role is worth your time. No spam. No pressure. Your career,
              your terms.
            </Typography>
          </FlexCol>
          <Switch
            inputId="career_mode"
            name="career_mode"
            compact={false}
            checked={!modeDisabled}
            onToggle={() => {
              updatePreferences({
                status: modeDisabled
                  ? CandidateStatus.OPEN_TO_OFFERS
                  : CandidateStatus.DISABLED,
              });
            }}
          />
        </FlexRow>

        {!modeDisabled && (
          <FlexCol className="gap-3">
            {options.map(({ key, icon, title, description }) => (
              <Button
                key={key}
                variant={ButtonVariant.Option}
                className={classNames(
                  '!h-auto w-auto flex-row-reverse gap-3 border border-border-subtlest-tertiary !p-3 laptop:flex-row',
                  {
                    'bg-brand-float border-brand-default': option === key,
                  },
                )}
                onClick={() => updatePreferences({ status: key })}
              >
                <RadioItem
                  className={{ content: '!pr-0' }}
                  checked={option === key}
                  readOnly
                />
                <div className="flex flex-1">
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
                </div>
              </Button>
            ))}
          </FlexCol>
        )}
        <Divider className="bg-border-subtlest-tertiary" />
        <FlexCol className="gap-6">
          <FlexCol>
            <Typography type={TypographyType.Body} bold>
              Supercharge your match quality
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              The more we understand your background and current terms, the
              better we can filter out noise and surface only roles that are
              truly worth your attention.{' '}
            </Typography>
          </FlexCol>
          <div className="flex flex-1 flex-col gap-6 tablet:flex-row">
            <FlexCol className="flex-1 gap-2">
              <Typography type={TypographyType.Body} bold>
                Upload CV
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                Your CV helps us understand your skills, experience, and career
                path so we can match you to opportunities that actually make
                sense. Never shared unless you explicitly say yes to an
                opportunity.
              </Typography>

              {preferences?.cv?.blob && (
                <Typography
                  className="flex items-center gap-1"
                  type={TypographyType.Footnote}
                >
                  <DocsIcon secondary /> {preferences.cv.blob}.
                  {fileSuffixMap[preferences.cv.contentType]}
                  <ClearResumeButton />
                </Typography>
              )}

              <UploadCVButton />
              <FeelingLazy />
            </FlexCol>

            {/* This is hidden until we implement it */}
            <span className="flex-1" />
            {/* <FlexCol className="flex-1 gap-2">
              <Typography type={TypographyType.Body} bold>
                Upload Employment Agreement
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                Sharing your current agreement lets us guarantee that any role
                we surface will exceed your existing terms. This stays 100%
                confidential and is only used to protect your time and
                negotiating power.
              </Typography>
              <Button
                variant={ButtonVariant.Subtle}
                size={ButtonSize.Small}
                className="mr-auto"
              >
                Upload PDF
              </Button>
            </FlexCol> */}
          </div>
        </FlexCol>
        <Divider className="bg-border-subtlest-tertiary" />
        <FlexCol className="gap-6">
          <Typography bold type={TypographyType.Body}>
            Your must-haves
          </Typography>

          <PreferenceOptionsForm />
        </FlexCol>
      </div>
    </AccountPageContainer>
  );
};

JobPreferencesPage.getLayout = getSettingsLayout;
JobPreferencesPage.layoutProps = { seo };

export default JobPreferencesPage;
