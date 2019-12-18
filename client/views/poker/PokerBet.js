import React, {useState} from 'react';
import {t} from "client/components/Translator"
import {Button} from "reactstrap";
//import ToggleButton from 'react-toggle-button'

export default function PokerBet(props) {
    //const [site, setSite] = useState(props.table.playerSite);
    const maxBetValue = props.table.maxBet;
    const currentBetValue = props.table.mySumBets;
    const [riseValue, setRiseValue] = useState(maxBetValue - currentBetValue + 1);

    function showValue(e){
        //const span = document.getElementById(`rise-amount`);
        //span.innerText = e.target.value;
        setRiseValue(e.target.value *1 )
    }

    function rise(e) {
        bet(riseValue);
    }

    function fold() {
        props.api(`/poker/${props.table.id}/fold`)
    }

    function call() {
        bet(maxBetValue - currentBetValue)
    }

    function check() {
        bet(0);
    }

    function bet(bet) {
        props.api(`/poker/${props.table.id}/bet`,{bet})
    }

    return <div className="bet-interface">
        <Button color={'success'} disabled={maxBetValue<currentBetValue} onClick={call}>{t('Call')} {maxBetValue - currentBetValue}</Button>
        <Button disabled={maxBetValue!==currentBetValue} onClick={check}>{t('Check')}</Button>
        <Button color="warning" onClick={fold}>{t('Fold')}</Button>
        <hr/>
        <div>
            <input type="range" className="custom-range" min={maxBetValue - currentBetValue + 1} max={props.table.playerSite.stake} name={props.name} onChange={showValue} defaultValue={props.table.options.blind * 2}/>
            <Button color="danger" onClick={rise}>{t('Rise')} {riseValue}</Button>
        </div>
    </div>;
}




