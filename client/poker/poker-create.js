import React, {useEffect, useState} from "react";
import {Button, Input, Label} from "reactstrap";
import {t} from "client/components/Translator";
import InputSelect from "client/components/InputSelect";
import {navigate} from "hookrouter";

export default function PokerCreate(props) {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        props.api(`/poker/options`)
            .then(setOptions)
    }, [])

    function startGame(e) {
        e.preventDefault();
        props.apiAuth('/table/create/poker', props.formToObject(e.target))
            .then(res => {
                console.log(res)
                //navigate('/poker/' + res.id)
            })
    }

    return <form onSubmit={startGame}>
        {options.map(option => <Option key={option.name} {...option}/>)}
        <Button color={'primary'}>{t('Start new game')}</Button>
    </form>

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

