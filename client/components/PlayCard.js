import * as Cards from "client/images/cards";
import React from "react";

export default function PlayCard(props) {
    const name= props.suit ? props.suit + props.value : 'cover';
    return <img className="play-card" src={Cards[name]} alt={name}/>
}
