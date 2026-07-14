import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackLeaderboard } from '@dailydotdev/shared/src/features/giveback/components/GivebackLeaderboard';
import { mockStatus, withGiveback } from './giveback.mocks';

// The weekly contribution leaderboard shown on the Impact tab: ranked rows with
// medal chips for the podium, the viewer's own tinted row, and a "your rank"
// recap with the exact gap to the next place. Standings are placeholder until
// the backend leaderboard endpoint lands; the "You" row uses the real profile.
const meta: Meta<typeof GivebackLeaderboard> = {
  title: 'Features/Giveback/Leaderboard',
  component: GivebackLeaderboard,
  args: { onTakeAction: () => undefined },
  parameters: { layout: 'padded' },
  decorators: [withGiveback({ status: mockStatus({ userPoints: 320 }) })],
};

export default meta;

type Story = StoryObj<typeof GivebackLeaderboard>;

export const Default: Story = {};
