/// <reference types="react" />
import * as React from 'react';
import { Plan, ConnectClass } from './interfaces';
import { Engine } from './engine/most';
export declare const REACT_MOST_ENGINE = "@@reactive-react/react-most.engine";
export declare type ConnectOrReactComponent<I, S> = ConnectClass<I, S> | React.ComponentClass<any>;
export declare function connect<I, S>(main: Plan<I, S>, opts?: {
    history: boolean;
}): (WrappedComponent: ConnectOrReactComponent<I, S>) => ConnectClass<I, S>;
export interface MostProps<T, S> {
    engine?: new () => Engine<T, S>;
}
export interface MostEngine<I, H> {
    [x: string]: Engine<I, H>;
}
export default class Most<I, H, S> extends React.PureComponent<MostProps<I, H>, S> {
    static childContextTypes: {
        [x: string]: any;
    };
    getChildContext(): MostEngine<I, H>;
    render(): React.ReactElement<any>;
}
