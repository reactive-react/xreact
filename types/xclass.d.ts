/// <reference types="react" />
import * as React from 'react';
import { Plan, ConnectClass } from './interfaces';
import { HKTS } from './engine';
export declare const CONTEXT_TYPE: {
    [x: string]: any;
};
export declare function genNodeClass<E extends HKTS, I, S>(WrappedComponent: ConnectClass<E, I, S>, main: Plan<E, I, S>): ConnectClass<E, I, S>;
export declare function genLeafClass<E extends HKTS, I, S>(WrappedComponent: React.SFC<any> | React.ComponentClass<any>, main: Plan<E, I, S>, opts?: any): ConnectClass<E, I, S>;
