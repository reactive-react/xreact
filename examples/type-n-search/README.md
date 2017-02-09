# Github Repo Type N Search Example

https://reactive-react.github.io/react-most/examples/type-n-search/public/

## install
```sh
npm install
npm run build
npm start
```

## Code Walk Through

it's really simple example(only 40 LOC) that reactively search github repo according to your query

0. create normal React Component

  ```js
    const TypeNsearch = (props)=>{
      let {search} = props.actions
      return <div>
        <input onChange={e=>search(e.target.value)}></input>
        <ul>
          {props.results&&props.results.map(item=>{
            return <li key={item.id}><a href={item.html_url}>{item.full_name} ({item.stargazers_count})</a></li>
      })}
        </ul>
      </div>
    }
  ```

1. HOC(Higher Order Component)
  using `connect` to create a HOC over TypeNsearch

  ```js
  const MostTypeNSearch = connect(DATAFLOW)(TypeNsearch)
  ```
2. Compose Dataflow
  you see the place holder `DATAFLOW`, now we gonna fill in the real data flow how we enable the reactive action of our Component
  1. filter out stream only with `intent.type` of 'search'

    ```js
    function(intent$){
      let updateSink$ = intent$.filter(i=>i.type=='search')
                           .debounce(500)
      ...
    ```
    using `debounce` will transform the stream to stream which only bouncing at certain time point
    ```
    --冷-冷笑--冷笑话-->

    --------冷笑话-->
    ```
  2. compose a VALID query URL
  
    ```js
    ...
    .map(intent=>intent.value)
    .filter(query=>query.length > 0)
    .map(query=>GITHUB_SEARCH_API + query)
    ...
    ```
  3. flatMap the Response to our stream
    ```js
    .flatMap(url=>most.fromPromise(
                             rest(url).then(resp=>({
                               type: 'dataUpdate',
                               value: resp.entity
                             }))))
    ```

    `flatMap` is simply just `map` and then `flat`

    > just pretent one `-` as one sec

    ```
    intentStream --urlA---urlB--->
    rest(urlA)   -------respA---->
    rest(urlB)   ---------respB-->
    flatMap(rest)-------respA--respB--->
    ```
    4. model
    now our intent stream become a data stream, let's make it a modle stream.
    ``` js
    .filter(i=>i.type=='dataUpdate')
    .map(data=>JSON.parse(data.value).items)
    .map(items=>items.slice(0,10))
    ```
    parse it to JS Object and only get the first ten results
    5. create state transforming stream
    ```
    .map(items=>state=>({results: items}))
    ```

    ```
    modleStream ---mA---mB--->
    stateStream ---state=>({results:mA})---state=>({results:mB})--->
    ```

3. return `actions` and `sinks`
  ```js
  return {
    search: value=>({type:'search',value}),
    updateSink$,
  }
  ```
  return `search` then you can use `props.actions.search` in your Component

  return `updateSink$` then it can be appled to HOC's state, HOC will pass the state to your Component as props
