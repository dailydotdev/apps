import type { ReactElement } from 'react';
import React from 'react';
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
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId } from '../../lib/features';
import { isCompanyPage } from '../../lib/companyPage';
import { SquadViewer } from '../../lib/viewer';
import { isDmAvailable } from '../../../messages/transport';
import { useOpenSupportChat } from '../../../messages/hooks/useOpenSupportChat';
import { useConditionalFeature } from '../../../../hooks/useConditionalFeature';
import { featureCompanySupportChat } from '../../../../lib/featureManagement';
import { SquadWidget } from './SquadWidget';

const SupportButton = ({ sourceId }: { sourceId: string }): ReactElement => {
  const { openSupportChat, isPending } = useOpenSupportChat(sourceId);

  return (
    <Button
      variant={ButtonVariant.Secondary}
      size={ButtonSize.Small}
      className="mt-3 w-full"
      loading={isPending}
      onClick={openSupportChat}
    >
      Support
    </Button>
  );
};

/**
 * For the admins of a company page: a group chat with the daily.dev founders.
 */
export const SquadSupportWidget = (): ReactElement | null => {
  const { squad, viewer, isViewerKnown } = useSquadPageContext();
  const isCandidate =
    isDmAvailable &&
    isViewerKnown &&
    viewer === SquadViewer.Admin &&
    isCompanyPage(squad);
  const { value: isEnabled } = useConditionalFeature({
    feature: featureCompanySupportChat,
    shouldEvaluate: isCandidate,
  });

  if (!isCandidate || !isEnabled) {
    return null;
  }

  return (
    <SquadWidget title="Talk to the founders">
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="mt-2"
      >
        Questions about your company page? Chat with the daily.dev founders in a
        private group with your page&apos;s admins.
      </Typography>
      <SupportButton sourceId={getSquadId(squad)} />
    </SquadWidget>
  );
};
