import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Experiments/Helpers',
  parameters: {
    docs: {
      description: {
        component: 'To make running experiments and loading feature flags easier across different pages, layouts and components in our codebase we have few helpers that you can use.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const UseFeature: Story = {
  render: () => (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '16px' }}>useFeature</h1>
      <p style={{ marginBottom: '16px' }}>
        This hook is used to load and allocate feature flags and experiments. It is important to note that calling this hook automatically allocates the user in any matched experiment using requested feature flag.
      </p>
      <pre style={{
        backgroundColor: 'var(--theme-background-subtle)',
        padding: '16px',
        borderRadius: '8px',
        overflow: 'auto',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
{`import { useFeature } from './GrowthBookProvider';
import { feature } from '../lib/featureManagement';

const MyComponent = () => {
  const feedVersion = useFeature(feature.feedVersion);

  if (enabled) {
    return <div>{data}</div>;
  }

  return null;
};`}
      </pre>
      <p style={{ marginTop: '16px' }}>
        We manage all known feature flag names, values and other constants in the <code>featureManagement</code> file.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Hook for loading and allocating feature flags and experiments.',
      },
    },
  },
};

export const WithFeatureBoundaryHOC: Story = {
  render: () => (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '16px' }}>withFeatureBoundary HOC</h1>
      <p style={{ marginBottom: '16px' }}>
        Our features are loaded together with boot endpoint but initialization of GrowthBook instance is still done async. This HOC (Higher Order Component) is used to wrap a component with features boundary that waits for features to be loaded.
      </p>

      <h2 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '18px' }}>Basic Usage</h2>
      <pre style={{
        backgroundColor: 'var(--theme-background-subtle)',
        padding: '16px',
        borderRadius: '8px',
        overflow: 'auto',
        fontSize: '14px',
        lineHeight: '1.5',
        marginBottom: '16px'
      }}>
{`import { withFeaturesBoundary } from '@dailydotdev/shared/src/components';

export default withFeaturesBoundary(OnboardingPage);`}
      </pre>

      <p style={{ marginBottom: '16px' }}>
        This means that component will only be rendered if features are loaded and GrowthBook instance is ready. We can also provide a fallback component to be rendered if features are not yet ready.
      </p>

      <h2 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '18px' }}>With Fallback</h2>
      <pre style={{
        backgroundColor: 'var(--theme-background-subtle)',
        padding: '16px',
        borderRadius: '8px',
        overflow: 'auto',
        fontSize: '14px',
        lineHeight: '1.5',
        marginBottom: '16px'
      }}>
{`import { withFeaturesBoundary } from '@dailydotdev/shared/src/components';

export default withFeaturesBoundary(OnboardingPage, {
  fallback: <Loading />,
});`}
      </pre>

      <p style={{ marginBottom: '16px' }}>
        This HOC allows us to specifically target components that rely on feature flags instead of wrapping app in a provider which delays the rendering of the entire pages (and hurts performance).
      </p>

      <p style={{ marginBottom: '16px' }}>
        While some of our current pages/layouts are fully wrapped and blocked by features being loaded the rule of thumb is that we want to have these boundaries as low as possible in the component tree.
      </p>

      <h2 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '18px' }}>❌ Don't do this:</h2>
      <pre style={{
        backgroundColor: 'var(--theme-background-subtle)',
        padding: '16px',
        borderRadius: '8px',
        overflow: 'auto',
        fontSize: '14px',
        lineHeight: '1.5',
        marginBottom: '16px'
      }}>
{`const Page = () => {
  return (
    <ComponentA>
      <ComponentB>
        <ComponentC />
      </ComponentB>
    </ComponentA>
  );
};

export default withFeatureBoundary(Page);`}
      </pre>

      <h2 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '18px' }}>✅ Do this instead:</h2>
      <pre style={{
        backgroundColor: 'var(--theme-background-subtle)',
        padding: '16px',
        borderRadius: '8px',
        overflow: 'auto',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
{`const ComponentNeedsFeatures = withFeatureBoundary(ComponentC);

const Page = () => {
  return (
    <ComponentA>
      <ComponentB>
        <ComponentNeedsFeatures />
      </ComponentB>
    </ComponentA>
  );
};

export default Page;`}
      </pre>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'HOC for wrapping components that need to wait for features to load.',
      },
    },
  },
};

export const WithExperimentHOC: Story = {
  render: () => (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '16px' }}>withExperiment HOC</h1>
      <p style={{ marginBottom: '16px' }}>
        This HOC allows us to render component only when user has specific feature value eg. is in experiment without adding <code>useFeature</code> in component or parent directly. You can export or create an instance of any component with required experiment and then use it in other parts of the app.
      </p>

      <h2 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '18px' }}>Usage</h2>
      <pre style={{
        backgroundColor: 'var(--theme-background-subtle)',
        padding: '16px',
        borderRadius: '8px',
        overflow: 'auto',
        fontSize: '14px',
        lineHeight: '1.5',
        marginBottom: '16px'
      }}>
{`import { withExperiment } from '../withExperiment';

const SourceSubscribeButton = () => {
  return <button>Subscribe to source</button>;
};

const SourceSubscribeButtonExperiment = withExperiment(SourceSubscribeButton, {
  feature: feature.sourceSubscribe,
  value: SourceSubscribeExperiment.V1,
});

export { SourceSubscribeButtonExperiment as SourceSubscribeButton };`}
      </pre>

      <p style={{ marginBottom: '16px' }}>
        This allows easier targeting and usage of features only when the component actually gets rendered for the first time (which is recommended for most of our experiments). In that case, we also avoid allocating users too early by using <code>useFeature</code> in the parent component.
      </p>

      <h2 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '18px' }}>After Experiment Concludes</h2>
      <p style={{ marginBottom: '16px' }}>
        When the experiment concludes we just remove the HOC from component export and that's it.
      </p>
      <pre style={{
        backgroundColor: 'var(--theme-background-subtle)',
        padding: '16px',
        borderRadius: '8px',
        overflow: 'auto',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
{`export const SourceSubscribeButton = () => {
  return <button>Subscribe to source</button>;
};`}
      </pre>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'HOC for conditionally rendering components based on experiment values.',
      },
    },
  },
};

export const UseConditionalFeature: Story = {
  render: () => (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '16px' }}>useConditionalFeature</h1>
      <p style={{ marginBottom: '16px' }}>
        This hook is much like <code>useFeature</code> but it allows you to conditionally evaluate only when specific condition is met. This is useful when you want to load feature flag only when user is logged in or when some other condition is met.
      </p>

      <p style={{ marginBottom: '16px' }}>
        This helps to manage when user is enrolled much similarly to <code>withExperiment</code> HOC but it allows you to do it on parent component level.
      </p>

      <p style={{ marginBottom: '16px' }}>
        While evaluation condition is not met, the hook will return default feature value defined in <code>featureManagement</code> file.
      </p>

      <h2 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '18px' }}>Usage</h2>
      <pre style={{
        backgroundColor: 'var(--theme-background-subtle)',
        padding: '16px',
        borderRadius: '8px',
        overflow: 'auto',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
{`import { useConditionalFeature } from './GrowthBookProvider';

const MyComponent = () => {
  const { value: feedVersion } = useConditionalFeature({
    feature: feature.feedVersion,
    shouldEvaluate: user.isLoggedIn,
  });

  const enabled = feedVersion === FeedVersion.V2;

  if (enabled) {
    return <div>{data}</div>;
  }

  return null;
};`}
      </pre>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Hook for conditionally evaluating feature flags based on specific conditions.',
      },
    },
  },
};
