import type { UserStreak } from '../../../graphql/users';
import type { LazyModalCommonProps } from '../common/Modal';

export interface StreakModalProps extends LazyModalCommonProps {
  currentStreak: UserStreak['current'];
  maxStreak: UserStreak['max'];
}
