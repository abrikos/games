import React, {useEffect, useState} from 'react';
import {t} from "client/components/Translator"
import {Button} from "reactstrap";
import {navigate} from "hookrouter";
import TelegramLogin from "client/components/TelegramLogin";
import {Animated} from "react-animated-css";

export default function TableStart(props) {
    const [tables, setTables] = useState([])
    const [tableUpdated, setTableUpdated] = useState()
    props.onWsMessage(onWsMessage);

    useEffect(() => {
        reloadTables()
    }, [])

    function reloadTables() {
        props.api('/table/list/active/' + props.game)
            .then(setTables)
    }

    function onWsMessage(event) {
        const data = JSON.parse(event.data);
        if (props.game !== data.table.game) return;
        //console.log(event.data)
        setTableUpdated(data.table);
        setTimeout(() => setTableUpdated(null), 1000)
        reloadTables();

    }

    function startGame() {
        props.api('/table/create/' + props.game)
            .then(res => {
                navigate('/table/' + res.id)
            })
    }

    function joinTable(id) {
        props.api('/table/join/' + id)
            .then(res => {
                navigate('/table/' + id)
            })
    }

    function imNotIn(g) {
        return !imIn(g)
    }

    function imIn(g) {
        return g.players.includes(props.authenticatedUser._id);
    }

    function isTableUpdated(t) {
        return tableUpdated && t.id === tableUpdated.id
    }

    function table(rows) {
        return <table className="table-bordered tables-list">
            <thead>
            <tr>
                <th>{t('Name')}</th>
                <th>{t('Last activity')}</th>
                <th>{t('Players')}</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            {rows.map(g => <tr key={g.id} className={isTableUpdated(g) ? 'bg-secondary' : ''}>
                <td>{isTableUpdated(g) ? <Animated animationIn="rubberBand" animationOut="shake" isVisible={true}>
                    <div>{g.name}</div>
                </Animated> : g.name}</td>
                <td><small>{g.updated}</small></td>
                <td className="text-center">{g.players.length}</td>
                <td><Button onClick={() => joinTable(g.id)} color={isTableUpdated(g) ? 'primary' : 'success'}>{t('Play')}</Button></td>
            </tr>)}
            </tbody>
        </table>
    }

    if (!props.authenticatedUser) return <div>{t('To play this game please log in')} <TelegramLogin {...props}/></div>
    return <div>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css"/>

        <Button onClick={startGame} color={'primary'}>{t('Start new game')}</Button>
        <div className="d-flex justify-content-around">
            <div><strong>{t('I can join')} {table(tables.filter(imNotIn).filter(g => g.canJoin))}</strong></div>
            <div><strong>{t('I play')} {table(tables.filter(imIn))}</strong></div>
        </div>


    </div>;
}




