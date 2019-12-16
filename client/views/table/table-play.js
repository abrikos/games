import React, {useEffect, useState} from 'react';
import {t} from "client/components/Translator"
import {Button} from "reactstrap";
import {A, navigate} from "hookrouter";
import Loader from "client/components/Loader";
import GameNotLogged from "client/components/GameNotLogged";
import MyBreadCrumb from "client/components/MyBreadCrumb";
import PokerTable from "client/views/poker/PokerTable";

export default function TablePlay(props) {
    //const componentIsMounted = React.useRef(true);
    const [table, setTable] = useState({});
    //const { message } = React.useContext(props.Context);
    //props.onWsMessage(onWsMessage);

    //console.log('CONTEXT', message)

    useEffect(() => {
        if(props.message.id!==table.id) return;
        loadTable();
    }, [props.message]);

    function loadTable() {
        //if(!componentIsMounted.current) return;
        props.api('/table/' + props.id)
            .then(res => {
                if (!res) return navigate('/games');
                setTable(res)
            })
    }


    if (!table.id) return <Loader/>;
    if (!props.authenticatedUser) return <GameNotLogged game={table.game} {...props}/>;
    return <div>
        <MyBreadCrumb items={[{href: '/' + table.game, label: table.game}, {label: table.name}]}/>
        <h1>{t('Play')} {t(table.game)} "{table.name}"</h1>
        {table.game === 'Poker' && <PokerTable table={table} {...props}/>}
        {table.playerSite && <A href={`/table/${table.id}/${table.game}/leave`} className="btn btn-link">{t('Leave')}</A>}
    </div>;
}




