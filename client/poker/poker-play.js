import React, {useEffect, useState} from 'react';
import "client/poker/Poker.sass";
import {Button} from "reactstrap";
import {t} from "client/components/Translator"
import Loader from "client/components/Loader";
import {A, navigate} from "hookrouter";
import MyBreadCrumb from "client/components/MyBreadCrumb";
import pokerChip from "client/images/poker-chip.svg"
import PlayCard from "client/components/PlayCard";
import PlayerSite from "client/poker/components/PlayerSite";
import PokerBet from "client/poker/PokerBet";
import StakeManage from "client/poker/StakeManage";

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


    function CardsOnTable() {
        return table.ftrCards.map((c, i) => <PlayCard key={i} {...c}/>)
    }

    function coordinates(n) {
        const length = table.sites.length;
        const R = 300;
        const angle = (90 - 360 / length * -n);
        const x = R * Math.cos(angle * Math.PI / 180) + R;
        const y = R * Math.sin(angle * Math.PI / 180);
        return {x, y}
    }

    function Site(props) {
        const index = arrangeSites(props.index);
        const site = table.sites[index];
        //return <div>{props.index} - {index} - {site.position}</div>
        return <div>
            {site.player ? <PlayerSite site={site}/>
                :
                mySite ?
                    'Empty'
                    :
                    <Button onClick={() => joinTable(site._id)} color="success">{t('Sit here')}</Button>
            }
        </div>
    }

    function arrangeSites(index) {
        let newIndex;
        if (table.playerSite) {
            newIndex = index +  table.playerSite.position;
            if(newIndex>=table.sites.length) newIndex -=table.sites.length;
        }
        console.log(index, newIndex)
        return newIndex;

    }

    if (!table) return <Loader/>;
    const mySite = table.sites.find(p => p.player && p.player._id === props.authenticatedUser._id);
    const middleSitesIdx = [];
    for(let i = 2; i < table.sites.length - 1; i++){
        middleSitesIdx.push(i)
    }

    return <div>
        <MyBreadCrumb items={[{href: '/poker', label: t('Poker')}, {label: table.name}]}/>

        <div className="Poker-table p-4">

            {mySite && <div className="row">
                <div className="col-8">
                    <h2><img src={pokerChip} alt={"poker chip"} className="poker-chip"/> {table.potSum}</h2>
                    <CardsOnTable/>
                </div>

            </div>}

            <hr/>

            <table>
                <tbody>
                <tr>
                    <td></td>
                    <td className="d-flex justify-content-around">{middleSitesIdx.map(i=><Site key={i} index={i}/>)}</td>
                    <td></td>
                </tr>
                <tr>
                    <td><Site index={1}/></td>
                    <td style={{width:600, height:600}} className="text-center">
                        CARDS
                    </td>
                    <td><Site index={table.sites.length - 1}/></td>
                </tr>
                <tr>
                    <td></td>
                    <td className="d-flex justify-content-center align-content-center"><Site index={0}/></td>
                    <td></td>
                </tr>
                </tbody>
            </table>

            <div className={'my-bets'}>
                {table.playerSite && <div className="col-4 bet-control text-center">
                    <h4>{table.playerSite.stake}</h4>
                    <div>
                        {table.playerSite && <div>
                            {!!table.mySumBets && <div className="current-bet">Bet: {table.mySumBets}</div>}
                            <A href={`/poker/${table.id}/leave`} className="btn btn-warning text-right">{t('Leave')}</A>
                        </div>}

                    </div>
                    {table.isMyTurn && <PokerBet table={table} {...props}/>}
                    <StakeManage table={table} {...props}/>
                </div>}
            </div>

        </div>
    </div>;
}




