import React, { Component, PropTypes } from 'react';
import Header from './components/Header';
import MainSection from './components/MainSection';
import {render} from 'react-dom';
import Transdux from 'transdux'
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
  <Transdux>
      <App/>
  </Transdux>
  , document.getElementById('app'));
