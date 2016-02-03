import _ from 'lodash'

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
export function completeTodo(intent$){
  return intent$.filter(x=>x.type=='done')
    .map(intent=>(
      state=>({
        todos: state.todos.map(todo=>{
          if(todo.id==intent.id){
            todo.done =! todo.done;
            return todo;
          }
          return todo;
        })
      })))
}
