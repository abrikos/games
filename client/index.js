import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import AppHook from "client/AppHook";

/*
ReactDOM.render(<Application />, document.getElementById('root'));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
*/

const render = (Component) => {
    ReactDOM.render(
        <AppHook/>,

        document.getElementById('root')
    );
    serviceWorker.unregister();
};

const init = async () => {
    render();
};

init();
