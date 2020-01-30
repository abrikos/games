import React, {useState} from 'react';
import noUserImg from "client/images/nouser.png";
import blockedImg from "client/images/telegram-blocked.svg";
import PropTypes from "prop-types";

const FONT_SIZE = 16;

export default function UserAvatarSvg(props) {
    const [photo, setPhoto] = useState();


    const diameter = props.width || 70;
    if(!props.player) return <></>;
    //const photo = telegramAvailable ? props.props.player.photo_url || noUserImg : blockedImg;
    return <svg {...props}>
        <text x={diameter/2} y={diameter + FONT_SIZE + 5} fill="#FFFFFF" fontSize={FONT_SIZE} textAnchor="middle">
            {props.player.first_name}
        </text>

        <clipPath id="clipCircle">
            <circle r={diameter / 2} cx={diameter / 2} cy={diameter/2}/>
        </clipPath>
        <image href={photo || props.player.photo_url || noUserImg} alt={props.player.first_name} title={photo ? "Telegram blocked" : props.player.first_name} onError={e => setPhoto(blockedImg)} width={diameter} clipPath="url(#clipCircle)"/>


    </svg>
}


UserAvatarSvg.propTypes = {
    player: PropTypes.object.isRequired,
};


