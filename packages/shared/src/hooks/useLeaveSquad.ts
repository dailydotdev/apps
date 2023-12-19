import { useCallback, useContext } from 'react';
import { leaveSquad } from '../graphql/squads';
import { Squad } from '../graphql/sources';
import { PromptOptions, usePrompt } from './usePrompt';
import { useBoot } from './useBoot';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../lib/analytics';
import { ButtonColor, ButtonVariant } from '../components/buttons/ButtonV2';

type UseLeaveSquad = () => Promise<boolean>;

type UseLeaveSquadProps = {
  squad: Squad;
  callback?: (params?: unknown) => void;
};

export const useLeaveSquad = ({ squad }: UseLeaveSquadProps): UseLeaveSquad => {
  const { trackEvent } = useContext(AnalyticsContext);
  const { showPrompt } = usePrompt();
  const { deleteSquad: deleteCachedSquad } = useBoot();

  const onLeaveSquad = useCallback(async () => {
    const options: PromptOptions = {
      title: `Leave ${squad.name}`,
      description: `Leaving ${squad.name} means that you will lose your access to all posts that were shared in the Squad`,
      okButton: {
        title: 'Leave',
        variant: ButtonVariant.Secondary,
      },
      cancelButton: {
        title: 'Stay',
        variant: ButtonVariant.Primary,
        color: ButtonColor.Cabbage,
        type: 'button',
      },
      className: {
        buttons: 'flex-row-reverse',
      },
    };
    const left = await showPrompt(options);

    if (left) {
      trackEvent({
        event_name: AnalyticsEvent.LeaveSquad,
        extra: JSON.stringify({ squad: squad.id }),
      });
      await leaveSquad(squad.id);
      deleteCachedSquad(squad.id);
    }

    return left;
  }, [deleteCachedSquad, showPrompt, squad, trackEvent]);

  return onLeaveSquad;
};
