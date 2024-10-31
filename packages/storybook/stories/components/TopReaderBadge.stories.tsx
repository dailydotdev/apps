import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import user from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import ExtensionProviders from '../extension/_providers';
import { TopReaderBadge } from '@dailydotdev/shared/src/components/badges/TopReaderBadge';

const meta: Meta<typeof TopReaderBadge> = {
  title: 'components/TopReaderBadge',
  component: TopReaderBadge,
  args: {
    topReader: {
      id: 'someId',
      issuedAt: new Date(),
      user: {
        ...user,
        image: 'https://res.cloudinary.com/daily-now/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
      },
      keyword: {
        value: 'machine-learning',
        flags: {
          title: 'Machine Learning'
        }
      }
    }
  },
  render: (props) => {
    return (
      <ExtensionProviders>
        <div className={'py-20 grid place-items-center invert'}>
          <TopReaderBadge topReader={props.topReader} />
        </div>
      </ExtensionProviders>
    );
  },
};

export default meta;

type Story = StoryObj<typeof TopReaderBadge>;

export const Default: Story = {
};
