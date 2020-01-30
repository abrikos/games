import React, {useEffect, useState} from "react";
import {navigate} from "hookrouter";
import PlayCard from "client/components/PlayCard";
import Loader from "client/components/Loader";
import UserAvatarSvg from "client/poker/components/UserAvatarSvg";
import AccessDenied from "client/service/access-denied";
import {t} from "client/components/Translator";
import MyBreadCrumb from "client/components/MyBreadCrumb";
import * as Cards from "client/images/cards";
import SliderSvg from "client/poker/SliderSvg";
import ButtonSvg from "client/poker/components/ButtonSvg";
import PlayerSiteSvg from "client/poker/components/PlayerSiteSvg";
import configSvg from "./config-svg";

const WIDTH = configSvg.width;
const HEIGHT = WIDTH * 3 / 4;
const TABLE_RADIUS=(HEIGHT / 2)  * 3 / 4;


export default function PokerSvg(props) {


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


    function takeSite(id) {
        props.api(`/poker/${table.id}/join/site/${id}`)
    }


    function CardsOnHand(site) {
        //const flip = c=> props.TEST_MODE || site.player._id === props.authenticatedUser._id ? c : 'cover';
        return site.cards.map((c, i) => <PlayCard key={i} {...c}/>)
    }

    function CardsOnTable() {
        return table.ftrCards.map((c, i) => <PlayCard key={i} {...c}/>)
    }



    function coordinates(n, length) {
        const R = TABLE_RADIUS;
        const angle = (90 - 360 / length *  -n)  ;
        const x = R * Math.cos(angle* Math.PI / 180) + WIDTH / 2;
        const y = R * Math.sin(angle* Math.PI / 180) + HEIGHT / 2;
        return {x, y}
    }


    if (!table) return <Loader/>;
    if (!props.authenticatedUser) return <AccessDenied/>;


    return <div>
        <MyBreadCrumb items={[{href: '/poker', label: t('Poker')}, {label: table.name}]}/>
        <svg width={WIDTH} height={HEIGHT} style={{border: "1px solid red"}} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
            <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill={"#35654d"}/>

            <g transform={"translate(0,-100)"}>
            <circle cx={WIDTH/2} cy={HEIGHT/2} r={TABLE_RADIUS} opacity={.3} stroke={"#FF0000"} transform={`translate(40,50)`}/>

            {table.sites.map((s, i) =><g key={i}>
                <PlayerSiteSvg site={s} width={100} {...coordinates(i, table.sites.length)} takeSite={takeSite}/>
            </g>)}
            </g>

            <SliderSvg x={WIDTH - 100} y={50}/>
            <g transform={`translate(0,${HEIGHT - 50})`}>
                <ButtonSvg text={t('Leave')} onClick={()=>navigate(`/poker/${table.id}/leave`)} width={100} x={50}/>
            </g>

        </svg>
    </div>
}
