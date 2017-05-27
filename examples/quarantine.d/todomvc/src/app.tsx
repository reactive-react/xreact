import * as React from 'react';
import Header from './components/Header';
import MainSection from './components/MainSection';
import { render } from 'react-dom';
import Most from 'react-most'

const App = () => {
    return (
        <div>
            <Header />
            <MainSection />
        </div>
    )
}

render(
    <Most>
        <App />
    </Most>
    , document.getElementById('app'));
