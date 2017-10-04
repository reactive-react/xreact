export interface _<A> { }
export type HKT = keyof _<any>

export type $<F extends HKT, A> = _<A>[F]
