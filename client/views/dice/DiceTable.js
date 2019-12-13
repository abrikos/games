import React, {useEffect, useState} from 'react';
import UserAvatar from "client/components/UserAvatar";
import "./Dice.sass";
import {Button} from "reactstrap";
import {t} from "client/components/Translator"
import Loader from "client/components/Loader";

export default function DiceTable(props) {

    const [table, setTable] = useState(props.table);
    props.onWsMessage(onWsMessage);

    /*useEffect(() => {
        console.log(props.table.rounds)
        console.log(props.table.players)
        setTable(props.table)
    }, []);*/

    function loadTable() {
        props.api('/table/' + props.id)
            .then(res=>{
                setTable(res)
            })
    }

    function onWsMessage(event) {
        const data = JSON.parse(event.data);
        console.log(data)
        if (data.game !== table.game && data.id !== table.id) return;
        loadTable()
    }

    function roll() {
        props.api('/table/turn/Dice/' + table.id)
            .then(res => {
                loadTable()
            })
    }

    function lastTurn(player) {
        const round = table.rounds[table.rounds.length - 1];
        if (!round) return;
        const turns = round.turns.filter(t => t.player === player)
        const last = turns.length - 1;
        if (!turns[last]) return '';
        return <span>{turns[last].dices && turns[last].dices.map((d, i) => <span key={i} className={`dice p-2`}>{d}</span>)}</span>;
    }

    if (!table) return <Loader/>;
    const players = table.players.filter(p => p.id !== props.authenticatedUser.id);
    const player = table.players.find(p => p.id === props.authenticatedUser.id);
    const rounds = table.rounds;

    return <div className="Dice-table p-4">
        <button onClick={()=>props.api('/table/test-websocket')}>TEST</button>
        <div className="text-center">
            <UserAvatar user={player} {...props}/>
            {lastTurn(props.authenticatedUser._id)}
            {table.turn === props.authenticatedUser._id && <Button onClick={roll}>{t('Roll')}</Button>}
        </div>

        <hr/>
        <div className="row">
            <div className="col">
                {players.map(p => <div key={p.id} className="row">
                    <div className="col"><UserAvatar user={p} size="sm" {...props}/></div>
                    <div className="col">{lastTurn(p._id)}</div>

                </div>)}
            </div>
            <div className="col">
                {rounds.map((r,i)=><div key={i} className={'row'}>
                    <div className="col">{JSON.stringify(r)}</div>
                    <div className="col">{i} {r.winner}</div>
                    <div className="col">{r.sum}</div>
                </div>)}
            </div>
        </div>

    </div>;
}




