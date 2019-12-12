import React, {useEffect, useState} from 'react';
import noUserImg from "client/images/nouser.png";
import blockedImg from "client/images/telegram-blocked.svg";

export default function UserAvatar(props) {

    const photo = props.telegramAvailable ? props.user.photo_url || noUserImg : blockedImg;
    return <div className={'user-avatar'}>
        <div className={'user-avatar-image'}><img src={photo} alt={props.user.first_name} title={props.user.first_name}/></div>
        <div className={'user-avatar-name'}>{props.user.first_name}</div>
    </div>;
}




