import React from "react";
import PlayCard from "client/components/PlayCard";

export default function PokerTest(props) {
    const [deck, setDeck] = React.useState( );
    React.useEffect(()=>{
        props.api('/poker/deck')
            .then(setDeck)
    },[]);

    if(!deck) return <div/>
    return <div>
        {deck.hand.map((c,i)=><PlayCard key={i} {...c}/>)}
        <hr/>
        {deck.table.map((c,i)=><PlayCard key={i} {...c}/>)}
        <hr/>
        <h3>{deck.result.name}</h3>

        {deck.result.combination.map((c,i)=><PlayCard key={i} {...c}/>)}
    </div>
}
