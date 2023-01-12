import React, { ComponentClass, FunctionComponent, ReactHTML } from 'react';
import { isTesting } from './constants';

type LoaderResult<P> = ComponentClass<P> | FunctionComponent<P>;

export default function dynamicParent<P, T = Record<string, unknown>>(
  loader: () => Promise<LoaderResult<P>>,
  placeholder: string | keyof ReactHTML | FunctionComponent<T>,
): React.ComponentType<P & T & { shouldLoad: boolean }> {
  return class DynamicParent extends React.Component<
    P & T & { shouldLoad: boolean },
    { componentClass?: LoaderResult<P> }
  > {
    constructor(props: P & T & { shouldLoad: boolean }) {
      super(props);
      this.state = { componentClass: null };
    }

    async componentDidMount() {
      const { shouldLoad } = this.props;
      if (shouldLoad || isTesting) {
        await this.loadComponent();
      }
    }

    async componentDidUpdate(prevProps) {
      const { shouldLoad } = this.props;
      if (!prevProps.shouldLoad && shouldLoad) {
        await this.loadComponent();
      }
    }

    async loadComponent() {
      const componentClass = await loader();
      this.setState({ componentClass });
    }

    render() {
      const { componentClass } = this.state;
      const { children } = this.props;
      if (isTesting) {
        return componentClass
          ? React.createElement(componentClass, this.props, children)
          : null;
      }

      if (componentClass) {
        return React.createElement(componentClass, this.props, children);
      }
      return React.createElement(placeholder, this.props, children);
    }
  };
}
