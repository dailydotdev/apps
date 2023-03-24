import { TutorialKey, useTutorial } from './useTutorial';

export function useSquadTourClose(): [() => void] {
  const sharePostTutorial = useTutorial({
    key: TutorialKey.ShareSquadPost,
  });

  const onClose = () => {
    if (!sharePostTutorial.isCompleted) {
      sharePostTutorial.activate();
    }
  };

  return [onClose];
}
