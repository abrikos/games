import React, {useEffect, useState} from 'react';
import {t} from "client/components/Translator"
import {A, navigate} from "hookrouter";
import {Animated} from "react-animated-css";
import MyBreadCrumb from "client/components/MyBreadCrumb";
import PokerCreate from "client/poker/poker-create";
import Loader from "client/components/Loader";
import TelegramLogin from "client/components/TelegramLogin";

export default function PokerList(props) {
    const [tables, setTables] = useState([]);

    const [message, setMessage] = useState({});
    const [tableUpdated, setTableUpdated] = useState(false);

    useEffect((x) => {
        console.log('Message')
        if (props.message && !['join', 'leave', 'create'].includes(props.message.action) || props.message.game !== 'poker') return;
        console.log(props.message.player , props.authenticatedUser)
        if (props.message.action === 'create' && props.message.player === props.authenticatedUser._id) navigate('/poker/' + props.message.id);
        reloadTables();
        setTableUpdated(props.message.id);
        setTimeout(() => setTableUpdated(null), 2000)
        return () => {
            console.log('will unmount', x);
        }
    }, [props.message]);

    useEffect(() => {
        reloadTables();
    }, [])

    function reloadTables() {
        console.log('RELOAD tables')
        props.api('/table/list/poker')
            .then(setTables)
    }

    function imNotIn(g) {
        return !imIn(g)
    }

    function imIn(g) {
        return g.players.includes(props.authenticatedUser._id);
    }

    function isTableUpdated(t) {
        return tableUpdated === t.id
    }

    function table(rows) {
        return <table className="table-bordered tables-list">
            <thead>
            <tr>
                <th>{t('Name')}</th>
                <th>{t('Last activity')}</th>
                <th>{t('Players')}</th>
                <th>{t('Blinds')}</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            {rows.map(g => <tr key={g.id} className={isTableUpdated(g) ? 'bg-secondary' : ''}>
                <td>{isTableUpdated(g) ? <Animated animationIn="rubberBand" animationOut="shake" isVisible={true}>
                    <div>{g.name}</div>
                </Animated> : g.name}</td>
                <td><small>{g.updated}</small></td>
                <td className="text-center">{g.sites.length} ({g.maxPlayers})</td>
                <td className="text-center">{g.options.blind}/{g.options.blind * 2}</td>
                <td><A href={`/poker/${g.id}`} className="btn btn-primary">{t('View')}</A></td>
            </tr>)}
            </tbody>
        </table>
    }

    //if (!props.authenticatedUser) return <GameNotLogged game={props.game} {...props}/>
    if(!tables) return <Loader/>;
    return <div>
        <MyBreadCrumb items={[{label: t('Poker')}]}/>
        <h1>{t('List of tables')}</h1>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css"/>


        <div className="d-flex justify-content-around">

            <div><strong>{t('I can join')} {table(tables)}</strong></div>
            {props.authenticatedUser ? <PokerCreate {...props}/> : <TelegramLogin {...props}/> }
            {/*<div><strong>{t('I play')} {table(tables.filter(imIn))}</strong></div>*/}
        </div>
    </div>;
}


