const actions = {
  complete(msg, state){
    return {
      todos:state.todos.map(todo=>{
        if(todo.id==msg.id)
          todo.completed = !todo.completed
        return todo
      })
    }
  },
  show(msg,state){
    switch(msg){
    case('SHOW_ALL'):
      return {filter: _=>_}
    case('SHOW_ACTIVE'):
      return {filter: todos=>todos.filter(todo=>!todo.completed)}
    case('SHOW_COMPLETED'):
      return {filter: todos=>todos.filter(todo=>todo.completed)}
    }
  },
  clear(msg,state){
    return {
      todos: state.todos.filter(todo=>todo.completed==false)
    }
  },
  add(msg, state){
    let todos = state.todos
    todos.unshift({id:todos.length+1, text:msg, completed:false})
    return {
      todos: todos
    }
  },
  edit(msg, state){
    return {
      todos: state.todos.map(todo=>{
        if(todo.id == msg.id){todo.text=msg.text}
        return todo;
      })
    } 
  },
  delete(msg, state){
    return {
      todos: state.todos.filter(todo=>{
        return todo.id!=msg.id
      })
    }
  }
}
export default actions
