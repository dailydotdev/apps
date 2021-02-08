import React, { ComponentClass, FunctionComponent, ReactHTML } from 'react';

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

    async loadComponent() {
      const componentClass = await loader();
      this.setState({ componentClass });
    }

    async componentDidMount() {
      if (this.props.shouldLoad) {
        await this.loadComponent();
      }
    }

    async componentDidUpdate(prevProps) {
      if (!prevProps.shouldLoad && this.props.shouldLoad) {
        await this.loadComponent();
      }
    }

    render() {
      const { componentClass } = this.state;
      if (componentClass) {
        return React.createElement(
          componentClass,
          this.props,
          this.props.children,
        );
      }
      return React.createElement(placeholder, this.props, this.props.children);
    }
  };
}
