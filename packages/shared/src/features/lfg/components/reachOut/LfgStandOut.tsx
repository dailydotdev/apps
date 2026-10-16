import type { ReactElement, ReactNode } from 'react';
import React, { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { IconSize } from '../../../../components/Icon';
import { GitHubIcon } from '../../../../components/icons/GitHub';
import { OrganizationIcon } from '../../../../components/icons/Organization';
import { JobIcon } from '../../../../components/icons/Job';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { useEventListener } from '../../../../hooks/useEventListener';
import { getBetterAuthLinkSocialUrl } from '../../../../lib/betterAuth';
import { AuthEvent } from '../../../../lib/auth';
import { broadcastChannel, webappUrl } from '../../../../lib/constants';
import { LogEvent } from '../../../../lib/log';
import { useUploadCv } from '../../../profile/hooks/useUploadCv';
import { useFileInput } from '../../../fileUpload/hooks/useFileInput';
import { useFileValidation } from '../../../fileUpload/hooks/useFileValidation';
import type { LfgPerson } from '../../types';
import { lfgPersonQueryKey } from '../../queries';
import { shouldUseSocialAuthPopup } from '../../../../lib/func';

const workExperienceUrl = `${webappUrl}settings/profile/experience/work`;

enum StandOutItem {
  Github = 'github',
  Company = 'company',
  Experience = 'experience',
}

const StandOutRow = ({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: ReactNode;
}): ReactElement => (
  <div className="flex items-center gap-3">
    <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-background-default text-text-primary">
      {icon}
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <Typography type={TypographyType.Footnote} bold>
        {title}
      </Typography>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        {description}
      </Typography>
    </span>
    {action}
  </div>
);

// Nudges toward the details that make a yes easier, right where the
// reach-out is written. Work experience already on the profile goes out with
// the request; without it, a CV fills it in.
export const LfgStandOut = ({
  person,
}: {
  person: LfgPerson;
}): ReactElement | null => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { validateFiles } = useFileValidation();
  const { onUpload, status } = useUploadCv({ shouldOpenModal: false });
  const hasGithub = !!person.verifiedGithub;
  // The iOS app and mobile Brave can't open the GitHub window, and a redirect
  // would lose the pitch being written.
  const canConnectGithub = shouldUseSocialAuthPopup();
  const hasCompany = !!person.companies?.length;
  const hasExperience = !!person.experienceYears;
  const refreshPerson = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: lfgPersonQueryKey(user, person.id),
      }),
    [queryClient, user, person.id],
  );
  const track = (item: StandOutItem) =>
    logEvent({
      event_name: LogEvent.ClickLfgStandOut,
      extra: JSON.stringify({ item }),
    });

  // Linking finishes in another window, which reports back like a sign-in.
  const onAuthMessage = (event: MessageEvent) => {
    if (event.data?.eventKey === AuthEvent.Login) {
      refreshPerson();
    }
  };
  useEventListener(globalThis as unknown as Window, 'message', onAuthMessage);
  useEventListener(
    broadcastChannel as BroadcastChannel,
    'message',
    onAuthMessage,
  );

  const { input, openFileInput } = useFileInput({
    onFiles: (files) => {
      if (!files) {
        return;
      }

      const { validFiles, errors } = validateFiles(files);

      if (errors.length) {
        displayToast(errors[0].message);
        return;
      }

      onUpload(validFiles[0])
        .then(() => {
          displayToast(
            "CV uploaded. We'll fill in your work experience from it.",
          );
          refreshPerson();
        })
        .catch(() => displayToast('Failed to upload file. Please try again.'));
    },
    multiple: false,
    disabled: status === 'pending',
    accept: '.pdf,.docx',
  });

  if ((hasGithub || !canConnectGithub) && hasCompany && hasExperience) {
    return null;
  }

  // The window opens on the click itself, since Safari blocks one opened
  // after an await.
  const connectGithub = async () => {
    track(StandOutItem.Github);
    const popup = window.open();
    const url = await getBetterAuthLinkSocialUrl(
      'github',
      `${window.location.origin}/callback?login=true`,
    ).catch(() => undefined);

    if (url && popup) {
      popup.location.href = url;
      return;
    }

    popup?.close();
    displayToast("Couldn't connect GitHub. Please try again.");
  };

  return (
    <div className="flex flex-col gap-3 rounded-16 bg-surface-float p-4">
      <div className="flex flex-col gap-0.5">
        <Typography type={TypographyType.Callout} bold>
          Stand out
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          These make it easier to say yes. Each takes a few seconds.
        </Typography>
      </div>
      {!hasGithub && canConnectGithub && (
        <StandOutRow
          icon={<GitHubIcon size={IconSize.Size16} />}
          title="Connect GitHub"
          description="Links to your own repos get a verified badge"
          action={
            <Button
              type="button"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.XSmall}
              onClick={connectGithub}
            >
              Connect
            </Button>
          }
        />
      )}
      {!hasCompany && (
        <StandOutRow
          icon={<OrganizationIcon size={IconSize.Size16} />}
          title="Verify where you work"
          description="Confirm with your work email. Only the company name shows."
          action={
            <Button
              tag="a"
              href={workExperienceUrl}
              target="_blank"
              rel="noopener"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.XSmall}
              onClick={() => track(StandOutItem.Company)}
            >
              Verify
            </Button>
          }
        />
      )}
      {!hasExperience && (
        <StandOutRow
          icon={<JobIcon size={IconSize.Size16} />}
          title="Add your work experience"
          description="Upload your CV and it fills in your profile."
          action={
            <Button
              type="button"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.XSmall}
              loading={status === 'pending'}
              onClick={() => {
                track(StandOutItem.Experience);
                openFileInput();
              }}
            >
              Upload CV
            </Button>
          }
        />
      )}
      {input}
    </div>
  );
};
