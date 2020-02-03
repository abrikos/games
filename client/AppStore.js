import React, {useEffect, useState} from "react";
import Layout from "client/views/Layout";
import API from "client/API";
import {navigate} from "hookrouter";
import NotFound from "client/service/notfound";
import AccessDenied from "client/service/access-denied";
import ServerError from "client/service/server-error";
import cookieParser from 'cookie';

export default function App() {

    const [alert, setAlert] = useState({isOpen: false});
    const [authenticatedUser, setAuthUser] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorPage, setErrorPage] = useState(false);
    const [message, setMessage] = useState({});

    let websocket;

    //let wsOnMessage;

    function startWebSocket() {
        websocket = new WebSocket(`ws://${window.location.hostname}/ws`);
        websocket.onopen = function () {
            console.log('WS connected!');
        };
        //if (wsOnMessage) websocket.onmessage = wsOnMessage;
        websocket.onmessage = event => {
            setMessage(JSON.parse(event.data))
        };

        websocket.onclose = function () {
            //console.log('WS closed!');
            //reconnect now
            checkWebsocket();
        };
    }

    function checkWebsocket() {
        if (!websocket || websocket.readyState === 3) startWebSocket();
    }

    function getUser(){
        API.postData('/user/authenticated')
            .then(setAuthUser);
    }

    useEffect(() => {
        startWebSocket();
        setInterval(checkWebsocket, 1000);
        getUser();
    }, [])



    const params = {
        cookies: cookieParser.parse(document.cookie),
        message,
        errorPage,
        loading,
        authenticatedUser,
        alert,
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

        clearMessage: () => setMessage({}),

        clearAlert: () => setAlert({isOpen: false}),

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

        async apiAuth(path, data){
            return new Promise((resolve,reject)=>{
                this.api(path, data)
                    .then(res=>{
                        setAuthUser(true)
                        return resolve(res)
                    })
                    .catch(err=>{
                        console.log(err)
                        if(err.response.status===401) return document.location.href = '/api/not-logged';
                    })
            })
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
            //const user = await API.postData('/isAuth');
            //if (!user.error) setAuthUser(user);
        },

        logOut: () => {
            API.postData('/logout')
                .then(res => {
                    if (res.ok) setAuthUser(false);
                    navigate('/login');
                })
        },

        formToObject(form) {
            const array = Array.from(form.elements).filter(e => !!e.name)

            const obj = {};
            for (const a of array) {
                obj[a.name] = parseFloat(a.value) || a.value
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
