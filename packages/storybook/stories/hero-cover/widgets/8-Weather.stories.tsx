import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page } from '../parts';
import { Decisions, StateRow } from './review';
import {
  WeatherLoading,
  WeatherSetup,
  WeatherWidget,
  weatherScenes,
} from './weather';

const meta: Meta = {
  title: 'Hero Cover/Final/5. Widgets/Weather',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Weather: StoryObj = {
  name: 'Weather',
  render: () => (
    <Page
      chapter="Widgets"
      question="What does weather look like on a developer's front page?"
      title="Weather"
      goal="A glanceable weather widget in daily.dev's language: the sky's condition as a glow in one of our accents, the temperature leads, and bigger sizes add the next hours and the next days."
      metric="Share of readers who add it, and repeat visits from readers who have it versus those who don't."
    >
      <Case
        title="How it works"
        note="No backend work: the location comes from the browser (one prompt) or a city the reader picks, and the forecast from a keyless public API (Open-Meteo, cached 15 minutes). Units follow the reader's locale, °C or °F. Small shows now; Tall adds the next hours and five days; Large adds the summary, next-hour rain or alerts, and ten days with range bars."
      >
        <Decisions
          items={[
            'Sizes to ship: Small only, or Small and Tall, or all three',
            'Location: browser permission, city picker, or both',
            'Show severe weather alerts, and from which source',
            'Data provider for launch (Open-Meteo is free for non-commercial use; a commercial plan or Apple WeatherKit for production)',
          ]}
        />
      </Case>
      <Case title="Every state, at every size">
        <div className="flex flex-col gap-8">
          {weatherScenes.map((scene) => (
            <StateRow
              key={scene.id}
              title={scene.label}
              note={`${scene.city} · ${scene.temp}°${scene.unit}`}
              render={(size) => <WeatherWidget size={size} scene={scene} />}
            />
          ))}
          <StateRow
            title="No location yet"
            note="First run: one clear ask in the widget's own material. Nothing is requested until the reader taps."
            render={(size) => <WeatherSetup size={size} />}
          />
          <StateRow
            title="Loading"
            note="The skeleton keeps the layout, so the forecast lands without a jump."
            render={(size) => <WeatherLoading size={size} />}
          />
        </div>
      </Case>
    </Page>
  ),
};
