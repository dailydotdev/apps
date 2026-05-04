import type { ReactElement } from 'react';
import React, { useState } from 'react';
import LogoIcon from '../../svg/LogoIcon';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  ArrowIcon,
  BookmarkIcon,
  ChromeIcon,
  DiscussIcon,
  EdgeIcon,
  MenuIcon,
  MiniCloseIcon,
  ShareIcon,
  UpvoteIcon,
} from '../icons';
import { IconSize } from '../Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { useLogContext } from '../../contexts/LogContext';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { useActions } from '../../hooks/useActions';
import { featureCompanionDemoWidget } from '../../lib/featureManagement';
import { ActionType } from '../../graphql/actions';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import {
  BrowserName,
  checkIsExtension,
  getCurrentBrowserName,
} from '../../lib/func';
import { downloadBrowserExtension } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';

const StripIcon = ({
  Icon,
  ariaLabel,
  onClick,
}: {
  Icon: typeof UpvoteIcon;
  ariaLabel: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-label={ariaLabel}
    onClick={onClick}
    className="flex size-9 items-center justify-center rounded-10 text-text-tertiary hover:bg-surface-float hover:text-text-primary"
  >
    <Icon size={IconSize.Small} />
  </button>
);

export function CompanionDemoWidget(): ReactElement | null {
  const { logEvent } = useLogContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const hasDismissed = checkHasCompleted(ActionType.DismissCompanionDemoWidget);
  const canEvaluate =
    isLaptop && !checkIsExtension() && isActionsFetched && !hasDismissed;
  const { value: isFeatureOn } = useConditionalFeature({
    feature: featureCompanionDemoWidget,
    shouldEvaluate: canEvaluate,
  });
  const isVisible = canEvaluate && isFeatureOn;

  const [isOpen, setIsOpen] = useState(false);
  const browserName = getCurrentBrowserName();
  const isEdge = browserName === BrowserName.Edge;

  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.ExtensionPromo,
      target_id: 'companion_demo_widget',
      extra: JSON.stringify({ origin: Origin.ArticlePage }),
    }),
    { condition: isVisible },
  );

  if (!isVisible) {
    return null;
  }

  const open = () => {
    setIsOpen(true);
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.ExtensionPromo,
      target_id: 'companion_demo_widget',
      extra: JSON.stringify({ origin: Origin.ArticlePage, action: 'open' }),
    });
  };

  const dismiss = () => {
    setIsOpen(false);
    completeAction(ActionType.DismissCompanionDemoWidget);
  };

  const handleInstallClick = () => {
    logEvent({
      event_name: LogEvent.DownloadExtension,
      target_type: TargetType.ExtensionPromo,
      target_id: 'companion_demo_widget',
      extra: JSON.stringify({ origin: Origin.ArticlePage }),
    });
    completeAction(ActionType.DismissCompanionDemoWidget);
  };

  return (
    <div
      data-testid="companion-demo-widget"
      className="fixed right-0 top-[7.5rem] z-modal flex max-w-[26.5rem] flex-row items-stretch transition-transform"
    >
      <div className="my-6 flex w-14 select-none flex-col items-center gap-1 self-start rounded-l-16 border border-r-0 border-border-subtlest-quaternary bg-background-default p-2 shadow-2">
        <div className="flex w-full justify-center gap-0.5 pb-1">
          <span className="size-0.5 rounded-full bg-text-quaternary" />
          <span className="size-0.5 rounded-full bg-text-quaternary" />
          <span className="size-0.5 rounded-full bg-text-quaternary" />
        </div>
        <button
          type="button"
          aria-label={
            isOpen ? 'Close companion preview' : 'Open companion preview'
          }
          onClick={isOpen ? () => setIsOpen(false) : open}
          className="group flex size-10 items-center justify-center rounded-10 text-text-tertiary hover:bg-surface-float hover:text-text-primary"
        >
          {isOpen ? (
            <ArrowIcon className="rotate-90" />
          ) : (
            <LogoIcon className={{ container: 'w-6 rounded-8' }} />
          )}
        </button>
        <StripIcon Icon={UpvoteIcon} ariaLabel="Upvote" onClick={open} />
        <StripIcon Icon={DiscussIcon} ariaLabel="Comment" onClick={open} />
        <StripIcon Icon={BookmarkIcon} ariaLabel="Bookmark" onClick={open} />
        <StripIcon Icon={ShareIcon} ariaLabel="Share" onClick={open} />
        <StripIcon Icon={MenuIcon} ariaLabel="More options" onClick={open} />
      </div>

      {isOpen && (
        <div className="my-6 flex w-[22.5rem] flex-col self-start rounded-bl-16 rounded-tl-16 border border-r-0 border-border-subtlest-quaternary bg-background-default p-6 shadow-2">
          <div className="flex flex-row items-center gap-3">
            <LogoIcon className={{ container: 'w-8 rounded-8' }} />
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<MiniCloseIcon />}
              onClick={() => setIsOpen(false)}
              aria-label="Close"
              className="ml-auto"
            />
          </div>
          <Typography type={TypographyType.Title3} bold className="mt-4">
            Want this on every article?
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
            className="mt-1"
          >
            The daily.dev companion brings the TLDR, discussion and related
            posts to every article you open across the web.
          </Typography>
          <Button
            tag="a"
            href={downloadBrowserExtension}
            target="_blank"
            rel={anchorDefaultRel}
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            icon={
              isEdge ? <EdgeIcon aria-hidden /> : <ChromeIcon aria-hidden />
            }
            onClick={handleInstallClick}
            className="mt-5 w-full"
          >
            Install for {isEdge ? 'Edge' : 'Chrome'}
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={dismiss}
            className="mt-2"
          >
            Don&apos;t show again
          </Button>
        </div>
      )}
    </div>
  );
}
