import React, {useState} from "react";
import Layout from "client/views/Layout";
import API from "client/API";
import {navigate} from "hookrouter";
import NotFound from "client/service/notfound";
import AccessDenied from "client/service/access-denied";
import ServerError from "client/service/server-error";
import cookieParser from 'cookie';

export default function App() {

    const [alert, setAlert] = useState({isOpen: false});
    const [authenticatedUser, setAuth] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorPage, setErrorPage] = useState(false);

    let websocket;

    //let wsOnMessage;

    function startWebSocket() {
        websocket = new WebSocket(`ws://${window.location.hostname}/ws`);
        websocket.onopen = function () {
            console.log('WS connected!');
        };
        //if (wsOnMessage) websocket.onmessage = wsOnMessage;
        websocket.onclose = function () {
            //console.log('WS closed!');
            //reconnect now
            checkWebsocket();
        };
    }

    function checkWebsocket() {
        if (!websocket || websocket.readyState === 3) startWebSocket();
    }

    startWebSocket();
    setInterval(checkWebsocket, 5000);


    const params = {
        cookies: cookieParser.parse(document.cookie),
        websocket,
        errorPage,
        loading,
        authenticatedUser,
        alert,
        onWsMessage(func) {
            //wsOnMessage = func;
            websocket.onmessage = func;
        },
        ws(data) {
            if (websocket.readyState !== 1) {
                websocket = new WebSocket(`ws://${window.location.hostname}/ws`);
            }
            websocket.send(JSON.stringify(data))
        },

        setAlert: (response) => {
            const color = response.error ? 'danger' : 'success';
            setAlert({isOpen: true, children: response.message, color})
        },

        clearAlert: () => {
            setAlert({isOpen: false})
        },

        async api(path, data) {
            //setIsLoading(true);
            const res = await API.postData(path, data);
            //setIsLoading(false);
            if (!res.error) return res;
            this.clearAlert();
            if (res.error) {
                //console.error(res)
                res.message += ': ' + path
                this.setAlert(res);
                throw res;
            }
            return res;
        },

        onError(res) {
            switch (res.error) {
                case 403:
                    setErrorPage(<AccessDenied/>);
                    break;
                case 404:
                    setErrorPage(<NotFound/>);
                    break;
                default:
                    setErrorPage(<ServerError {...res}/>);
                    break;
            }
        },

        isLoading(on) {
            setLoading(on)
        },

        async checkAuth() {
            const user = await API.postData('/isAuth');
            if (!user.error) setAuth(user);
        },

        logOut: () => {
            API.postData('/logout')
                .then(res => {
                    if (res.ok) setAuth(false);
                    navigate('/login');
                })
        },

        formToObject(form) {
            const array = Array.from(form.elements).filter(e=>!!e.name)

            const obj = {};
            for (const a of array) {
                obj[a.name] =  parseFloat(a.value) || a.value
                //if (a.name === 'name' && !a.value) errors.push(a.name)
            }
            return obj
        }
    };


    return (
        <div className="App">
            <Layout {...params}/>
        </div>
    );
}
