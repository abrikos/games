import React from 'react';
import TopMenu from "client/components/TopMenu";
import 'bootstrap/dist/css/bootstrap.css';
import {Alert} from "reactstrap";
import {A, useRoutes} from "hookrouter";
import routes from "client/games/filler/RoutesFiller";
import {t, changeLanguage} from "client/Translator";

export default function LayoutFiller(props) {
    const routeResult = useRoutes(routes(props));
    let {children, alert, ...rest} = props;
    const menuItems = [
        {label: 'Начало', path: '/'},

        /*{label: 'DropDown', items:[
                {label:'AAAAAAaa', path:'/contacts'},
                {label:'BBBB', path:'/about'},
            ]},*/
    ];
    return <div className={'content main'}>
        <TopMenu {...rest} items={menuItems} title={'Filler'}/>
        <Alert {...alert}/>
        <div className={'container'}>
            {routeResult}
        </div>
        <footer>

        </footer>
    </div>

}


