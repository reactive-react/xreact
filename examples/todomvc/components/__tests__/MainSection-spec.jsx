jest.mock('rest')
import rest from 'rest'
import React  from  'react'
import when  from  'when'
import Intent  from  '../../intent'
import MainSection  from  '../MainSection.jsx'
import Footer, {FILTER_FUNC}  from  '../Footer.jsx'
import TodoItem  from  '../TodoItem.jsx'
import Most  from  'react-most'
import {stateStreamOf, stateHistoryOf,
        intentStreamOf, intentHistoryOf,
        run, dispatch,
        Engine } from 'react-most-spec';
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

    describe('data sink', ()=>{
      beforeEach(()=>{
        mainSectionWrapper = TestUtils.renderIntoDocument(
          <Most>
            <MainSection history={true}/>
          </Most>
        )
        mainSection = TestUtils.findRenderedComponentWithType(mainSectionWrapper, MainSection);
      })
      it('should render default state', ()=>{
        expect(mainSection.state.todos).toEqual([
          {id:0, text:'Loading...dadada', done:false},
        ])
      })
      it('should get data from  rest response to MainSection', ()=>{
        return run(stateStreamOf(mainSection),
                   dispatch([], mainSection),
                   [
                     state=>expect(state.todos).toEqual(JSON.parse(RESPONSE))
                   ])
      })
    });

    describe('sync', ()=>{
      beforeEach(()=>{
        mainSectionWrapper = TestUtils.renderIntoDocument(
          <Most engine={Engine}>
            <MainSection history={true}/>
          </Most>
        )
        mainSection = TestUtils.findRenderedComponentWithType(mainSectionWrapper, MainSection);
      })
      describe('edit', ()=>{
        it('should update todo id 0 item text', ()=>{
          return dispatch([
            Intent.Edit({id:0, text:'heheda0'}, 0),
            Intent.Done(0),
            Intent.Clear(),
            Intent.Add({text:'heheda1'}),
            Intent.Delete(0),
            Intent.Filter(FILTER_FUNC['SHOW_COMPLETED']),
          ], mainSection).then(()=>{
            let state = stateHistoryOf(mainSection)
            expect(state[0].todos[0]).toEqual({"id": 0, "text": "heheda0"})
            expect(state[1].todos[0]).toEqual({"id": 0, "text": "heheda0", "done": true})
            expect(state[2].todos).toEqual([])
            expect(state[3].todos[0]).toEqual({"id": 0, "text": "heheda1"})
            expect(state[4].todos).toEqual([])
            expect(state[5].filter).toEqual(FILTER_FUNC['SHOW_COMPLETED'])
          })
        })
      });
    })
  })
});
