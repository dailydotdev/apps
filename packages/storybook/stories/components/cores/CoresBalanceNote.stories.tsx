import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { fn } from 'storybook/test';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { CoresRole } from '@dailydotdev/shared/src/lib/user';
import { CoresBalanceNote } from '@dailydotdev/shared/src/components/cores/CoresBalanceNote';
import { AwardFeesNote } from '@dailydotdev/shared/src/components/cores/AwardFeesNote';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons/Core';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

const makeUser = (balance: number): LoggedUser => ({
  id: 'user1',
  name: 'Ada Lovelace',
  username: 'ada',
  image: 'https://daily.dev/user.png',
  permalink: 'https://daily.dev/ada',
  providers: ['google'],
  premium: false,
  reputation: 100,
  createdAt: '2023-01-01',
  coresRole: CoresRole.User,
  balance: { amount: balance },
});

const WithBalance = ({
  balance,
  children,
}: {
  balance: number;
  children: ReactNode;
}): ReactElement => (
  <AuthContext.Provider
    value={{
      user: makeUser(balance),
      shouldShowLogin: false,
      showLogin: fn(),
      logout: fn(),
      updateUser: fn(),
      tokenRefreshed: true,
      isLoggedIn: true,
      isAuthReady: true,
      closeLogin: fn(),
      getRedirectUri: fn(),
      squads: [],
    }}
  >
    {children}
  </AuthContext.Provider>
);

// Mirrors the Modal.Footer markup used by the real purchase modals.
const ModalFooterFrame = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex w-full flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default">
    <Typography
      type={TypographyType.Body}
      bold
      className="border-b border-border-subtlest-tertiary p-4"
    >
      {title}
    </Typography>
    <div className="h-24 p-4" />
    <footer className="flex w-full flex-col items-center gap-3 border-t border-border-subtlest-tertiary p-3">
      {children}
    </footer>
  </div>
);

const StreakFreezeFooter = ({
  balance,
  price,
}: {
  balance: number;
  price: number;
}) => (
  <WithBalance balance={balance}>
    <ModalFooterFrame title="Streak freezes">
      <Button className="w-full" variant={ButtonVariant.Primary}>
        {balance >= price ? (
          <>
            Get 3 freezes for <CoreIcon />
            {price}
          </>
        ) : (
          <>
            Buy Cores <CoreIcon />
            {price}
          </>
        )}
      </Button>
      <CoresBalanceNote price={price} />
    </ModalFooterFrame>
  </WithBalance>
);

const AwardFooter = ({ balance, price }: { balance: number; price: number }) => (
  <WithBalance balance={balance}>
    <ModalFooterFrame title="Give an Award">
      <Button className="w-full" variant={ButtonVariant.Primary}>
        Send Award for <CoreIcon /> {price}
      </Button>
      <CoresBalanceNote price={price} />
      <AwardFeesNote />
    </ModalFooterFrame>
  </WithBalance>
);

const BriefingCard = ({
  balance,
  price,
}: {
  balance: number;
  price: number;
}) => (
  <WithBalance balance={balance}>
    <div className="flex w-full flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
      <div>
        <Typography type={TypographyType.Callout} bold>
          Want just this one?
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="mt-2"
        >
          Generate a one-off Presidential Briefing based on the past day or
          week. No commitment. Yours now.
        </Typography>
      </div>
      <Button size={ButtonSize.Medium} variant={ButtonVariant.Secondary}>
        Generate for
        <CoreIcon className="mx-1" aria-hidden />
        {price}
      </Button>
      <CoresBalanceNote price={price} className="-mt-1" />
    </div>
  </WithBalance>
);

const Column = ({
  label,
  width,
  children,
}: {
  label: string;
  width: number;
  children: ReactNode;
}) => (
  <div className="flex w-full flex-col gap-4" style={{ maxWidth: width }}>
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Quaternary}
      bold
    >
      {label}
    </Typography>
    {children}
  </div>
);

const meta: Meta<typeof CoresBalanceNote> = {
  title: 'Components/Cores/CoresBalanceNote',
  component: CoresBalanceNote,
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj<typeof CoresBalanceNote>;

export const InContext: Story = {
  render: () => (
    <div className="flex flex-wrap gap-10 bg-background-default p-4 tablet:p-6">
      <Column label="Desktop · enough Cores" width={420}>
        <StreakFreezeFooter balance={1250} price={400} />
        <BriefingCard balance={1250} price={300} />
        <AwardFooter balance={1250} price={50} />
      </Column>
      <Column label="Desktop · not enough Cores" width={420}>
        <StreakFreezeFooter balance={120} price={400} />
        <BriefingCard balance={120} price={300} />
        <AwardFooter balance={20} price={50} />
      </Column>
      <Column label="Mobile (343px content)" width={343}>
        <StreakFreezeFooter balance={1250} price={400} />
        <StreakFreezeFooter balance={120} price={400} />
      </Column>
    </div>
  ),
};

export const Standalone: Story = {
  args: { price: 400 },
  render: (args) => (
    <WithBalance balance={120}>
      <CoresBalanceNote {...args} />
    </WithBalance>
  ),
};
