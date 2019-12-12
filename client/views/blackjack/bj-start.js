import React, {useEffect, useState} from 'react';
import * as Cards from "./cards/index"

import {t} from "client/components/Translator"
import {isMoment} from "moment";

export default function BJStart(props) {
    const [x, setX] = useState({})
    const suits=['S','C','D','H'];
    const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

    props.onWsMessage(onWsMessage);

    useEffect(()=>{
        console.log('cookie',props.cookies._ym_uid)
        props.api('/test')
    },[])

    function onWsMessage(event) {
        console.log(event.data)
        setX(JSON.parse(event.data))
    }
    /*props.websocket.onmessage = event=>{
        console.log(event)
        setX(JSON.parse(event.data))
    };*/

    function rand() {
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const value = values[Math.floor(Math.random() * values.length)];
        return suit + value
    }
    return <div>
        {JSON.stringify(x)}
        <img src={Cards[rand()]}/>
        <img src={Cards[rand()]}/>
        <button onClick={()=>props.ws({a:new Date()})}>zxczxc</button>
    </div>;
}




