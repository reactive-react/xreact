import {map, filter, comp, mapcat} from 'transducers-js'
import Most,{connect} from 'react-most'
import ReactDOM from 'react-dom'
import React from 'react'
import * as most from 'most'
import rest from 'rest'
const GITHUB_SEARCH_API = 'https://api.github.com/search/repositories?q=';
const TypeNsearch = (props)=>{
  let {search} = props.actions
  let error = props.error||{}
  return <div>
    <input onChange={e=>search(e.target.value)}></input>
    <span className={"red " + error.className}>{error.message}</span>
    <ul>
      {props.results.map(item=>{
        return <li key={item.id}><a href={item.html_url}>{item.full_name} ({item.stargazers_count})</a></li>
  })}
    </ul>
  </div>
}

TypeNsearch.defaultProps = {
  results: []
}
const sendApiRequest = comp(
  map(i=>i.value),
  filter(q=>q.length>0),
  map(q=>GITHUB_SEARCH_API + q),
  map(url=>rest(url).then(resp=>({
    type: 'dataUpdate',
    value: resp.entity
  })))
);

const generateStateFromResp = comp(
  filter(i=>i.type=='dataUpdate'),
  map(data=>JSON.parse(data.value).items),
  map(items=>items.slice(0,10)),
  map(items=>state=>({results: items}))
)

const log = x=>console.log(x)
const MostTypeNSearch = connect(function(intent$){
  let updateSink$ = intent$.filter(i=>i.type=='search')
                           .debounce(500)
                           .transduce(sendApiRequest)
                           .flatMap(most.fromPromise)
                           .transduce(generateStateFromResp)
                           .flatMapError(error=>{
                             console.log('[ERROR]:', error);
                             return most.of({message:error.error,className:'display'})
                                        .merge(most.of({className:'hidden'}).delay(3000))
                                        .map(error=>state=>({error}))
                           })

  return {
    actions:{
      search: value=>({type:'search',value}),
    },
    update$: updateSink$,
  }
})(TypeNsearch);

ReactDOM.render(<Most>
    <MostTypeNSearch/>
</Most>, document.getElementById('app'));
