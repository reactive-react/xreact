interface Add<S> {
  kind: 'add'
  todo: S
}
interface Delete {
  kind: 'delete'
  id: number
}
interface Edit<S> {
  kind: 'edit'
  todo: S
}
interface Clear {
  kind: 'clear'
}
interface Filter<S> {
  kind: 'filter'
  filter: (xs: S[]) => S[]
}

interface Done {
  kind: 'done'
}
interface Complete {
  kind: 'complete'
}

export type Intent<S> = Add<S> | Delete | Edit<S> | Clear | Filter<S> | Done | Complete
