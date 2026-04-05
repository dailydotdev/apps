import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  BellIcon,
  ChromeIcon,
  DocsIcon,
  EdgeIcon,
  PhoneIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  appsUrl,
  downloadBrowserExtension,
} from '@dailydotdev/shared/src/lib/constants';
import {
  fileValidation,
  useUploadCv,
} from '@dailydotdev/shared/src/features/profile/hooks/useUploadCv';
import { useFileInput } from '@dailydotdev/shared/src/features/fileUpload/hooks/useFileInput';
import { useFileValidation } from '@dailydotdev/shared/src/features/fileUpload/hooks/useFileValidation';
import { useToastNotification } from '@dailydotdev/shared/src/hooks';
import {
  BrowserName,
  checkIsExtension,
  getCurrentBrowserName,
} from '@dailydotdev/shared/src/lib/func';
import { useEnableNotification } from '@dailydotdev/shared/src/hooks/notifications/useEnableNotification';
import {
  LogEvent,
  NotificationCtaPlacement,
  NotificationPromptSource,
  Origin,
} from '@dailydotdev/shared/src/lib/log';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';

const bellAnimationClass =
  'origin-top motion-safe:[animation:enable-notification-bell-ring_1.1s_ease-in-out_1.5s_infinite]';

const tileShellClass = classNames(
  'explore-quick-action-border group block w-full rounded-16 text-left',
  'transition duration-300 ease-out motion-safe:active:translate-y-0',
  'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blueCheese-default',
);

const tileInnerClass =
  'flex min-h-[5.5rem] items-center gap-4 rounded-14 bg-surface-float px-5 py-4';

const iconWrapClass =
  'flex h-14 w-14 shrink-0 items-center justify-center rounded-14 bg-surface-hover text-accent-blueCheese-default';

interface QuickActionLinkTileProps {
  href: string;
  rel?: string;
  target?: string;
  onClick?: () => void;
  icon: ReactElement;
  title: string;
  description: string;
}

const QuickActionLinkTile = ({
  href,
  rel,
  target,
  onClick,
  icon,
  title,
  description,
}: QuickActionLinkTileProps): ReactElement => (
  <Link href={href}>
    <a
      className={tileShellClass}
      href={href}
      rel={rel}
      target={target}
      onClick={onClick}
    >
      <span className={tileInnerClass}>
        <span className={iconWrapClass}>{icon}</span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="typo-title4 font-bold text-text-primary">
            {title}
          </span>
          <span className="text-text-tertiary typo-callout">{description}</span>
        </span>
      </span>
    </a>
  </Link>
);

interface QuickActionButtonTileProps {
  onClick: () => void;
  disabled?: boolean;
  icon: ReactElement;
  title: string;
  description: string;
}

const QuickActionButtonTile = ({
  onClick,
  disabled = false,
  icon,
  title,
  description,
}: QuickActionButtonTileProps): ReactElement => (
  <button
    type="button"
    className={classNames(tileShellClass, disabled && 'opacity-60')}
    onClick={onClick}
    disabled={disabled}
    aria-busy={disabled}
  >
    <span className={tileInnerClass}>
      <span className={iconWrapClass}>{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="typo-title4 font-bold text-text-primary">{title}</span>
        <span className="text-text-tertiary typo-callout">{description}</span>
      </span>
    </span>
  </button>
);

export const ExploreQuickActionsSection = (): ReactElement => {
  const { user, isLoggedIn } = useAuthContext();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const browserName = getCurrentBrowserName();
  const isEdge = browserName === BrowserName.Edge;

  const {
    shouldShowCta: showNotificationCta,
    onEnable: onEnableNotifications,
  } = useEnableNotification({
    source: NotificationPromptSource.ExplorePage,
    placement: NotificationCtaPlacement.ExploreQuickActions,
  });

  const { onUpload, status, shouldShow: shouldShowCvUpload } = useUploadCv();
  const { validateFiles } = useFileValidation(fileValidation);

  const handleCvFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) {
        return;
      }

      const { validFiles, errors } = validateFiles(files);

      if (errors.length > 0) {
        const first = errors[0];
        const fileName = first.file ? ` (${first.file.name})` : '';
        displayToast(`${first.message}${fileName}`);
        return;
      }

      const file = validFiles[0];
      if (!file) {
        return;
      }

      onUpload(file).catch(() => null);
    },
    [displayToast, onUpload, validateFiles],
  );

  const { input: cvFileInput, openFileInput: openCvFileInput } = useFileInput({
    onFiles: handleCvFiles,
    accept: fileValidation.acceptedTypes,
    disabled: status === 'pending',
  });

  const profilePercent = user?.profileCompletion?.percentage;
  const isCvUploading = status === 'pending';

  const uploadCvTitle =
    profilePercent !== undefined
      ? `Upload CV (${profilePercent}%)`
      : 'Upload CV';

  const extensionIcon = useMemo(
    () =>
      isEdge ? (
        <EdgeIcon size={IconSize.Large} aria-hidden />
      ) : (
        <ChromeIcon size={IconSize.Large} aria-hidden />
      ),
    [isEdge],
  );

  return (
    <section
      id="explore-quick-actions"
      className="px-8 pb-6 laptop:px-8"
      aria-label="Quick actions"
    >
      {cvFileInput}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(17.5rem,1fr))]">
        {!checkIsExtension() && (
          <QuickActionLinkTile
            href={downloadBrowserExtension}
            rel={anchorDefaultRel}
            target="_blank"
            icon={extensionIcon}
            title="Install extension"
            description="Chrome, Edge, Brave, and more. Stay in flow on any site."
            onClick={() =>
              logEvent({
                event_name: LogEvent.DownloadExtension,
                origin: Origin.ExplorePage,
              })
            }
          />
        )}

        {isLoggedIn && showNotificationCta && (
          <QuickActionButtonTile
            icon={
              <BellIcon
                size={IconSize.Large}
                className={bellAnimationClass}
                aria-hidden
              />
            }
            title="Enable notifications"
            description="Get nudges for replies, mentions, and threads you care about."
            onClick={() => {
              onEnableNotifications().catch(() => null);
            }}
          />
        )}

        <QuickActionLinkTile
          href={appsUrl}
          rel={anchorDefaultRel}
          target="_blank"
          icon={<PhoneIcon size={IconSize.Large} aria-hidden />}
          title="Get the mobile app"
          description="Pick up where you left off on iOS and Android."
        />

        {isLoggedIn &&
          (shouldShowCvUpload ? (
            <QuickActionButtonTile
              icon={
                isCvUploading ? (
                  <Loader aria-label="Uploading" />
                ) : (
                  <DocsIcon size={IconSize.Large} aria-hidden />
                )
              }
              title={uploadCvTitle}
              description="Add your résumé so we can match you to better opportunities."
              onClick={() => openCvFileInput()}
              disabled={isCvUploading}
            />
          ) : (
            <QuickActionLinkTile
              href="/settings/job-preferences"
              rel={anchorDefaultRel}
              icon={<DocsIcon size={IconSize.Large} aria-hidden />}
              title="Upload your CV"
              description="Manage your profile and job preferences in settings."
            />
          ))}
      </div>
    </section>
  );
};
