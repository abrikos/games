import React from 'react';
import {A, useRoutes} from "hookrouter";
export default function Home(props) {
    return <div>
        <a href='#' onClick={e=>props.setAlert({error:500, message:'TEST ALERT'})}>Alert</a>
    </div>

}


