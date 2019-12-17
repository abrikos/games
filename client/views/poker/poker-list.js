import React, {useEffect, useState} from 'react';
import {t} from "client/components/Translator"
import {Button, Input, Label} from "reactstrap";
import {A, navigate} from "hookrouter";
import {Animated} from "react-animated-css";
import GameNotLogged from "client/components/GameNotLogged";
import MyBreadCrumb from "client/components/MyBreadCrumb";
import InputSelect from "client/components/InputSelect";

export default function PokerList(props) {
    const [tables, setTables] = useState([]);
    const [options, setOptions] = useState([]);
    const [message, setMessage] = useState({});

    useEffect((x) => {
        if (props.message && !['join', 'leave', 'create'].includes(props.message.action) || props.message.game !== 'poker') return;
        if (props.message.action === 'create' && props.message.player === props.authenticatedUser._id) navigate('/poker/' + props.message.id);
        reloadTables();
        setMessage(props.message);
        setInterval(() => setMessage({}), 2000)
        return () => {
            console.log('will unmount', x);
        }
    }, [props.message]);

    useEffect(() => {
        reloadTables();
        props.api(`/poker/options`)
            .then(setOptions)
    }, [])

    function reloadTables() {
        console.log('RELOAD tables')
        props.api('/poker/list/active/')
            .then(setTables)
    }

    function startGame(e) {
        e.preventDefault();
        props.api('/poker/create/', props.formToObject(e.target))
            .then(res => {
                //navigate('/poker/' + res.id)
            })
    }

    function imNotIn(g) {
        return !imIn(g)
    }

    function imIn(g) {
        return g.sites.map(s => s.player).includes(props.authenticatedUser._id);
    }

    function isTableUpdated(t) {
        return message.id === t.id
    }

    function table(rows) {
        return <table className="table-bordered tables-list">
            <thead>
            <tr>
                <th>{t('Name')}</th>
                <th>{t('Last activity')}</th>
                <th>{t('Players')}</th>
                <th>{t('Bet')}</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            {rows.map(g => <tr key={g.id} className={isTableUpdated(g) ? 'bg-secondary' : ''}>
                <td>{isTableUpdated(g) ? <Animated animationIn="rubberBand" animationOut="shake" isVisible={true}>
                    <div>{g.name}</div>
                </Animated> : g.name}</td>
                <td><small>{g.updated}</small></td>
                <td className="text-center">{g.sitesActive.length} ({g.sites.length})</td>
                <td className="text-center">{g.options.defaultBet}</td>
                <td><A href={`/poker/${g.id}`} className="btn btn-primary">{t('View')}</A></td>
            </tr>)}
            </tbody>
        </table>
    }

    if (!props.authenticatedUser) return <GameNotLogged game={props.game} {...props}/>
    return <div>
        <MyBreadCrumb items={[{label: props.game}]}/>
        <h1>{props.game}. {t('List of tables')}</h1>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css"/>


        <div className="d-flex justify-content-around">
            <form onSubmit={startGame}>
                {options.map(option => <Option key={option.name} {...option}/>)}
                <Button color={'primary'}>{t('Start new game')}</Button>
            </form>
            <div><strong>{t('I can join')} {table(tables.filter(imNotIn).filter(g => g.canJoin))}</strong></div>
            <div><strong>{t('I play')} {table(tables.filter(imIn))}</strong></div>
        </div>
    </div>;
}


function Option(props) {
    function showValue(e) {
        const span = document.getElementById(`range-${e.target.name}`);
        span.innerText = e.target.value;
    }

    let control;
    switch (props.type) {
        case "range":
            control = <div><span id={`range-${props.name}`}>{props.default}</span> <input type="range" className="custom-range" min={props.min} max={props.max} name={props.name} onChange={showValue} defaultValue={props.default}/></div>;
            break;

        case "select":
            control = <InputSelect name={props.name} type={props.type} options={props.options.map(i => {
                return i.value ? i : {label: i, value: i}
            })} defaultValue={props.default.toString()}/>;
            break;
        default:
            control = <Input name={props.name} defaultValue={props.default} type={props.type} step={props.step}/>
    }

    return <div><Label>{typeof props.label === 'object' ? props.label : t(props.label)}</Label>{control}</div>

}

