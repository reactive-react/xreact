jest.mock('rest')
import rest from 'rest'
import React  from  'react'
import when  from  'when'
import Intent  from  '../../todo.action'
import MainSection  from  '../MainSection.jsx'
import Footer, {FILTER_FUNC}  from  '../Footer.jsx'
import TodoItem  from  '../TodoItem.jsx'
import Most  from  '../../../../../lib/react-most'
import {do$, historyStreamOf}  from  '../../../../../lib/test-utils'
import TestUtils  from  'react-addons-test-utils'

describe('MainSection', ()=>{
  const RESPONSE = '[{"text": "Try React Most","done": false,"id": 0},{"text": "Give it a Star on Github","done": false,"id": 1}]'
  beforeEach(()=>{
    rest.__return(RESPONSE)
  })
  describe('View', ()=> {
    const defaultTodos = [
      {id:0, text:'Loading...dadada', done:false},
      {id:1, text:'dadada', done:false},
      {id:2, text:'yay', done:true},
    ]
    it('should show correct counts on footer', ()=> {
      let mainSection = TestUtils.renderIntoDocument(
        <Most>
          <MainSection
              todos={defaultTodos}
              filter={_=>_}
          />
        </Most>
      )
      let footer = TestUtils.findRenderedComponentWithType(mainSection, Footer);
      expect(footer.props.completedCount).toBe(1)
      expect(footer.props.activeCount).toBe(2)
    })

    it('should show only active todos', ()=> {
      let mainSection = TestUtils.renderIntoDocument(
        <Most>
          <MainSection
              todos={defaultTodos}
              filter={FILTER_FUNC['SHOW_ACTIVE']}
          />
        </Most>
      )
      let todoItems = TestUtils.scryRenderedComponentsWithType(mainSection, TodoItem);
      expect(todoItems.map(item=>item.props.todo.id)).toEqual(
        [0,1])
    })

    it('should show only done todos', ()=> {
      let mainSection = TestUtils.renderIntoDocument(
        <Most>
          <MainSection
              todos={defaultTodos}
              filter={FILTER_FUNC['SHOW_COMPLETED']}
          />
        </Most>
      )
      let todoItems = TestUtils.scryRenderedComponentsWithType(mainSection, TodoItem);
      expect(todoItems.map(item=>item.props.todo.id)).toEqual(
        [2])
    })
  })

  describe('Behavior', ()=> {
    let mainSectionWrapper, mainSection, send
    beforeEach(()=>{
      mainSectionWrapper = TestUtils.renderIntoDocument(
        <Most>
          <MainSection history={true}/>
        </Most>
      )
      mainSection = TestUtils.findRenderedComponentWithType(mainSectionWrapper, MainSection);
      send = intent => mainSection.actions.fromPromise(when(intent))
    })
    describe('data sink', ()=>{
      it('should render default state', ()=>{
        expect(mainSection.state.todos).toEqual([
          {id:0, text:'Loading...dadada', done:false},
        ])
      })
      it('should get data from  rest response to MainSection', ()=>{
        return historyStreamOf(mainSection).take$(1).then(state=>expect(state.todos).toEqual(JSON.parse(RESPONSE)))
      })
    });

    describe('edit', ()=>{
      it('should update todo id 0 item text', ()=>{
        do$([
          ()=>send(Intent.Edit({id:0, text:'hehedayo'}, 0)),
        ])
        return historyStreamOf(mainSection).take$(2).then(state=>expect(state.todos[0]).toEqual({"id": 0, "text": "hehedayo"}))
      })
    });

    describe('clear', ()=> {
      it('should remove all done todos', ()=>{
        do$([
          ()=>send(Intent.Edit({id:0,text:'done',done:true}, 0)),
          ()=>send(Intent.Clear()),
        ])
        return historyStreamOf(mainSection)
          .take$(3)
          .then(state=>{
            expect(state.todos).toEqual([{"done": false, "id": 1, "text": "Give it a Star on Github"}])
          })
      })
    })

    describe('delete', ()=> {
      it('should remove todos id 0', ()=>{
        do$([
          ()=>send(Intent.Delete(0)),
        ])
        return historyStreamOf(mainSection)
          .take$(2)
          .then(state=>{
            expect(state.todos).toEqual([{"done": false, "id": 1, "text": "Give it a Star on Github"}])
          })
      })
    })

    describe('done', ()=> {
      it('should complete todo 0', ()=>{
        do$([
          ()=>send(Intent.Done(0)),
        ])
        return historyStreamOf(mainSection)
          .take$(2)
          .then(state=>{
            expect(state.todos).toEqual([{"done": true, "id": 0, "text": "Try React Most"}, {"done": false, "id": 1, "text": "Give it a Star on Github"}])
          })
      })
    })

    describe('click filter completed', ()=> {
      it('should only use SHOW_COMPLETED filter', ()=>{
        do$([
          ()=>send(Intent.Edit({id:0, done:true}, 0)),
          ()=>send(Intent.Filter(FILTER_FUNC['SHOW_COMPLETED'])),
        ])
        return historyStreamOf(mainSection)
          .take$(3)
          .then(state=>{
            expect(state.filter).toEqual(FILTER_FUNC['SHOW_COMPLETED'])
          })
      })
    })
  })
});
