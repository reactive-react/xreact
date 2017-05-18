/// <reference types="react" />
import * as React from 'react';
import { Plan, ConnectClass } from './interfaces';
export declare const REACT_MOST_ENGINE = "@@reactive-react/react-most.engine";
export declare const CONTEXT_TYPE: {
    [x: string]: any;
};
export declare function genNodeClass<I, S>(WrappedComponent: ConnectClass<I, S>, main: Plan<I, S>): ConnectClass<I, S>;
export declare function genLeafClass<I, S>(WrappedComponent: React.SFC<any> | React.ComponentClass<any>, main: Plan<I, S>, opts?: any): ConnectClass<I, S>;
