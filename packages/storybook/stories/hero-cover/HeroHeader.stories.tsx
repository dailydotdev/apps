import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page, Stage } from './parts';
import { HeroInFeed } from './widgets/frame';
import { campaignStrips } from './widgets/adSlot';
import type { RailWidget } from './widgets/rail';
import { rw, WidgetRail } from './widgets/rail';

const meta: Meta = {
  title: 'Hero Cover/Header',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const rail = (): RailWidget[] => [
  rw('featured', 'l'),
  rw('happening', 'm'),
  rw('agents', 'm'),
  rw('streak', 's'),
  rw('notifications', 's'),
  rw('mybrief', 'm'),
];

const hour = new Date().getHours();
const partOfDay =
  (hour < 12 && 'Good morning') ||
  (hour < 18 && 'Good afternoon') ||
  'Good evening';

const greeting = {
  title: `${partOfDay}, Tsahi`,
  subtitle: `${new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })} · 12 new since yesterday`,
};

export const Header: StoryObj = {
  name: 'Header',
  render: () => (
    <Page
      chapter="Header"
      question="Where do Customize and the arrows live?"
      title="The rail’s header"
      goal="Give the rail’s controls a home that reads as intentional, without making the hero taller than it needs to be."
      metric="Customize opens per visit and hero height above the fold, against today’s floating controls row."
    >
      <Case
        title="Recommended: A, a greeting"
        note="“Good morning, Tsahi” earns the row the controls already need, so it costs one line of height and buys a hero that feels like yours. Customize sits beside the title like Edit beside a list title on iOS, and the arrows take the Squad directory’s tertiary buttons. In edit mode the date line becomes the instructions."
      >
        <Stage columns={5}>
          <HeroInFeed columns={5}>
            <WidgetRail
              initialWidgets={rail()}
              strips={campaignStrips.slice(0, 1)}
              header="greeting"
              greeting={greeting}
            />
          </HeroInFeed>
        </Stage>
      </Case>

      <Case
        title="B, no header row"
        note="The shortest hero: no row above the rail at all. The arrows float on the rail’s edges on hover. Customizing works the way it does on iOS: press and hold any widget (or right-click it) and the rail starts to jiggle, with Done appearing above it; the rail’s last tile says Customize for anyone who scrolls that far. The cost: nothing on screen says the rail is yours to change until someone tries."
      >
        <Stage columns={5}>
          <HeroInFeed columns={5}>
            <WidgetRail
              initialWidgets={rail()}
              strips={campaignStrips.slice(0, 1)}
              header="floating"
            />
          </HeroInFeed>
        </Stage>
      </Case>

      <Case
        title="Today"
        note="A controls row with nothing to anchor it: Customize floats alone at the top right, and the arrows only show on hover."
      >
        <Stage columns={5}>
          <HeroInFeed columns={5}>
            <WidgetRail
              initialWidgets={rail()}
              strips={campaignStrips.slice(0, 1)}
            />
          </HeroInFeed>
        </Stage>
      </Case>
    </Page>
  ),
};
