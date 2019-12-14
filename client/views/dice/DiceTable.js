import React, {useState} from 'react';
import UserAvatar from "client/components/UserAvatar";
import "./Dice.sass";
import {Button} from "reactstrap";
import {t} from "client/components/Translator"
import Loader from "client/components/Loader";
import StakeManage from "client/views/table/StakeManage";
import MakeBet from "client/views/dice/MakeBet";

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
            .then(res => {
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
        props.api(`/table/${table.id}/turn`)
            .then(res => {
                loadTable()
            })
    }

    function emojiDice(i) {
        const dices=['⚀','⚁','⚂','⚃','⚄','⚅'];
        return dices[i-1];
    }

    function lastTurn(player) {
        if (!table.currentRound) return;
        const turns = table.turns.filter(t => t.player === player && t.round === table.currentRound.id)
        const last = turns[turns.length - 1];
        if (!last) return '';
        return <span className={'dice'}>{last.data.dices.map((d, i) => <span key={i} className={`m-2`}>{emojiDice(d)}</span>)} = {last.data.dices.reduce((a, b) => a + b, 0)}</span>;
    }

    if (!table) return <Loader/>;
    const players = table.players.filter(p => p.id !== props.authenticatedUser.id);
    const player = table.players.find(p => p.id === props.authenticatedUser.id);
    const rounds = table.rounds;

    return <div className="Dice-table p-4">
        <div className="row">
            <div className="col-4">
                <h1>{lastTurn(props.authenticatedUser._id)}</h1>
            </div>
            <div className="col-4">
                Default bet {table.options.defaultBet}
                <hr/>
                <UserAvatar user={player} {...props}/>
                <MakeBet table={table} {...props}/>
            </div>
            <div className="col-4">
                <StakeManage table={table} {...props}/>
                {table.turn === props.authenticatedUser._id && <Button size={'lg'} color="primary" onClick={roll}>{t('Bet')}</Button>}
            </div>



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
                {rounds.map((r, i) => <div key={i} className={'row'}>
                    <div className="col">{i+1}.</div>
                    <div className="col">{r.winner}</div>
                    <div className="col">{r.sum}</div>
                </div>)}
            </div>
        </div>

    </div>;
}




