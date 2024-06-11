import React, {
  FormEvent,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ClearIcon,
  MenuIcon,
  PlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';
import {
  LogEvent,
  ShortcutsSourceType,
  TargetType,
} from '@dailydotdev/shared/src/lib/log';
import {
  useActions,
  useConditionalFeature,
  useToastNotification,
} from '@dailydotdev/shared/src/hooks';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import useContextMenu from '@dailydotdev/shared/src/hooks/useContextMenu';
import { ContextMenu } from '@dailydotdev/shared/src/hooks/constants';
import classNames from 'classnames';
import { combinedClicks } from '@dailydotdev/shared/src/lib/click';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { ShortcutsUIExperiment } from '@dailydotdev/shared/src/lib/featureValues';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import { useThemedAsset } from '@dailydotdev/shared/src/hooks/utils';
import CustomLinksModal from './ShortcutLinksModal';
import MostVisitedSitesModal from './MostVisitedSitesModal';
import { CustomLinks } from './CustomLinks';
import useShortcutLinks from './useShortcutLinks';
import ShortcutOptionsMenu from './ShortcutOptionsMenu';

const pixelRatio = globalThis?.window.devicePixelRatio ?? 1;
const iconSize = Math.round(24 * pixelRatio);

const ShortCutV1Placeholder = ({
  initialItem = false,
  onClick,
}: {
  initialItem?: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      className="group mr-4 flex flex-col items-center first:mr-2 last-of-type:mr-2 hover:cursor-pointer"
      onClick={onClick}
      type="button"
    >
      <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-surface-float text-text-secondary group-first:mb-1 group-hover:text-text-primary">
        <PlusIcon
          className="inline group-hover:hidden"
          size={IconSize.Size16}
        />
        <PlusIcon
          className="hidden group-hover:inline"
          secondary
          size={IconSize.Size16}
        />
      </div>
      {initialItem ? (
        <span className="text-text-tertiary typo-caption2">Add shortcut</span>
      ) : (
        <span className="h-2 w-10 rounded-10 bg-surface-float" />
      )}
    </button>
  );
};

const ShortcutV1Item = ({
  url,
  onLinkClick,
}: {
  url: string;
  onLinkClick: () => void;
}) => {
  const cleanUrl = url.replace(/http(s)?(:)?(\/\/)?|(\/\/)?(www\.)?/g, '');
  return (
    <a
      href={url}
      rel="noopener noreferrer"
      {...combinedClicks(onLinkClick)}
      className="group mr-4 flex flex-col items-center"
    >
      <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-surface-float text-text-secondary">
        <img
          src={`https://api.daily.dev/icon?url=${encodeURIComponent(
            url,
          )}&size=${iconSize}`}
          alt={url}
          className="size-6"
        />
      </div>
      <span className="max-w-12 truncate text-text-tertiary typo-caption2">
        {cleanUrl}
      </span>
    </a>
  );
};

const ShortcutUIItemPlaceholder = ({ children }: { children: ReactNode }) => {
  return (
    <div className="group flex flex-col items-center">
      <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-surface-float text-text-secondary">
        {children}
      </div>
      <span className="h-2 w-10 rounded-10 bg-surface-float" />
    </div>
  );
};

interface ShortcutLinksProps {
  shouldUseListFeedLayout: boolean;
}
export default function ShortcutLinks({
  shouldUseListFeedLayout,
}: ShortcutLinksProps): ReactElement {
  const className = !shouldUseListFeedLayout
    ? 'ml-auto'
    : 'mt-4 w-fit mx-4 laptop:mx-0';
  const { checkHasCompleted, isActionsFetched, completeAction } = useActions();
  const shortcutsUIFeature = useFeature(feature.shortcutsUI);
  const isShortcutsUIV1 = shortcutsUIFeature === ShortcutsUIExperiment.V1;
  const { showTopSites, toggleShowTopSites } = useContext(SettingsContext);
  const [showModal, setShowModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { displayToast } = useToastNotification();
  const { logEvent } = useContext(LogContext);
  const {
    askTopSitesPermission,
    revokePermission,
    onIsManual,
    resetSelected,
    shortcutLinks,
    formLinks = [],
    hasTopSites,
    hasCheckedPermission,
    isManual,
    formRef,
    onSaveChanges,
    isTopSiteActive,
  } = useShortcutLinks();
  const shortcutSource = isTopSiteActive
    ? ShortcutsSourceType.Browser
    : ShortcutsSourceType.Custom;

  const loggedInitialRef = useRef(false);
  const loggedRef = useRef(false);

  const { value: isShortcutsV1 } = useConditionalFeature({
    feature: feature.onboardingMostVisited,
    shouldEvaluate: showTopSites,
  });
  const { onMenuClick, isOpen } = useContextMenu({
    id: ContextMenu.ShortcutContext,
  });

  useEffect(() => {
    if (!showTopSites || !hasCheckedPermission) {
      if (!loggedInitialRef.current) {
        loggedInitialRef.current = true;
        logEvent({
          event_name: LogEvent.Impression,
          target_type: TargetType.Shortcuts,
          extra: JSON.stringify({
            source: isShortcutsV1
              ? ShortcutsSourceType.Placeholder
              : ShortcutsSourceType.Button,
          }),
        });
      }

      return;
    }

    if (loggedRef.current) {
      return;
    }

    loggedRef.current = true;

    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({ source: shortcutSource }),
    });
  }, [
    logEvent,
    showTopSites,
    shortcutSource,
    hasCheckedPermission,
    isShortcutsV1,
  ]);

  const onOptionsOpen = () => {
    setShowOptions(true);

    logEvent({
      event_name: LogEvent.OpenShortcutConfig,
      target_type: TargetType.Shortcuts,
    });
  };

  const onV1Hide = () => {
    if (!isShortcutsUIV1) {
      displayToast(
        'Get your shortcuts back by turning it on from the customize options on the sidebar',
      );
    }

    toggleShowTopSites();
  };

  const { githubShortcut } = useThemedAsset();

  if (
    showTopSites &&
    isActionsFetched &&
    !checkHasCompleted(ActionType.FirstShortcutsSession) &&
    isShortcutsUIV1
  ) {
    const placeholderShortcutLinks = [
      cloudinary.shortcuts.icons.gmail,
      githubShortcut,
      cloudinary.shortcuts.icons.reddit,
      cloudinary.shortcuts.icons.openai,
      cloudinary.shortcuts.icons.stackoverflow,
    ];

    return (
      <div className="mb-6 hidden flex-col gap-6 px-4 tablet:flex laptop:items-center">
        <h4 className="font-bold text-text-primary typo-title3">
          Choose your most visited sites
        </h4>
        <div className="flex gap-4">
          {placeholderShortcutLinks.map((url) => (
            <ShortcutUIItemPlaceholder key={url}>
              <img src={url} alt={url} className="size-6 object-contain" />
            </ShortcutUIItemPlaceholder>
          ))}
          <ShortcutUIItemPlaceholder>
            <PlusIcon />
          </ShortcutUIItemPlaceholder>
        </div>
        <div className="flex gap-4">
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Medium}
            onClick={() => {
              toggleShowTopSites();

              completeAction(ActionType.FirstShortcutsSession);
            }}
          >
            Skip for now
          </Button>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            onClick={() => {
              onOptionsOpen();

              completeAction(ActionType.FirstShortcutsSession);
            }}
          >
            Add shortcuts
          </Button>
        </div>
      </div>
    );
  }

  if (!showTopSites) {
    return <></>;
  }

  const onShowTopSites = () => {
    if (hasTopSites === null) {
      setShowModal(true);
    }

    onIsManual(false);
  };

  const onSubmit = async (e: FormEvent) => {
    const { errors } = await onSaveChanges(e);

    if (errors) {
      return;
    }

    setShowOptions(false);
  };

  const onLinkClick = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({ source: shortcutSource }),
    });
  };

  const ShortcutV1 = () => {
    return (
      <div
        className={classNames(
          'hidden tablet:flex',
          shouldUseListFeedLayout ? 'mx-6 mb-3 mt-1' : '-mt-2 mb-5',
        )}
      >
        {shortcutLinks?.length ? (
          <>
            {shortcutLinks.map((url) => (
              <ShortcutV1Item key={url} url={url} onLinkClick={onLinkClick} />
            ))}
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<MenuIcon className="rotate-90" secondary />}
              onClick={onMenuClick}
              className="mt-2"
            />
          </>
        ) : (
          <>
            <ShortCutV1Placeholder initialItem onClick={onOptionsOpen} />
            {Array.from({ length: 5 }).map((_, index) => (
              /* eslint-disable-next-line react/no-array-index-key */
              <ShortCutV1Placeholder key={index} onClick={onOptionsOpen} />
            ))}
            <Button
              variant={ButtonVariant.Tertiary}
              onClick={onV1Hide}
              size={ButtonSize.Small}
              icon={<ClearIcon secondary />}
              className="mt-2"
            />
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {isShortcutsV1 ? (
        <ShortcutV1 />
      ) : (
        <>
          {shortcutLinks?.length ? (
            <CustomLinks
              links={shortcutLinks}
              className={className}
              onOptions={onOptionsOpen}
              onLinkClick={onLinkClick}
            />
          ) : (
            <Button
              className={className}
              variant={ButtonVariant.Tertiary}
              icon={<PlusIcon />}
              iconPosition={ButtonIconPosition.Right}
              onClick={onOptionsOpen}
            >
              Add shortcuts
            </Button>
          )}
        </>
      )}
      {showModal && (
        <MostVisitedSitesModal
          isOpen={showModal}
          onRequestClose={() => {
            setShowModal(false);
            onIsManual(true);
          }}
          onApprove={async () => {
            setShowModal(false);
            const granted = await askTopSitesPermission();
            if (!granted) {
              onIsManual(true);
            }
          }}
        />
      )}
      {showOptions && hasCheckedPermission && (
        <CustomLinksModal
          onSubmit={onSubmit}
          formRef={formRef}
          isOpen={showOptions}
          isManual={isManual}
          links={formLinks}
          onRevokePermission={revokePermission}
          onShowPermission={() => setShowModal(true)}
          onRequestClose={() => {
            setShowOptions(false);
            resetSelected();
          }}
          onShowCustomLinks={() => onIsManual(true)}
          onShowTopSitesClick={onShowTopSites}
        />
      )}
      <ShortcutOptionsMenu
        isOpen={isOpen}
        onHide={onV1Hide}
        onManage={onOptionsOpen}
      />
    </>
  );
}
