import * as _ from 'lodash'

function genAction(name, action, stream){
  return {
    [name]: action,
    [name+'Sink$']: stream,
  }
}
export function addTodo(intent$){
  return genAction('add',
      todo=>_.assign({type:'add'},todo),
      intent$.filter(x=>x.type=='add').map(
        todo=>state=>({
          todos: _.concat(state.todos,_.assign(todo,{
            id: _.map(state.todos,'id').sort().pop()+1
          })),
          filter: _.identity,
        })
      ).delay(500))
};
export function deleteTodo(intent$){
  return genAction('remove',
                   (id)=>({type:'remove', id}),
                   intent$.filter(x=>x.type=='remove')
                   .map(intent=>(
                     state=>({
                       todos:state.todos.filter(todo=>todo.id!=intent.id)
                     })
                   )))
}
export function completeTodo(intent$){
  return genAction('don',
    (id)=>({type:'done', id}),
    intent$.filter(x=>x.type=='done')
    .map(intent=>(
      state=>({
        todos: state.todos.map(todo=>{
          if(todo.id==intent.id){
            todo.done =! todo.done;
            return todo;
          }
          return todo;
        })
      }))))
}
