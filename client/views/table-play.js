import React, {useEffect, useState} from 'react';
import {t} from "client/components/Translator"
import {Button} from "reactstrap";
import {navigate} from "hookrouter";
import * as Games from "client/views/Games"
import Loader from "client/components/Loader";
import GameNotLogged from "client/components/GameNotLogged";

export default function TablePlay(props) {
    const [table, setTable] = useState();
    props.onWsMessage(onWsMessage);

    useEffect(()=>{
        loadTable()
    },[])

    function loadTable() {
        props.api('/table/' + props.id)
            .then(res=>{
                setTable(res)
            })
    }

    function onWsMessage(event) {
        //console.log(event.data)
        const data = JSON.parse(event.data);
        if (table && table.game !== data.table.game) return;
        switch (data.action) {
            case 'join':
            //case 'create':
            case 'leave':
                loadTable()
                break;
            default:
        }
    }

    function leaveGame() {
        props.api('/table/leave/'+props.id)
            .then(res=>{
                navigate('/'+table.game);
            })
    }

    if (!props.authenticatedUser) return <GameNotLogged game={props.game} {...props}/>;
    if(!table) return <Loader/>;
    return <div>
        <h1>{t('Play')} {t(table.game)} "{table.name.replace(/^./, table.name[0].toUpperCase())}"</h1>
        {Games[table.game]({table, ...props})}
        <Button onClick={leaveGame} color={'warning'}>{t('Leave table')}</Button>
    </div>;
}




