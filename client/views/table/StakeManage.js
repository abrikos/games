import React, {useEffect, useState} from 'react';
import {t} from "client/components/Translator"
import {Button, Input} from "reactstrap";
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMinus, faPlus} from "@fortawesome/free-solid-svg-icons";
//import ToggleButton from 'react-toggle-button'

export default function StakeManage(props) {
    const [balance, setBalance] = useState({})
    const [stake, setStake] = useState(props.table.sites.find(s => s.player === props.authenticatedUser._id))
    const [withdraw, setWithdraw] = useState(false)
    useEffect(() => {
        props.api('/cabinet/balance/').then(setBalance)

    }, [])

    function addStake(e) {
        e.preventDefault();
        const form = props.formToObject(e.target);
        props.api(`/table/${props.table.id}/change-stake`, form)
            .then(res=>{
                setStake(res.stake);
                setBalance(res.balance)
            })
        console.log(form)
    }


    return <div className="bet-interface">
        <div>{t('Balance')}: {balance.amount}</div>
        <div>{t('Stake')}: {stake.amount}</div>
        <form onSubmit={addStake}>

            <Input name={"amount"} autoComplete={"off"} type="number" step="any" defaultValue={props.table.options.blind * 100}/>
            <input value={withdraw?-1:1} name="factor" hidden={true}/>
            {/*<InputSelect options={[{value:1, label: 'Add'},{value:-1, label:'Withdraw'}]} defaultValue={1} type={"radio"} onChange={console.log} name={"factor"}/>*/}
            <div>
                <BootstrapSwitchButton
                    checked={!withdraw}
                    onlabel={<FontAwesomeIcon icon={faPlus}/>}
                    offlabel={<FontAwesomeIcon icon={faMinus}/>}
                    onstyle='success'
                    offstyle='danger'
                    //style='w-100 mx-3'
                    onChange={(checked) => {
                        setWithdraw(!checked)
                    }}
                />
                {withdraw ? t('Withdraw') : t('Add')}
            </div>
            <Button>{t('Go')}</Button>
        </form>

    </div>;
}




