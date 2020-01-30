import React from 'react';
import PropTypes from "prop-types";
import * as Cards from "client/images/cards";
import UserAvatarSvg from "client/poker/components/UserAvatarSvg";
import {t} from "client/components/Translator";
import ButtonSvg from "client/poker/components/ButtonSvg";


export default function PlayerSiteSvg(props) {
    const {takeSite, ...bounds} = props;
    console.log(props.site.cards)
    //const photo = telegramAvailable ? props.user.photo_url || noUserImg : blockedImg;
    return <svg {...bounds}>


        {props.site.player ? <g>
                {props.site.cards.map((c, i) => <image key={i} href={Cards[c.suit + c.value]} x={i * 40} y="0" width={40}/>)}
                <UserAvatarSvg player={props.site.player} width={props.width}/>
            </g>
            :
            <ButtonSvg text={t('Sit here')} onClick={takeSite} width={100}/>}
    </svg>
}


PlayerSiteSvg.propTypes = {
    site: PropTypes.object.isRequired,
};


