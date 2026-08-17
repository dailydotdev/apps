import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { WorldDistrict, WorldEntitlement } from '../graphql/world';
// The sheet is the bench plus its shell, so this covers the footer too.
import { WorldCustomizeSheet } from '../components/world/WorldCustomize';
import type {
  WorldDraft,
  WorldDraftSettings,
} from '../components/world/useWorldDraft';

const mockEntitlements = jest.fn<
  { entitlements?: WorldEntitlement[]; isPending: boolean },
  []
>();

/* The bench asks the API what this world has earned. What it is allowed to
   OFFER, given an answer, is what this file is about. */
jest.mock('../components/world/useWorldSettings', () => ({
  ...jest.requireActual('../components/world/useWorldSettings'),
  useWorldEntitlements: () => mockEntitlements(),
}));

const EMPTY: WorldDraftSettings = {
  name: null,
  sky: null,
  crest: null,
  look: null,
  private: false,
};

const district = (reads: number): WorldDistrict => ({
  niche: { slug: 'ai_llm' },
  reads,
  firstReadAt: '2024-01-01',
  lastReadAt: '2026-01-01',
  activeDays: 12,
});

const openBench = (
  settings: WorldDraftSettings = EMPTY,
  districts: WorldDistrict[] = [district(40)],
): WorldDraft => {
  const draft: WorldDraft = {
    isOpen: true,
    settings,
    setSettings: jest.fn(),
    open: jest.fn(),
    cancel: jest.fn(),
    save: jest.fn().mockResolvedValue(undefined),
    isSaving: false,
    applied: null,
  };

  render(
    <QueryClientProvider client={new QueryClient()}>
      <WorldCustomizeSheet
        userId="u1"
        draft={draft}
        districts={districts}
        settings={settings}
      />
    </QueryClientProvider>,
  );

  return draft;
};

beforeEach(() => {
  mockEntitlements.mockReturnValue({
    entitlements: [
      { kind: 'charge', id: 'obelisk', source: 'niche:ai_llm' },
      { kind: 'tincture', id: '#d97efe', source: 'niche:ai_llm' },
      { kind: 'tincture', id: '#887bf8', source: 'niche:ai_llm' },
    ],
    isPending: false,
  });
});

describe('WorldCustomize', () => {
  it('offers only the charges this world has actually raised', () => {
    openBench();

    expect(screen.getByRole('button', { name: /Obelisk/ })).toBeInTheDocument();
    // Somebody else's monument, and never on this shield.
    expect(
      screen.queryByRole('button', { name: /Anvil/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/1 of 26 charges earned/)).toBeInTheDocument();
  });

  /* Decided off the districts, so it needs no round trip — which is what stops
     the section growing from one line into a crest under the reader's cursor. */
  it('says a world has raised nothing without waiting for the catalogue', () => {
    mockEntitlements.mockReturnValue({
      entitlements: undefined,
      isPending: true,
    });
    openBench(EMPTY, [district(2)]);

    expect(
      screen.getByText(/becomes a charge you can fly/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('img', { name: 'Your standard' }),
    ).not.toBeInTheDocument();
  });

  it('draws its full height while the catalogue is still on the wire', () => {
    mockEntitlements.mockReturnValue({
      entitlements: undefined,
      isPending: true,
    });
    openBench();

    // The shield, both row labels and every division are in hand already; only
    // the two rows that ARE the catalogue are placeheld.
    expect(
      screen.getByRole('img', { name: 'Your standard' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Per pale/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Obelisk/ }),
    ).not.toBeInTheDocument();
  });

  it('lets the catalogue overrule the derivation when it grants nothing', () => {
    mockEntitlements.mockReturnValue({ entitlements: [], isPending: false });
    openBench();

    expect(
      screen.getByText(/becomes a charge you can fly/),
    ).toBeInTheDocument();
  });

  it('suggests a name off the reading rather than leaving the field blank', () => {
    openBench();

    expect(screen.getByPlaceholderText(/Arcane Swarm/)).toBeInTheDocument();
  });

  it('commits a suggestion as a name the reader chose', () => {
    const draft = openBench();

    fireEvent.click(screen.getByRole('button', { name: 'Another suggestion' }));

    expect(draft.setSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.stringContaining('Arcane Swarm'),
      }),
    );
  });

  it('offers eight palettes and five hours over the same world', () => {
    const draft = openBench();

    fireEvent.click(screen.getByRole('button', { name: 'Slate' }));
    expect(draft.setSettings).toHaveBeenCalledWith(
      expect.objectContaining({ sky: { pal: 'slate', hour: 'day' } }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Night' }));
    expect(draft.setSettings).toHaveBeenCalledWith(
      expect.objectContaining({ sky: { pal: 'brand', hour: 'night' } }),
    );
  });

  it('hides the world behind one switch', () => {
    const draft = openBench();

    fireEvent.click(screen.getByText('Private'));

    expect(draft.setSettings).toHaveBeenCalledWith(
      expect.objectContaining({ private: true }),
    );
  });

  it('leaves the world the way it was found on cancel, and writes on save', () => {
    const draft = openBench();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(draft.cancel).toHaveBeenCalled();
    expect(draft.save).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(draft.save).toHaveBeenCalled();
  });

  it('forks the preset into a look of your own the moment a knob moves', () => {
    const draft = openBench();

    fireEvent.keyDown(screen.getByRole('slider', { name: 'Outline' }), {
      key: 'ArrowRight',
    });

    expect(draft.setSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        look: expect.objectContaining({
          id: 'mine',
          base: 'diorama',
          mine: true,
        }),
      }),
    );
  });
});
