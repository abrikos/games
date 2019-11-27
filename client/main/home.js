import React from 'react';
import {A, useRoutes} from "hookrouter";
import logo from "client/images/logo.png";
export default function Home(props) {
    return <div className={'text-center'}>
        <div className={'p-3 m-3'}>
        <img src={logo} alt={'logo'} className={'img-fluid w-25'}/>
        </div>
    </div>

}


