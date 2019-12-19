import React, {useEffect, useState} from 'react';
import {t} from "client/components/Translator"
import {Button, Input} from "reactstrap";
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMinus, faPlus} from "@fortawesome/free-solid-svg-icons";
import Loader from "client/components/Loader";
//import ToggleButton from 'react-toggle-button'

export default function StakeManage(props) {
    //const [site, setSite] = useState( null);
    const [withdraw, setWithdraw] = useState(false)
/*
    useEffect(() => {
        props.api(`/poker/${props.table.id}/site/player`)
            .then(setSite)

    }, [props.message])
*/

    function addStake(e) {
        e.preventDefault();
        const form = props.formToObject(e.target);
        props.api(`/poker/${props.table.id}/stake/change`, form)
            /*.then(res=>{
                setSite(res.site);
            })*/
    }
    const site = props.table.playerSite;
    if(!site) return <Loader/>
    return <div className="bet-interface">
        <div>{t('Balance')}: {site.player.balance}</div>
        <div>{t('Stake')}: {site.stake}</div>
        <form onSubmit={addStake} className="row">
            <div className="col-8"><Input name={"amount"} autoComplete={"off"} type="number" step="any" defaultValue={props.table.options.blind * 100}/></div>
            <input value={withdraw?-1:1} name="factor" hidden={true} readOnly/>
            {/*<InputSelect options={[{value:1, label: 'Add'},{value:-1, label:'Withdraw'}]} defaultValue={1} type={"radio"} onChange={console.log} name={"factor"}/>*/}
            <div className="col-2">
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
            <div className="col-2"><Button>{t('Go')}</Button></div>

        </form>

    </div>;
}




