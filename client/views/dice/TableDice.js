import React, {useEffect, useState} from 'react';
import {t} from "client/components/Translator"
import {Button} from "reactstrap";
import {navigate} from "hookrouter";
import UserAvatar from "client/components/UserAvatar";

export default function TableDice(props) {
/*
    const [table, setTable] = useState();
    props.onWsMessage(onWsMessage);

    useEffect(()=>{
        props.api('/table/' + props.id)
            .then(res=>{
                setTable(res)
            })
    },[])

    function onWsMessage(event) {
        console.log(event.data)
    }
*/

    return <div>
        {JSON.stringify(props.table)}
        {props.table.players.map(p=><div key={p.id}><UserAvatar user={p} {...props}/></div>)}
    </div>;
}




