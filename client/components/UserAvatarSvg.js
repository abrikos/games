import React, {useState} from 'react';
import noUserImg from "client/images/nouser.png";
import blockedImg from "client/images/telegram-blocked.svg";
import PropTypes from "prop-types";
import * as Cards from "client/images/cards";

export default function UserAvatarSvg(props) {
    const [photo, setPhoto] = useState();

    if (!props.site) return <></>;
    const user = props.site.player;
    const radius = 70;

    //const photo = telegramAvailable ? props.user.photo_url || noUserImg : blockedImg;
    return <svg {...props}>
        <clipPath id="clipCircle">
            <circle r={radius/2} cx={radius} cy={radius * 2.5 - 20}/>
        </clipPath>
            {props.site.cards.map((c,i)=><image key={i} href={Cards[c.suit+c.value]} x={i*radius} y="0" width={radius} />)}
            <image href={photo || user.photo_url || noUserImg} alt={user.first_name} title={photo ? "Telegram blocked" : user.first_name} onError={e => setPhoto(blockedImg)} width={radius} height={radius} clipPath="url(#clipCircle)" x={radius/2} y={radius * 2 - 20}/>
            <text x={radius} y={120} fill="#FFFFFF" fontSize={16} textAnchor="middle">
                name: {user.first_name}
            </text>
    </svg>
}


UserAvatarSvg.propTypes = {
    user: PropTypes.object.isRequired,
    size: PropTypes.string,
};


