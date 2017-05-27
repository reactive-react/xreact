export interface Add<S> {
  kind: 'add'
  value: S
}
export interface Delete {
  kind: 'delete'
  id: number
}
export interface Edit<S> {
  kind: 'edit'
  todo: S
}
export interface Clear {
  kind: 'clear'
}
export interface Filter<S> {
  kind: 'filter'
  filter: (xs: S[]) => S[]
}

export interface Done {
  kind: 'done'
  index: number
}
export interface Complete {
  kind: 'complete'
}

export type Intent<S> = Add<S> | Delete | Edit<S> | Clear | Filter<S> | Done | Complete
