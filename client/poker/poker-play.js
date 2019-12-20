import React, {useEffect, useState} from 'react';
import UserAvatar from "client/components/UserAvatar";
import "client/poker/Poker.sass";
import {Button} from "reactstrap";
import {t} from "client/components/Translator"
import Loader from "client/components/Loader";
import StakeManage from "client/poker/StakeManage";
import PokerBet from "client/poker/PokerBet";
import * as Cards from "client/images/cards"
import {A, navigate} from "hookrouter";
import MyBreadCrumb from "client/components/MyBreadCrumb";
import pokerChip from "client/images/poker-chip.svg"
import PlayCard from "client/components/PlayCard";
import PokerSvg from "client/poker/poker-svg";

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
        props.api('/poker/' + props.id)
            .then(res => {
                if (!res) return navigate('/games');
                setTable(res)
            })
    }


    function joinTable(id) {
        props.api(`/poker/${table.id}/join/site/${id}`)
    }


    function CardsOnHand(site) {
        //const flip = c=> props.TEST_MODE || site.player._id === props.authenticatedUser._id ? c : 'cover';
        return site.cards.map((c,i)=><PlayCard key={i} {...c}/>)
    }

    function CardsOnTable() {
        return table.ftrCards.map((c,i)=><PlayCard key={i} {...c}/>)
    }


    if (!table) return <Loader/>;
    const sites = table.sites.filter(p => !p.player || p.player && p.player._id !== props.authenticatedUser._id);
    const mySite = table.sites.find(p => p.player && p.player._id === props.authenticatedUser._id);

    return <div>
        <MyBreadCrumb items={[{href: '/poker', label: t('Poker')}, {label: table.name}]}/>

        <div className="Poker-table p-4">

            {mySite && <div className="row">
                <div className="col-8">
                    <h2><img src={pokerChip} alt={"poker chip"} className="poker-chip"/> {table.potSum}</h2>
                    <CardsOnTable />
                </div>
                <div className="col-4 bet-control text-center">
                    <UserAvatar user={mySite.player} {...props}/>
                    <h4>{table.playerSite.stake}</h4>
                    <div>
                        {table.playerSite && <div>

                            <CardsOnHand {...table.playerSite}/>
                            {!!table.mySumBets && <div className="current-bet">Bet: {table.mySumBets}</div>}
                        </div>}

                    </div>
                    {table.isMyTurn && <PokerBet table={table} {...props}/>}
                    <StakeManage table={table} {...props}/>
                </div>
                {table.playerSite && <A href={`/poker/${table.id}/leave`} className="btn btn-warning text-right">{t('Leave')}</A>}
            </div>}

            <hr/>
            <div className="row">
                <div className="col sites-list">
                    {sites.map((s, i) => <div key={i}>
                        {s.player ? <div>
                            <UserAvatar user={s.player} {...props} size="sm"/>
                            <strong>{s.stake}</strong>
                            <CardsOnHand {...s}/>
                        </div> : <div>
                            {mySite ? 'Empty' : <Button onClick={() => joinTable(s._id)} color="success">{t('Sit here')}</Button>}
                        </div>}

                    </div>)}

                </div>
                <div className="col">

                </div>
            </div>

        </div>
    </div>;
}




