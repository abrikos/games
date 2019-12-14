import React, {useEffect, useState} from 'react';
import {t} from "client/components/Translator"
import {Button} from "reactstrap";
import {navigate} from "hookrouter";
import Loader from "client/components/Loader";
import GameNotLogged from "client/components/GameNotLogged";
import MyBreadCrumb from "client/components/MyBreadCrumb";
import DiceTable from "client/views/dice/DiceTable";

export default function TablePlay(props) {
    const [table, setTable] = useState();
    //props.onWsMessage(onWsMessage);

    useEffect(()=>{
        loadTable()
    },[]);

    function loadTable() {
        props.api('/table/' + props.id)
            .then(res=>{
                if(!res) return navigate('/games');
                setTable(res)
            })
    }

    /*function onWsMessage(event) {
        //console.log(event.data)
        const data = JSON.parse(event.data);
        if (table && table.game !== data.game) return;
        switch (data.action) {
            case 'join':
            //case 'create':
            case 'leave':
                loadTable()
                break;
            default:
        }
    }*/

    function leaveGame() {
        props.api('/table/leave/'+props.id)
            .then(res=>{
                navigate('/'+table.game);
            })
    }

    if(!table) return <Loader/>;
    if (!props.authenticatedUser) return <GameNotLogged game={table.game} {...props}/>;
    return <div>
        <MyBreadCrumb items={[{href: '/' + table.game, label: table.game},{label: table.name}]}/>
        <h1>{t('Play')} {t(table.game)} "{table.name}"</h1>
        {table.game==='Dice' && <DiceTable table={table} { ...props}/>}
        <Button onClick={leaveGame} color={'warning'}>{t('Leave table')}</Button>
    </div>;
}




