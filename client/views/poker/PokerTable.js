import React, {useEffect, useState} from 'react';
import UserAvatar from "client/components/UserAvatar";
import "./Poker.sass";
import {Button} from "reactstrap";
import {t} from "client/components/Translator"
import Loader from "client/components/Loader";
import StakeManage from "client/views/table/StakeManage";
import PokerBet from "client/views/poker/PokerBet";
import * as Cards from "client/images/cards"


export default function PokerTable(props) {
    const table = props.table;

    function emojiPoker(i) {
        const Pokers = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return Pokers[i - 1];
    }

    function joinTable(id) {
        props.api(`/table/${table.id}/join/site/${id}`)
    }

    function CardImages(site) {
        return site.data ? <span>
            <img className="poker-card" src={Cards[site.data.c1 || 'cover']} alt="Cover"/>
                        <img className="poker-card" src={Cards[site.data.c2 || 'cover']} alt="Cover"/>
        </span> : <span/>
    }

    if (!table) return <Loader/>;
    const sites = table.sites.filter(p => !p.player || p.player && p.player._id !== props.authenticatedUser._id);
    const mySite = table.sites.find(p => p.player && p.player._id === props.authenticatedUser._id);

    return <div className="Poker-table p-4">
        {mySite && <div className="row">
            <div className="col-4">

            </div>
            <div className="col-4 bet-control">
                Default bet {table.options.defaultBet}
                <hr/>
                <UserAvatar user={mySite.player} {...props}/>
                <div>
                    {table.playerSite && <div>
                        <CardImages {...table.playerSite}/>
                        {table.playerBet && <div className="current-bet">Bet: {table.playerBet.value}</div>}
                    </div>}

                </div>


                {table.playerSite.turn && table.playerBet && <PokerBet table={table} {...props}/>}
            </div>
            <div className="col-4">
                <StakeManage table={table} {...props}/>
            </div>
        </div>}

        <hr/>
        <div className="row">
            <div className="col sites-list">
                {sites.map((s, i) => <div key={i}>
                    {s.player ? <div>
                        <UserAvatar user={s.player} {...props} size="sm"/>
                        <strong>{s.stake}</strong>
                        <CardImages {...s}/>
                    </div> : <div>
                        {mySite ? 'Empty' : <Button onClick={() => joinTable(s._id)} color="success">{t('Sit here')}</Button>}
                    </div>}

                </div>)}

            </div>
            <div className="col">

            </div>
        </div>

    </div>;
}




