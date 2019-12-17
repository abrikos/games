import React, {useState} from 'react';
import UserAvatar from "client/components/UserAvatar";
import "./Poker.sass";
import {Button} from "reactstrap";
import {t} from "client/components/Translator"
import Loader from "client/components/Loader";
import StakeManage from "client/views/poker/StakeManage";
import PokerMakeBet from "client/views/poker/MakeBet";

export default function PokerSites(props) {
    const [sites, setSites] = useState(props.table.sites);
    props.onWsMessage(onWsMessage);

    function onWsMessage(event) {
        const data = JSON.parse(event.data);
        console.log(data)
        //if (data.game !== table.game && data.id !== table.id) return;
        //loadTable()
    }

    function getUser(id) {
        return props.table.players.find(p=>p._id===id)
    }

    return(
        <div className="row">
            <div className="col">
                {sites.map(p => <div key={p.id} className="row">
                    <div className="col"><UserAvatar user={getUser(p.player)} size="sm" {...props}/></div>


                </div>)}
            </div>
        </div>
    )


}




