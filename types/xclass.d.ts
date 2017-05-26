/// <reference types="react" />
import * as React from 'react';
import { Plan, XcomponentClass } from './interfaces';
import { HKTS } from './xs';
export declare const CONTEXT_TYPE: {
    [x: string]: any;
};
export declare function extendXComponentClass<E extends HKTS, I, S>(WrappedComponent: XcomponentClass<E, I, S>, main: Plan<E, I, S>): XcomponentClass<E, I, S>;
export declare function genXComponentClass<E extends HKTS, I, S>(WrappedComponent: React.SFC<any> | React.ComponentClass<any>, main: Plan<E, I, S>, opts?: any): XcomponentClass<E, I, S>;
