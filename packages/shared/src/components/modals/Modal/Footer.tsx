import React, { ReactElement, ReactNode } from 'react';

type FooterProps = {
  onPrimaryButtonClick: () => void;
  onSecondaryButtonClick?: () => void;
  options?: ReactNode;
};

const Footer = ({
  onPrimaryButtonClick,
  onSecondaryButtonClick,
  options,
}: FooterProps): ReactElement => {

  return (
    <div>
      {options}
      {onPrimaryButtonClick && ()}
    </div>
  )
};

export default Footer;
