import React from "react";
import PlayCard from "client/components/PlayCard";

export default function PokerTest(props) {
    const [deck, setDeck] = React.useState( );
    React.useEffect(()=>{
        realod()
    },[]);

    function realod() {
        props.api('/poker/deck')
            .then(setDeck)
    }

    if(!deck) return <div/>
    console.log(deck.hands)
    return <div className="row">
        <div className="col">
        {deck.hands.map((h,i)=><div key={i}><PlayCard {...h.cards[0]}/><PlayCard {...h.cards[1]}/> {h.result.name} </div>)}
        </div>
        <div className="col">
            {deck.table.map((c,i)=><PlayCard key={i} {...c}/>)}
        </div>
        <button onClick={realod}>Reload</button>
        {/*{deck.result.combination.map((c,i)=><PlayCard key={i} {...c}/>)}*/}
    </div>
}
