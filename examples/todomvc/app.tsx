import * as React from 'react';
import X from 'xreact'
import * as MOST from 'xreact/lib/xs/most'
import Header from './components/Header';
import Footer from './components/Footer';
import MainSection from './components/MainSection';
import { render } from 'react-dom';

const App = () => (
  <div>
    <Header />
    <MainSection />
  </div>
)

render(
  <X x={MOST}>
    <App />
  </X>
  , document.getElementById('app'));
