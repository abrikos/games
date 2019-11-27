import React from 'react';
import TopMenu from "client/components/TopMenu";
import 'bootstrap/dist/css/bootstrap.css';
import 'client/main/main.sass';
import {Alert} from "reactstrap";
import {A, useRoutes} from "hookrouter";
import routes from "./RoutesMain";
import {t, changeLanguage} from "client/Translator";

export default function LayoutMain(props) {
    const routeResult = useRoutes(routes(props));
    let {children, alert, ...rest} = props;
    const menuItems = [
        {label: 'Начало', path: '/'},
        {label: "Портфолио", path: '/portfolio'},
        {label: "Контакты", path: '/contacts'},

        /*{label: 'DropDown', items:[
                {label:'AAAAAAaa', path:'/contacts'},
                {label:'BBBB', path:'/about'},
            ]},*/
    ];
    return <div className={'content main'}>
        <TopMenu {...rest} items={menuItems} title={'Abrikos'}/>
        <Alert {...alert}/>
        <div className={'container'}>
            {routeResult}
        </div>
        <footer>

        </footer>
    </div>

}


