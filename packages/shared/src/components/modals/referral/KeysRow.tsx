import React, { PropsWithChildren, ReactElement } from 'react';
import classNames from 'classnames';
import { cloudinary } from '../../../lib/image';
import { KeyReferralIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { WithClassNameProps } from '../../utilities';

interface KeysRowProps {
  count: number;
}

const Container = ({
  children,
  className,
}: PropsWithChildren<WithClassNameProps>) => (
  <span
    className={classNames(
      'flex flex-row justify-evenly items-center mt-10 w-full bg-center bg-no-repeat bg-cover',
      className,
    )}
    style={{
      backgroundImage: `url(${cloudinary.referralCampaign.search.bgKeys})`,
    }}
  >
    {children}
  </span>
);

const enabledKey = <KeyReferralIcon size={IconSize.XLarge} />;
const disabledKey = <KeyReferralIcon secondary size={IconSize.XLarge} />;

export function KeysRow({ count }: KeysRowProps): ReactElement {
  if (count === 5) {
    return (
      <Container>
        {enabledKey}
        {enabledKey}
        {enabledKey}
        {enabledKey}
        {enabledKey}
      </Container>
    );
  }

  if (count > 5) {
    return (
      <Container className="!justify-center">
        <KeyReferralIcon size={IconSize.XXLarge} />
        <span className="font-bold typo-title2">x{count}</span>
      </Container>
    );
  }

  if (count === 0) {
    return (
      <Container>
        {disabledKey}
        {disabledKey}
        {disabledKey}
        {disabledKey}
        {disabledKey}
      </Container>
    );
  }

  return (
    <Container>
      {Array(count)
        .fill(0)
        .map(() => enabledKey)}
    </Container>
  );
}
