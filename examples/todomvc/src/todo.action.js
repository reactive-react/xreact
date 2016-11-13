import _ from 'lodash'
import Type from 'union-type'
export default Type({
  Add: [Object],
  Delete: [Number],
  Edit: [Object, Number],
  Editing: [Number],
  Clear: [],
  Filter: [Function],
  Done: [Number],
  Complete: [Number],
  Search: [String],
})

export function addTodo(intent$){
  return  intent$.filter(x=>x.type=='add')
    .map(
      todo=>state=>({
        todos: _.concat(state.todos,_.assign(todo,{
          id: _.map(state.todos,'id').sort().pop()+1
        })),
        filter: _.identity,
      })
    );
};
export function deleteTodo(intent$){
  return intent$.filter(x=>x.type=='remove')
    .map(intent=>(
      state=>({
        todos:state.todos.filter(todo=>todo.id!=intent.id)
      })
    ))
}
