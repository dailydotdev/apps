import { UserStreak } from '../../../graphql/users';
import { LazyModalCommonProps } from '../common/Modal';

export interface StreakModalProps extends LazyModalCommonProps {
  currentStreak: UserStreak['current'];
  maxStreak: UserStreak['max'];
}
