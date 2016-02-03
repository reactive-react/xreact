import {connect} from '../../../lib/react-most'
import Most from '../../../lib/react-most'
import ReactDOM from 'react-dom'
import React from 'react'
import most from 'most'
import rest from 'rest'
const GITHUB_SEARCH_API = 'https://api.github.com/search/repositories?q=';
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
const log = x=>console.log(x)
const MostTypeNSearch = connect(function(intent$){
  let updateSink$ = intent$.filter(i=>i.type=='search')
                           .debounce(500)
                           .map(intent=>intent.value)
                           .filter(query=>query.length > 0)
                           .map(query=>GITHUB_SEARCH_API + query)
                           .flatMap(url=>most.fromPromise(
                             rest(url).then(resp=>({
                               type: 'dataUpdate',
                               value: resp.entity
                             }))))
                           .filter(i=>i.type=='dataUpdate')
                           .map(data=>JSON.parse(data.value).items)
                           .map(items=>items.slice(0,10))
                           .map(items=>state=>({results: items}))

  return {
    search: value=>({type:'search',value}),
    updateSink$,
  }
})(TypeNsearch);

ReactDOM.render(<Most>
    <MostTypeNSearch/>
</Most>, document.getElementById('app'));
