import type {
  ComponentClass,
  FunctionComponent,
  PropsWithChildren,
  ReactElement,
  ReactHTML,
  ReactNode,
} from 'react';
import React from 'react';

type LoaderResult<P> = ComponentClass<P> | FunctionComponent<P>;

export const DynamicParentPlaceholder = ({
  children,
}: {
  children?: ReactNode;
}): ReactElement => <>{children}</>;

export default function dynamicParent<
  P,
  T = Record<string, unknown>,
  PC extends PropsWithChildren<P> = PropsWithChildren<P>,
>(
  loader: () => Promise<LoaderResult<PC>>,
  placeholder: string | keyof ReactHTML | FunctionComponent<T>,
): React.ComponentType<PC & T & { shouldLoad: boolean }> {
  return class DynamicParent extends React.Component<
    PC & T & { shouldLoad: boolean },
    { componentClass: LoaderResult<PC> | null }
  > {
    constructor(props: PC & T & { shouldLoad: boolean }) {
      super(props);
      this.state = { componentClass: null };
    }

    async componentDidMount() {
      const { shouldLoad } = this.props;
      if (shouldLoad) {
        await this.loadComponent();
      }
    }

    async componentDidUpdate(
      prevProps: Readonly<PC & T & { shouldLoad: boolean }>,
    ) {
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
      if (componentClass) {
        return React.createElement(componentClass, this.props, children);
      }
      return React.createElement(
        placeholder as
          | keyof ReactHTML
          | FunctionComponent<PC & T & { shouldLoad: boolean }>,
        this.props,
        children,
      );
    }
  };
}
