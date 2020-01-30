import React from 'react';
import UserAvatar from "client/components/UserAvatar";
import PlayCard from "client/components/PlayCard";
import PropTypes from "prop-types";

export default function PlayerSite(props){
    return <div>
        <UserAvatar user={props.site.player} size={props.size || 'sm'}/>
        {props.site.cards.map((c,i)=><PlayCard key={i} {...c}/>)}
    </div>
}

PlayerSite.propTypes = {
    site: PropTypes.object.isRequired,
    size: PropTypes.string,
};
