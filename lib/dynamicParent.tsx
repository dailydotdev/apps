import React, { ComponentClass, FunctionComponent } from 'react';

type LoaderResult<P> = ComponentClass<P> | FunctionComponent<P>;

export default function dynamicParent<P>(
  loader: () => Promise<LoaderResult<P>>,
): React.ComponentType<P> {
  return class DynamicParent extends React.Component<
    P,
    { componentClass?: LoaderResult<P> }
  > {
    constructor(props: P) {
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
      return React.createElement(React.Fragment, null, this.props.children);
    }
  };
}
