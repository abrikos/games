import React, {useEffect, useState} from "react";
import {navigate} from "hookrouter";
import PlayCard from "client/components/PlayCard";
import Loader from "client/components/Loader";
import UserAvatarSvg from "client/components/UserAvatarSvg";
import AccessDenied from "client/service/access-denied";
import {t} from "client/components/Translator";
import MyBreadCrumb from "client/components/MyBreadCrumb";
import * as Cards from "client/images/cards";
import SliderSvg from "client/components/SliderSvg";

export default function PokerSvg(props) {
    const width = 1200;
    const height = 800;

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
        return site.cards.map((c, i) => <PlayCard key={i} {...c}/>)
    }

    function CardsOnTable() {
        return table.ftrCards.map((c, i) => <PlayCard key={i} {...c}/>)
    }



    function coordinates(n, length) {
        const R = 300;
        const angle = (90 - 360 / length *  -n)  ;
        const x = R * Math.cos(angle* Math.PI / 180) + width / 2;
        const y = R * Math.sin(angle* Math.PI / 180) + height / 2;
        console.log(angle, Math.cos(angle), {x, y})
        return {x, y}
    }


    if (!table) return <Loader/>;
    if (!props.authenticatedUser) return <AccessDenied/>;

    console.log(table.sites)

    return <div>
        <MyBreadCrumb items={[{href: '/poker', label: t('Poker')}, {label: table.name}]}/>
        <svg width={width} height={height} style={{border: "1px solid red"}} viewBox={`0 0 ${width} ${height}`}>
            <rect x={0} y={0} width={width} height={height} fill={"#35654d"}/>

            <g transform={"translate(0,-50)"}>
            <circle cx={width/2} cy={height/2} r={300} opacity={.3} stroke={"#FF0000"}/>

            {table.sites.map((s, i) =><g transform={"translate(-50,-50)"} key={i}>{s.player ?
                <UserAvatarSvg site={s}  width={200} {...coordinates(i, table.sites.length)}/> :<rect {...coordinates(i, table.sites.length)} width={50} height={50}/>}
            </g>)}
            </g>

            <SliderSvg x={40} y={50}/>
        </svg>
    </div>
}
