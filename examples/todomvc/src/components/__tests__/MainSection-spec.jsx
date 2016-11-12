jest.mock('rest')
import rest from 'rest'
import React  from  'react'
import when  from  'when'
import Intent  from  '../../todo.action'
import MainSection  from  '../MainSection.jsx'
import Footer  from  '../Footer.jsx'
import Most  from  '../../../../../lib/react-most'
import {do$, historyStreamOf}  from  '../../../../../lib/test-utils'
import TestUtils  from  'react-addons-test-utils'
describe('MainSection', ()=>{

  describe('display', ()=> {
    it('correct counts on footer', ()=> {
      let mainSection = TestUtils.renderIntoDocument(
        <Most>
          <MainSection
              todos={[
                {id:0, text:'Loading...dadada', done:false},
                {id:1, text:'dadada', done:false},
              ]}
              filter={_=>_}
          />
        </Most>
      )
      let footer = TestUtils.findRenderedComponentWithType(mainSection, Footer);
      expect(footer.props.completedCount).toBe(0)
      expect(footer.props.activeCount).toBe(2)
    })
  })

  describe('behavior', ()=> {
    let mainSectionWrapper, mainSection, send
    let response = '[{"text": "Try React Most","completed": false,"id": 0},{"text": "Give it a Star on Github","completed": false,"id": 1}]'
    beforeEach(()=>{
      rest.__return(response)
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
      it('should get data  from  rest response to MainSection', ()=>{
        return historyStreamOf(mainSection).take$(1).then(state=>expect(state.todos).toEqual(JSON.parse(response)))
      })
    });

    describe('edit sink', ()=>{
      it('should update todo 0 item text', ()=>{
        do$([
          ()=>send(Intent.Edit({id:0, text:'hehedayo'})),
        ])
        return historyStreamOf(mainSection).take$(2).then(state=>expect(state.todos[0]).toEqual({"id": 0, "text": "hehedayo"}))
      })
    });

    describe('clear sink', ()=> {
      it('should remove all done todos', ()=>{
        do$([
          ()=>send(Intent.Edit({id:0,text:'done',completed:true})),
          ()=>send(Intent.Clear()),
        ])
        return historyStreamOf(mainSection)
          .take$(3)
          .then(state=>{
            expect(state.todos).toEqual([{"completed": false, "id": 1, "text": "Give it a Star on Github"}])
          })
      })
    })
  })
});
