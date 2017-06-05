export interface Todo {
  id: number
  text: string
  done: boolean
}
export interface MainSectionProps {
  todos: Todo[]
  filter: (todos: Todo[]) => Todo[]
}
