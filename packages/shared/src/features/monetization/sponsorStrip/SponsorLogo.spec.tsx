import React from 'react';
import { render, screen } from '@testing-library/react';
import { useIsLightTheme } from '../../../hooks/utils/useThemedAsset';
import { SponsorLogo } from './SponsorLogo';
import { resolveSponsor, SponsorTier } from './sponsorStripCreative';
import { GOLD_HEIGHT, WALL_MAX_WIDTH, WALL_HEIGHT } from './sponsorLogoSizing';

jest.mock('../../../hooks/utils/useThemedAsset', () => ({
  useIsLightTheme: jest.fn(),
}));
jest.mock('./useSponsorSlotLog', () => ({
  useSponsorSlotLog: () => ({
    ref: jest.fn(),
    isViewable: false,
    onClick: jest.fn(),
  }),
}));

jest.mock('../../../components/cards/ad/common/AdPixel', () => ({
  AdPixel: () => null,
}));

const mockIsLightTheme = jest.mocked(useIsLightTheme);
const sponsor = resolveSponsor({
  generation_id: 'google-cloud',
  company_name: 'Google Cloud',
  icon: 'https://cdn.daily.dev/google-cloud.svg',
  icon_light: 'https://cdn.daily.dev/google-cloud-light.svg',
  icon_dark: 'https://cdn.daily.dev/google-cloud-dark.svg',
  link: 'https://cloud.google.com',
  pixels: [],
  tier: SponsorTier.Gold,
});

beforeEach(() => {
  mockIsLightTheme.mockReturnValue(false);
});

it.each([false, true])(
  'swaps themed logos with monochrome treatment %s',
  (monochrome) => {
    const renderLogo = () => (
      <SponsorLogo
        sponsor={sponsor}
        slotIndex={0}
        height={GOLD_HEIGHT}
        monochrome={monochrome}
      />
    );
    const expectLogo = (url: string | undefined) => {
      const image = screen.getByRole('img', { name: sponsor.company });
      if (monochrome) {
        expect(image).toHaveStyle({
          maskImage: `url(${url})`,
          backgroundColor: 'currentColor',
        });
      } else {
        expect(image).toHaveAttribute('src', url);
      }
    };
    const { rerender } = render(renderLogo());
    expectLogo(sponsor.logoDark);

    mockIsLightTheme.mockReturnValue(true);
    rerender(renderLogo());
    expectLogo(sponsor.logoLight);
  },
);

it.each([true, false])(
  'keeps single-image creatives working in light mode %s',
  (isLight) => {
    mockIsLightTheme.mockReturnValue(isLight);
    render(
      <SponsorLogo
        sponsor={{ ...sponsor, logoLight: undefined, logoDark: undefined }}
        slotIndex={0}
        height={GOLD_HEIGHT}
      />,
    );
    expect(screen.getByRole('img', { name: sponsor.company })).toHaveAttribute(
      'src',
      sponsor.logo,
    );
  },
);

it.each(['logoLight', 'logoDark'] as const)(
  'uses the available %s image in both themes before the legacy icon',
  (availableLogo) => {
    const singleThemeSponsor = {
      ...sponsor,
      logoLight: undefined,
      logoDark: undefined,
      [availableLogo]: sponsor[availableLogo],
    };
    const renderLogo = () => (
      <SponsorLogo
        sponsor={singleThemeSponsor}
        slotIndex={0}
        height={GOLD_HEIGHT}
      />
    );
    const { rerender } = render(renderLogo());
    expect(screen.getByRole('img', { name: sponsor.company })).toHaveAttribute(
      'src',
      sponsor[availableLogo],
    );

    mockIsLightTheme.mockReturnValue(true);
    rerender(renderLogo());
    expect(screen.getByRole('img', { name: sponsor.company })).toHaveAttribute(
      'src',
      sponsor[availableLogo],
    );
  },
);

it.each([true, false])(
  'keeps square and wide wall marks at the same height with monochrome treatment %s',
  (monochrome) => {
    const renderLogo = (ratio: number) => (
      <SponsorLogo
        sponsor={{ ...sponsor, ratio }}
        slotIndex={1}
        height={WALL_HEIGHT}
        maxWidth={WALL_MAX_WIDTH}
        monochrome={monochrome}
      />
    );
    const { rerender } = render(renderLogo(1));
    expect(screen.getByRole('img', { name: sponsor.company })).toHaveStyle({
      height: '16px',
      width: '16px',
    });

    rerender(renderLogo(6));
    expect(screen.getByRole('img', { name: sponsor.company })).toHaveStyle({
      height: '16px',
      width: '96px',
    });
  },
);
