import React, {
  ComponentClass,
  FunctionComponent,
  PropsWithChildren,
  ReactHTML,
  ReactNode,
} from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';

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
    { componentClass?: LoaderResult<PC> }
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
      if (componentClass) {
        return React.createElement(componentClass, this.props, children);
      }
      return React.createElement(placeholder, this.props, children);
    }
  };
}
