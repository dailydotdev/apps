import { TutorialKey, useTutorial } from './useTutorial';

export function useSquadTourClose(): [() => void] {
  const sharePostTutorial = useTutorial({
    key: TutorialKey.ShareSquadPost,
  });
  const enableNotifications = useTutorial({
    key: TutorialKey.SquadEnableNotifications,
  });

  const onClose = () => {
    if (!sharePostTutorial.isCompleted) {
      sharePostTutorial.activate();
    }
    enableNotifications.complete();
  };

  return [onClose];
}
