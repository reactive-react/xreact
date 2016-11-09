import React, { Component, PropTypes } from 'react';
import Header from './components/Header';
import MainSection from './components/MainSection';
import {render} from 'react-dom';
import Most from '../../../lib/react-most'

const App = (props) => {
  return (
    <div>
      <Header />
      <MainSection />
    </div>
  )
}

render(
  <Most>
    <App/>
  </Most>
  , document.getElementById('app'));
