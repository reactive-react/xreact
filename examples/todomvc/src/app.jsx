import React, { Component, PropTypes } from 'react';
import Header from './components/Header';
import MainSection from './components/MainSection';
import {render} from 'react-dom';
import Mostux from 'mostux'
class App extends Component {
  render(){
    return (
      <div>
          <Header />
          <MainSection />
      </div>
    )
  }
}

render(
  <Mostux>
      <App/>
  </Mostux>
  , document.getElementById('app'));
