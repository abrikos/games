import React from "react";
import {Button} from "reactstrap";
import {t} from "client/components/Translator";
import UserAvatar from "client/components/UserAvatar";
import PlayCard from "client/components/PlayCard";

export default function PokerTable(props) {
    const table = props.table;

    function joinTable(id) {
        props.api(`/poker/${table.id}/join/site/${id}`)
    }

    function Site(props) {
        const index = arrangeSites(props.index);
        const site = table.sites[index];
        const bets = table.sitesBetSum.find(s=>s.site===site._id);
        //return <div>{props.index} - {index} - {site.position}</div>
        return <div>
            {site.player ? <div>

                    Bet: {bets ? bets.sum: 0}
                    {props.index===0 && site.result && site.result.name}
                    <UserAvatar user={site.player} size={'sm'}/>
                    {site.cards.map((c,i)=><PlayCard key={i} {...c}/>)}
                </div>
                :
                table.playerSite ?
                    'Empty'
                    :
                    <Button onClick={() => joinTable(site._id)} color="success">{t('Sit here')}</Button>
            }
        </div>
    }

    function arrangeSites(index) {
        let newIndex = index;
        if (table.playerSite) {
            newIndex = index +  table.playerSite.position;
            if(newIndex>=table.sites.length) newIndex -=table.sites.length;
        }
        return newIndex;

    }

    const middleSitesIdx = [];
    for(let i = 2; i < table.sites.length - 1; i++){
        middleSitesIdx.push(i)
    }
    return <table>
        <tbody>
        <tr>
            <td></td>
            <td className="d-flex justify-content-around">{middleSitesIdx.map(i=><Site key={i} index={i}/>)}</td>
            <td></td>
        </tr>
        <tr>
            <td><Site index={1}/></td>
            <td style={{width:600, height:200}} className="text-center">
                {table.ftrCards.map((c, i) => <PlayCard key={i} {...c}/>)}
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

}
