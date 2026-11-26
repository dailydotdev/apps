import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { MoveToIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { Loader } from '../../../../components/Loader';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId } from '../../lib/features';
import { isCompanyPage } from '../../lib/companyPage';
import { SquadViewer } from '../../lib/viewer';
import { isDmAvailable } from '../../../messages/transport';
import { useOpenSupportChat } from '../../../messages/hooks/useOpenSupportChat';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../../components/ProfilePicture';
import { FOUNDERS } from '../../../../lib/team';

const SupportStrip = ({ sourceId }: { sourceId: string }): ReactElement => {
  const { openSupportChat, isPending } = useOpenSupportChat(sourceId);

  return (
    <button
      type="button"
      title="A private group chat with the daily.dev founders and your page's admins"
      disabled={isPending}
      onClick={openSupportChat}
      className="flex min-h-[3.125rem] w-full items-center gap-3 rounded-16 border border-border-subtlest-tertiary px-4 py-3 text-left hover:bg-surface-hover"
    >
      <span className="flex shrink-0" aria-hidden>
        {FOUNDERS.map((founder, index) => (
          <ProfilePicture
            key={founder.username}
            user={founder}
            size={ProfileImageSize.XSmall}
            className={classNames(
              'border border-background-default',
              index !== 0 && '-ml-2',
            )}
          />
        ))}
      </span>
      <span className="min-w-0 flex-1 font-bold text-text-primary typo-callout">
        Talk to the founders
      </span>
      {isPending ? (
        <Loader className="shrink-0" />
      ) : (
        <MoveToIcon
          size={IconSize.Size16}
          className="shrink-0 text-text-tertiary"
        />
      )}
    </button>
  );
};

/**
 * For the admins of a company page: a group chat with the daily.dev founders.
 */
export const SquadSupportWidget = (): ReactElement | null => {
  const { squad, viewer, isViewerKnown } = useSquadPageContext();
  const isVisible =
    isDmAvailable &&
    isViewerKnown &&
    viewer === SquadViewer.Admin &&
    isCompanyPage(squad);

  if (!isVisible) {
    return null;
  }

  return <SupportStrip sourceId={getSquadId(squad)} />;
};
