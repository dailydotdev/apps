import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import user from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import ExtensionProviders from '../extension/_providers';
import { TopReaderBadge } from '@dailydotdev/shared/src/components/badges/TopReaderBadge';

const meta: Meta<typeof TopReaderBadge> = {
  title: 'components/TopReaderBadge',
  component: TopReaderBadge,
  args: {
    user: {
      ...user,
      image: 'https://res.cloudinary.com/daily-now/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
    },
    topReader: {
      date: '2023-02-09T03:35:33.898Z',
      keyword: {
        flags: {
          title: 'Machine Learning'
        }
      }
    }
  },
  render: (props) => {
    return (
      <ExtensionProviders>
        <div className={'py-20 grid place-items-center'}>
          <TopReaderBadge user={props.user} topReader={props.topReader} />
        </div>
      </ExtensionProviders>
    );
  },
};

export default meta;

type Story = StoryObj<typeof TopReaderBadge>;

export const Default: Story = {
};
