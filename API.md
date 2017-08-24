## connect

```
connect:: (Stream -> {sink$: Stream, actions: Map String Function}) -> ReactClass -> ReactClass
connect:: (Stream -> Object -> {sink$: Stream, actions: Map String Function}) -> ReactClass -> ReactClass
connect(dataFlow[, options])
```


`connect` mean to connect some behavior to a React Component, you can think it as a HOC wrapper or decorator,
### return `ReactClass -> ReactClass`
it return a function map a React Class to a new React Class, with all behavior define in dataFlow

```js
import {connect} from 'react-most'

class TodoItem extends React.Component {
  ...
}
export default connect(function(intent$){
 let sink$ = intent$.filter(...).map(....)
 return {sink$}
})(TodoItem)
```

### parameter dataFlow `Stream -> Object -> {sink$: Stream, actions: {name: Function}}`

data flow is user define flow or behavior for intent stream, must return a object contains `actions` or `sinks`

```js
let RxCounter = connect(function(intent$){
  let addSink$ = intent$.filter(x=>x.type=='add').map(({increment})=>state=>({value: state.value+increment}))
  return {
    add: increment=>({type: 'add', increment}),   // <-- define a action, Counter can trigger a action by invoke props.actions.add()
    addSink$, // <-- define a behavior when someone intent to trigger a "add" action
  }
})(Counter);
```
a sink$ must be a state transform stream, in this case it's Stream contains `state=>({value: state.value+increment})`

you can get current props from state transformer as well
```js
(state, props)=>({value: state.value+props.increment})
```

#### parameters
- parameter `intent$` will be given by [Most Provider](#Most)
- parameter `initProps` is the prop at the time component is created, this maybe different from `props` parameter in transformer function, which is the props when the transformer function is called.

### parameter: options
options that you can give to the connect function:
1. [history](#history)

## Most
`Most` provider provide a intent$ stream container, all component inside the provider will share the same intent$ stream.
```js
import Most from 'react-most'
<Most>
  <Counter />
</Most>
```

## History and Time travel [experimental]
```js
connect(intent$=>[awesome flow], {history:true})(App)
```

or

```js
<App history={true}>
</App>
```
once you connect history to App, you have two extract methods from `props`

1. `props.history.backward`
2. `props.history.forward`



### Reactive engine [experimental]
if you are Rx user, optionally you can pass a `engine` props into `Most`.
```js
import Most from 'react-most'
<Most engine={function rxify() {
  let addToIntentStream = subject.onNext;
  let intentStream = new Rx.Subject();

  function flatObserve(intentSinks, f){
    return Rx.Observable.from(intentSinks).mergeAll().observe(f);
  }
  return {intentStream, addToIntentStream, flatObserve}
}}>
  <Counter />
</Most>
```
other reactive lib user can easily proivde you favor engine by simply provide these 3 things:

1. `intentStream`: a Steam contains intents
2. `historyStream`: a Stream contains history
3. `flatObserve(sinks,func)`: flat Stream of Stream `sinks`, and observe with `func`.
