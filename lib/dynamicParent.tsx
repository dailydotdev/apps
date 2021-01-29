import React, { ComponentClass, FunctionComponent, ReactHTML } from 'react';

type LoaderResult<P> = ComponentClass<P> | FunctionComponent<P>;

export default function dynamicParent<P, T = Record<string, unknown>>(
  loader: () => Promise<LoaderResult<P>>,
  placeholder: string | keyof ReactHTML | FunctionComponent<T>,
): React.ComponentType<P & T> {
  return class DynamicParent extends React.Component<
    P & T,
    { componentClass?: LoaderResult<P> }
  > {
    constructor(props: P & T) {
      super(props);
      this.state = { componentClass: null };
    }

    async componentDidMount() {
      const componentClass = await loader();
      this.setState({ componentClass });
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
