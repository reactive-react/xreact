/// <reference types="react" />
import * as React from 'react';
import { HKTS } from './xs';
import { Plan, XcomponentClass, XProps, ContextEngine, XREACT_ENGINE } from './interfaces';
export { XREACT_ENGINE };
export declare type XOrReactComponent<E extends HKTS, I, S> = XcomponentClass<E, I, S> | React.ComponentClass<any> | React.SFC<any>;
export declare function x<E extends HKTS, I, S>(main: Plan<E, I, S>, opts?: {
    history: boolean;
}): (WrappedComponent: XOrReactComponent<E, I, S>) => XcomponentClass<E, I, S>;
export default class X<E extends HKTS> extends React.PureComponent<XProps<E>, {}> {
    static childContextTypes: {
        [x: string]: any;
    };
    getChildContext<I, H>(): ContextEngine<E, I, H>;
    render(): React.ReactElement<any>;
}
