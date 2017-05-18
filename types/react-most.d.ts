/// <reference types="react" />
import * as React from 'react';
import { REACT_MOST_ENGINE } from './classGenerator';
import { Plan, ConnectClass, MostProps, ContextEngine } from './interfaces';
export { REACT_MOST_ENGINE };
export declare type ConnectOrReactComponent<I, S> = ConnectClass<I, S> | React.ComponentClass<any> | React.SFC<any>;
export declare function connect<I, S>(main: Plan<I, S>, opts?: {
    history: boolean;
}): (WrappedComponent: ConnectOrReactComponent<I, S>) => ConnectClass<I, S>;
export default class Most<I, H, S> extends React.PureComponent<MostProps<I, H>, S> {
    static childContextTypes: {
        [x: string]: any;
    };
    getChildContext(): ContextEngine<I, H>;
    render(): React.ReactElement<any>;
}
