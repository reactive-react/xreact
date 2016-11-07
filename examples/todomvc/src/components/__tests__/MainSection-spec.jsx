jest.mock('rest')
import rest from 'rest'
import React from 'react'
import when from 'when'
import Intent from '../../todo.action'
import MainSection from '../MainSection.jsx'
import Most from 'react-most'
import {do$, historyStreamOf} from 'react-most/test-utils'
import TestUtils from 'react-addons-test-utils'
describe('MainSection', ()=>{
  let mainSectionWrapper, mainSection
  let response = '[{"text": "Try React Most","completed": false,"id": 0},{"text": "Give it a Star on Github","completed": false,"id": 1}]'
  beforeEach(()=>{
    rest.__return(response)
    mainSectionWrapper = TestUtils.renderIntoDocument(
      <Most>
        <MainSection history={true}/>
      </Most>
    )
    mainSection = TestUtils.findRenderedComponentWithType(mainSectionWrapper, MainSection);
  })

  describe('data sink', ()=>{
    it('should render default state', ()=>{
      expect(mainSection.state.todos).toEqual([
        {id:0, text:'Loading...dadada', done:false},
      ])
    })
    it('should get data from rest response to MainSection', ()=>{
      return historyStreamOf(mainSection).take$(1).then(state=>expect(state.todos).toEqual(JSON.parse(response)))
    })
  });

  describe('edit sink', ()=>{
    it('should update todo 0 item text', ()=>{
      do$([
        ()=>mainSection.actions.fromPromise(when(Intent.Edit({id:0, text:'hehedayo'}))),
      ])
      return historyStreamOf(mainSection).take$(1).then(state=>expect(state.todos[0]).toEqual({"id": 0, "text": "hehedayo"}))
    })
  });

  describe('clear sink', ()=> {
    it('should remove all done todos', ()=>{
      do$([
        ()=>mainSection.actions.fromPromise(when(Intent.Edit({id:0,text:'done',completed:true}))),
        ()=>mainSection.actions.fromPromise(when(Intent.Clear())),
      ])
      return historyStreamOf(mainSection)
        .take$(2)
        .then(state=>{
          expect(state.todos).toEqual([])
        })
    })
  })
});
