import { ProfilePicture } from '@dailydotdev/shared/src/components/ProfilePicture';
import { Meta, StoryObj } from '@storybook/react';
import { QueryClientProvider } from '../../extension/_providers';

const meta: Meta<typeof ProfilePicture> = {
  title: 'Components/Profile/ProfilePicture',
  component: ProfilePicture,
  args: {
    user: {
      image:
        'https://res.cloudinary.com/daily-now/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      id: '1337',
      username: 'johndoe',
    },
  },
  render: (args) => {
    return (
      <QueryClientProvider>
        <ProfilePicture {...args} />
      </QueryClientProvider>
    );
  },
};

export default meta;

type Story = StoryObj<typeof ProfilePicture>;

export const Default: Story = {
  args: {
    rounded: 'full',
  },
  name: 'ProfilePicture',
};
