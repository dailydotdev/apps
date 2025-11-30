import type { ReactElement } from 'react';
import React, { useState, useCallback } from 'react';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ExitIcon, PlusIcon, SettingsIcon } from '../../icons';
import HeaderLogo from '../../layout/HeaderLogo';
import { SidebarScrollWrapper } from '../../sidebar/common';
import { TipCard, mockTips, MAX_VISIBLE_TIPS } from '../TipCard';

const Header = () => (
  <div className="p-4">
    <HeaderLogo isRecruiter />
  </div>
);

export const CompanyBadge = () => (
  <div className="flex items-center gap-2 p-3">
    <ProfilePicture
      user={{ image: null }}
      rounded="full"
      size={ProfileImageSize.Medium}
    />
    <div>
      <Typography type={TypographyType.Subhead} bold>
        ASP.NET
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        @asp.net
      </Typography>
    </div>
  </div>
);

const STACK_OFFSET = 10;
const ANIMATION_DURATION = 300;

const Tips = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);

  const getVisibleTips = useCallback(() => {
    return Array.from({ length: MAX_VISIBLE_TIPS }, (_, i) => {
      const tipIndex = (startIndex + i) % mockTips.length;
      return mockTips[tipIndex];
    });
  }, [startIndex]);

  const visibleTips = getVisibleTips();
  const stackHeight = 180 + (visibleTips.length - 1) * STACK_OFFSET;

  const handleSkip = useCallback(() => {
    if (isDismissing) {
      return;
    }

    setIsDismissing(true);

    setTimeout(() => {
      setStartIndex((prev) => (prev + 1) % mockTips.length);
      setIsDismissing(false);
    }, ANIMATION_DURATION);
  }, [isDismissing]);

  return (
    <div className="mb-4 p-3">
      <div className="relative" style={{ height: stackHeight }}>
        {visibleTips.map((tip, index) => (
          <TipCard
            key={tip.id}
            tip={tip}
            stackIndex={index}
            totalTips={visibleTips.length}
            isDismissing={index === 0 && isDismissing}
            onSkip={index === 0 ? handleSkip : undefined}
          />
        ))}
      </div>
    </div>
  );
};

const Footer = () => {
  const { user } = useAuthContext();
  return (
    <div className="flex items-center gap-2 border-t border-border-subtlest-tertiary p-3">
      <ProfilePicture user={{ image: null }} size={ProfileImageSize.Medium} />
      <div>
        <Typography type={TypographyType.Subhead} bold>
          {user?.name || 'Guest user'}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {user?.username || '@guestuser'}
        </Typography>
      </div>
      <div className="flex-1" />
      <Button
        variant={ButtonVariant.Tertiary}
        icon={<SettingsIcon />}
        size={ButtonSize.XSmall}
      />
      <Button
        variant={ButtonVariant.Tertiary}
        icon={<ExitIcon />}
        size={ButtonSize.XSmall}
      />
    </div>
  );
};

type SidebarSectionProps = {
  title: string;
};
const SidebarSection = ({ title }: SidebarSectionProps) => {
  return (
    <div className="px-2">
      <Typography
        type={TypographyType.Footnote}
        bold
        color={TypographyColor.Quaternary}
        className="px-4 py-1"
      >
        {title}
      </Typography>
      <Button
        variant={ButtonVariant.Option}
        className="w-full"
        size={ButtonSize.Small}
      >
        Senior Frontend Developer
      </Button>
      <Button
        variant={ButtonVariant.Option}
        className="w-full"
        size={ButtonSize.Small}
      >
        Full stack developer
      </Button>
    </div>
  );
};

export const Sidebar = (): ReactElement => {
  return (
    <aside className="flex min-h-screen w-60 flex-col border-r border-border-subtlest-tertiary">
      <SidebarScrollWrapper>
        <Header />
        <CompanyBadge />
        <nav className="flex flex-col gap-2">
          <div className="px-2">
            <Button
              variant={ButtonVariant.Option}
              className="w-full px-2"
              size={ButtonSize.Small}
            >
              <PlusIcon /> New job
            </Button>
          </div>
          <SidebarSection title="Active" />
          <SidebarSection title="Paused" />
        </nav>
        <div className="flex-1" />
        <Tips />
        <Footer />
      </SidebarScrollWrapper>
    </aside>
  );
};
