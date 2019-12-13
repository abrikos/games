import React, {useEffect, useState} from 'react';
import noUserImg from "client/images/nouser.png";
import blockedImg from "client/images/telegram-blocked.svg";

export default function UserAvatar(props) {
    const [telegramAvailable, setTelegramAvailable] = useState(false)
    function isAvailable(){
        const timeout = new Promise((resolve, reject) => {
            setTimeout(reject, 400, 'Request timed out');
        });

        const request = fetch('https://t.me', {mode: 'no-cors'});

        return Promise
            .race([timeout, request])
            .then(response => {
                console.log('TELEGRAM AVAIL');
                setTelegramAvailable(true)
            })
            .catch(error => setTelegramAvailable(false));
    };
    useEffect(()=>{isAvailable()},[])

    if(!props.user) return <></>;
    const photo = telegramAvailable ? props.user.photo_url || noUserImg : blockedImg;
    return <div className={'user-avatar '+props.size}>
        <div className={'user-avatar-image'}><img src={photo} alt={props.user.first_name} title={props.user.first_name}/></div>
        <div className={'user-avatar-name'}>{props.user.first_name}</div>
    </div>;
}




