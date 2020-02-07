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
    const [game, setGame] = useState();

    function emojiPoker(i) {
        const Pokers = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return Pokers[i - 1];
    }

    useEffect(() => {
        console.log(props.message)
        if (props.message && game && props.message.id !== game.table.id) return;
        loadTable();
    }, [props.message]);


    function loadTable() {
        //if(!componentIsMounted.current) return;
        props.apiAuth('/poker/' + props.id)
            .then(res => {
                //if (!res) return navigate('/games');
                setGame(res)
            })
    }


    if (!game) return <Loader/>;

    return <div>
        <MyBreadCrumb items={[{href: '/poker', label: t('Poker')}, {label: game.table.name}]}/>

        <div className="Poker-table p-4">

            {game.playerSite && <div className="row">
                <div className="col-8">
                    <h2><img src={pokerChip} alt={"poker chip"} className="poker-chip"/> Bank: {game.bank}</h2>
                </div>

            </div>}

            <hr/>
            <div className="row">
                <div className="col-8">
                    <PokerTable game={game} {...props}/>
                    {game.isMyTurn && <PokerBet game={game} {...props}/>}
                </div>
                <div className="col">
                    {!game.active && <h4>{t('Game finished')}</h4>}
                    {game.active && game.playerSite && <div className="col-4 bet-control text-center">
                        <h4>{game.playerSite.stake}</h4>
                        <div>
                            {game.playerSite && <div>
                                {!!game.mySumBets && <div className="current-bet">Bet: {game.mySumBets}</div>}
                                <A href={`/poker/${game.id}/leave`} className="btn btn-warning text-right">{t('Leave')}</A>
                            </div>}

                        </div>

                        <StakeManage table={game.table} {...props}/>
                    </div>}
                </div>
            </div>



            <div className={'my-bets'}>

            </div>

        </div>
    </div>;
}




