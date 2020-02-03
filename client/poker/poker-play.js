import React, {useEffect, useState} from 'react';
import "client/poker/Poker.sass";
import {Button} from "reactstrap";
import {t} from "client/components/Translator"
import Loader from "client/components/Loader";
import {A, navigate} from "hookrouter";
import MyBreadCrumb from "client/components/MyBreadCrumb";
import pokerChip from "client/images/poker-chip.svg"
import PlayCard from "client/components/PlayCard";
import PokerBet from "client/poker/PokerBet";
import StakeManage from "client/poker/StakeManage";
import PokerTable from "client/poker/poker-table";

export default function PokerPlay(props) {
    const [table, setTable] = useState();

    function emojiPoker(i) {
        const Pokers = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return Pokers[i - 1];
    }

    useEffect(() => {
        if (props.message && table && props.message.id !== table.id) return;
        loadTable();
    }, [props.message]);


    function loadTable() {
        //if(!componentIsMounted.current) return;
        props.apiAuth('/poker/' + props.id)
            .then(res => {
                //if (!res) return navigate('/games');
                setTable(res)
            })
    }


    if (!table) return <Loader/>;

    return <div>
        <MyBreadCrumb items={[{href: '/poker', label: t('Poker')}, {label: table.name}]}/>

        <div className="Poker-table p-4">

            {table.playerSite && <div className="row">
                <div className="col-8">
                    <h2><img src={pokerChip} alt={"poker chip"} className="poker-chip"/> Bank: {table.bank}</h2>
                </div>

            </div>}

            <hr/>
            <div className="row">
                <div className="col-8">
                    <PokerTable table={table} {...props}/>
                    {table.isMyTurn && <PokerBet table={table} {...props}/>}
                </div>
                <div className="col">
                    {!table.active && <h4>{t('Game finished')}</h4>}
                    {table.active && table.playerSite && <div className="col-4 bet-control text-center">
                        <h4>{table.playerSite.stake}</h4>
                        <div>
                            {table.playerSite && <div>
                                {!!table.mySumBets && <div className="current-bet">Bet: {table.mySumBets}</div>}
                                <A href={`/poker/${table.id}/leave`} className="btn btn-warning text-right">{t('Leave')}</A>
                            </div>}

                        </div>

                        <StakeManage table={table} {...props}/>
                    </div>}
                </div>
            </div>



            <div className={'my-bets'}>

            </div>

        </div>
    </div>;
}




