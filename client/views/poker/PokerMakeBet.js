import React, {useEffect, useState} from 'react';
import {t} from "client/components/Translator"
import {Button, Input} from "reactstrap";
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMinus, faPlus} from "@fortawesome/free-solid-svg-icons";
//import ToggleButton from 'react-toggle-button'

export default function PokerMakeBet(props) {
    const [site, setSite] = useState(props.table.playerSite);

    function showValue(e){
        const span = document.getElementById(`rise-amount`);
        span.innerText = e.target.value;
    }

    function rise(e) {
        console.log(e.target.value)
    }

    return <div className="bet-interface">
        <Button color={'success'}>{t('Call')}</Button>
        <Button>{t('Check')}</Button>
        <Button color="warning">{t('Fold')}</Button>
        <hr/>
        <div>{t('Rise')}: <span id={`rise-amount`}>{props.table.options.blind * 2}</span>
            <input type="range" className="custom-range" min={props.table.options.blind * 2} max={site.stake} name={props.name} onChange={showValue} defaultValue={props.table.options.blind * 2} onMouseUp={rise}/>
        </div>
    </div>;
}




