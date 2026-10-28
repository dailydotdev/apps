import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Bullets, Case, Page, Table } from './parts';
import { Player } from './timeline';
import { coverHeader, coverSearch, crewHeader, discordPreview } from './videos';
import { frameFor } from './canvases';

const meta: Meta = {
  title: 'App Store Video/5. The cover in motion',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const CoverInMotion: StoryObj = {
  name: '5. The cover in motion',
  render: () => (
    <Page
      chapter="5"
      question="What do the videos look like?"
      title="Our hero cover, moving the way Discord moves"
      goal="Keep the art people already know from our listing and homepage, the developer and Patchy at the daily.dev portal, and give it Discord's motion: depth, pop, whips and big caption bands."
      metric="Impressions to product page views for the search loop, page views to installs for the header and the preview, each in its own Product Page Optimization test."
    >
      <Case
        title="0 · The crew header, alive · 21:9 · 16 s loop · silent"
        note="The live iPhone header with the crew of avatars. Smith animated the characters (the cat turns the disco ball, the robots blink, the axolotl and penguin wave, the mushroom smiles) and that clip is composited over this scene, where every lamp twinkles and fireflies drift. The composited MP4 is shared outside the repo, since review media stays out of git; this player shows the scene layer around the crew."
      >
        <Player video={crewHeader} frame={frameFor('header')} />
      </Case>
      <Case
        title="What we took from Discord"
        note="Discord's own App Store preview and screenshots, studied frame by frame."
      >
        <Table
          head={['Discord does', 'Our version']}
          rows={[
            [
              'Opens on its brand color with the logo while 3D objects float past at different depths, near ones blurred',
              'Opens on our hero cover with the logo; our 3D hashtag, RSS and newspaper objects float at three depths',
            ],
            [
              'Heavy, wide, all-caps lines in two short rows',
              'Plus Jakarta Sans ExtraBold in caps, the cover line "Where developers discover what’s next", popping in word by word',
            ],
            [
              'A fast zoom with motion blur carries you from the brand into the app',
              'The camera dives into the portal and the objects rush past, straight into the feed',
            ],
            [
              'Full-screen app moments with a blurred lower band and a huge caption that swaps phrases',
              'The real app with the same band: "The whole dev world" swaps to "In one feed"',
            ],
            [
              'UI pieces pop out of the screen (emoji panel, Join Voice bar)',
              'The topic chips, the action row and the streak pop out as they are tapped',
            ],
          ]}
        />
      </Case>
      <Case
        title="1 · The cover · header · 21:9 · 10 s loop · silent"
        note="The line stays in the safe area. The camera breathes toward the portal and back, so the end meets the start."
      >
        <Player video={coverHeader} frame={frameFor('header')} />
      </Case>
      <Case
        title="1b · The same cover · search results · 3:2"
        note="The same loop recomposed for the search card, so the cover is the first thing people see in search too."
      >
        <Player video={coverSearch} frame={frameFor('search')} />
      </Case>
      <Case
        title="2 · The Discord cut · app preview · 886 × 1920 · 22 s"
        note="It opens and closes on the cover, as Discord's opens and closes on its brand. Everything between is the app, recorded on a device, with the pop-outs, whips and caption bands added in the edit."
      >
        <Player video={discordPreview} frame={frameFor('preview')} />
      </Case>
      <Case title="How it is made">
        <Bullets
          items={[
            'Every frame is code over the real cover art, so both loops render straight from Storybook at 30 fps with no generation credits.',
            'The art is the same image as the homepage hero and the first screenshot, so the listing, the site and the video match.',
            'For the preview, the app parts are recorded on an iPhone; this animatic is the shot list and the overlay template for that edit.',
          ]}
        />
      </Case>
    </Page>
  ),
};
